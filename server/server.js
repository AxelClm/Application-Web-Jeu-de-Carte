var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var ent = require('ent');
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var sharedsession = require("express-socket.io-session");
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bdd = require('./db.js');
var md5 = require('md5');
var AsyncLock = require('async-lock');
var lock = new AsyncLock();
app.use(express.static(__dirname + '\\files'));
app.use(session);
io.use(sharedsession(session));
app.get("/login",function(req,res){
	res.render('login.ejs',{error : 0});
});
app.post("/login",urlencodedParser,function(req,res){
		var name = req.body.nameUser;
		var password = req.body.password;
	if (typeof(name) == typeof("str") && typeof(password) == typeof("str")){
		name = ent.encode(req.body.nameUser);
		password = md5(req.body.password);
		bdd.searchNamePass(name,password).then(function(resolve){
			if(resolve.length != 0){
				req.session.name = resolve[0]["Nom"];
				req.session.idUser = resolve[0]["idUser"];
				req.session.spectateur = resolve[0]["Spectateur"];
				res.redirect("/home");
			}
			else{
				res.render('login.ejs',{error : 1});
			}	
		});
		
	}
	else{
		res.render('login.ejs');
	}
});
app.post("/loginJ",urlencodedParser,function(req,res){
	var name = ent.encode(req.body.nameUserJ);
	if(typeof(name) == typeof("str") && name.length > 1){
		bdd.createUser(name).then(function(resolve){
			req.session.name = name;
			req.session.idUser = resolve["insertId"];
			req.session.spectateur = 0;
			res.redirect("/home");
		});
	}
});
app.get("/home",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("login.ejs");
	} 
	else{
		if(req.session.salleJoined != undefined){
			res.redirect("/game/"+req.session.salleJoined);
		}
		else{
			if(req.session.spectateur == 1){
				res.render("home.ejs");
			}
			else{
				res.render("homeJ.ejs");
			}
		}	
	}
});
app.get("/create",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		bdd.getPaquet().then(function(resolve){
			res.render('create.ejs',{paquets : resolve});
		});
	}
});
app.post("/create",urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		var nbrTas = req.body.nbrTas;
		var idPaquet = req.body.idPaquet;;
		if(nbrTas != undefined || idPaquet != undefined){
			bdd.createSalle(idPaquet,nbrTas).then(function(resolve){
				req.session.salleJoined = resolve["insertId"];
				bdd.initSalle(req.session.salleJoined,nbrTas,idPaquet);
				res.redirect("/home");
			});
		}
		
	}
});
app.get("/result",function(req,res){
	res.render('result.ejs');
});
app.get("/join",function(req,res){
	res.render('home.ejs');
});
app.get("/game/:idSalle",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined || req.session.salleJoined == undefined){
		if(req.session.salleJoined == undefined){
			console.log(req.params.idSalle);
			req.session.salleJoined = req.params.idSalle;
		}
		res.redirect("/login");
	}
	else{
		if(req.session.salleJoined != req.params.idSalle){
			req.session.salleJoined = req.params.idSalle;
			res.redirect("/home");
		}
		else{
			res.render('game.ejs');
		}
	}
});

/* Si la page n'est pas trouvée*/

app.use(function(req,res,next){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("/login");
	}
	else {
		res.redirect("/home");
	}
});
io.on('connection',function (socket){
	var session = socket.handshake.session;
	if(session.name == undefined || session.idUser == undefined || session.spectateur == undefined){
		socket.emit("console","Pas connecté");
		socket.emit("erreur",0);
		socket.disconnect();
	}
	else{
		socket.on("getTas",function(){
			lock.acquire(session.salleJoined,function(release){
				bdd.getTas(session.salleJoined).then(function(resolve){
					socket.emit("Tas",JSON.stringify(resolve));
					bdd.getLTas(session.salleJoined).then(function(resolve2){
						socket.emit("LigneTas",JSON.stringify(resolve2));
						release();
					});
				});
			});
		});
		//PARTIE SPECTATEUR
		if(session.spectateur == 1){
			lock.acquire(session.salleJoined,function(release){
				bdd.getStatut(session.salleJoined).then(function(statut){
				if(statut == 0){ //La partie n'a pas encore commencé , il n'y a rien a rattrapé
					socket.emit("statut",0);
					socket.join("salle"+session.salleJoined);
					release();
					}
				if(statut == 1){//La Partie est en cours
					socket.emit("statut",1);
					socket.join("salle"+session.salleJoined);
					release();
				}
				});
			});
		}
		//PARTIE JOUEUR
		else{
			lock.acquire(session.salleJoined,function(release){ //Peut être inutile pour l'instant 
				bdd.getJoueur(session.salleJoined).then(function(idJoueur){
					if(idJoueur == null){
						//Joueur Connecté
						bdd.setJoueur(session.salleJoined,session.idUser).then(function(){
							io.sockets.in("salle"+session.salleJoined).emit('statut',1);
							socket.emit("statut",1);
							release();
						});
						//Input pour bouger une carte
						socket.on("MoveCardToTas",function(data){
							lock.acquire(session.salleJoined,function(release){
								var dataRead = JSON.parse(data);
								console.log(dataRead);
								bdd.moveCard(dataRead["idTas"],dataRead["idLpaquet"],dataRead["idTasCible"]).then(function(resolve){
									io.sockets.in("salle"+session.salleJoined).emit('MoveCardToTas',JSON.stringify(dataRead));
									release();
								});
							});
							
						});
						socket.on("disconnect",function(){
							lock.acquire(session.salleJoined,function(release){ 
								console.log("entré");
								bdd.setJoueur(session.salleJoined,"null").then(function(resolve){
									io.sockets.in("salle"+session.salleJoined).emit('statut',0);
									release();
								});
							},1); 
						});
					}
					else{
						//Un joueur est déjà connecté
						release();
						socket.emit("erreur",1);
						socket.emit("console","Un joueur est deja sur le jeu");
						socket.disconnect();
						
					}
				});
			},1);
			}
		}
});

server.listen(8080);

