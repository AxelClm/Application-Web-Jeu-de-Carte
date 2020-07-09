var express = require('express');
const fs = require('fs')
var app = express();
var bodyParser = require('body-parser');
var multer = require("multer");
var multerConf = {
	storage : multer.diskStorage({
		destination : function(req,file,next){
			next(null,'./files/images');
		},
		filename : function(req,file,next){
			const ext = file.mimetype.split('/')[1];
			next(null,Date.now() + '.' + ext);
		}
	}),
	FileFilter: function(req,file,next){
		if(!file){
			next();
		}
		const image = file.mimetype.startsWith('image/');
		if(image){
			next(null,true);
		}else{
			console.log("Le type du fichier n'est pas supporté");
			next({message:"Le type du fichier n'est pas une image"});
		}
	}
};
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var ent = require('ent');
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false}
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
//
app.get("/roomsHistory",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("login.ejs");
	}else{
		if (req.session.admin != 1) {
			res.redirect("home.ejs")
		}else{
			bdd.getRooms(req.session.idUser).then(function(resolve){
				var tabRes = resolve;
				res.render('roomsHistory.ejs',{tab : tabRes});
			});
		}
	}
});

app.post("/roomsHistory", urlencodedParser, function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("login.ejs");
	}
	else{
		let idSalle = req.body.id;
		if(isNaN(idSalle)){
			res.redirect("/roomsHistory");
		}
		else{
			bdd.deleteRoom(parseInt(idSalle)).then(function(resolve){
			});
		}
	}
});

app.get("/createSpecUser", function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("login.ejs");
	}
	else{
		console.log("valeur admin "+req.session.admin);
		if(req.session.admin == 1){
			res.render("createUser.ejs");
		}
		else{
			res.redirect("/home");
		}
	}
});
app.post("/createSpecUser",urlencodedParser, function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined || req.session.admin != 1){
		res.redirect("login.ejs");
	}
	else{
		let name = req.body.userName;
		let psswrd = md5(req.body.passwrd);
		let modo = req.body.moderateur;

		let arg = modo == "true" ? 1 : 0;
		
		bdd.createSpecUser(name, psswrd, arg).then(function(resolve){
			res.redirect("/home");
		});
	}
});

app.post("/login",urlencodedParser,function(req,res){
		let name = req.body.nameUser;
		let password = req.body.password;
	if (typeof(name) == typeof("str") && typeof(password) == typeof("str")){
		name = ent.encode(req.body.nameUser);
		password = md5(req.body.password);
		bdd.searchNamePass(name,password).then(function(resolve){
			if(resolve.length != 0){
				req.session.name = resolve[0]["Nom"];
				req.session.idUser = resolve[0]["idUser"];
				req.session.spectateur = resolve[0]["Spectateur"];
				

				return bdd.isAdmin(resolve[0]["Nom"]);
			}
			else{
				res.render('login.ejs',{error : 1});
				next();
			}	
		}).then(function(newresolve){
			console.log(newresolve);
			if(newresolve[0].Administrateur == 1){
				req.session.admin = 1
			}else{
				req.session.admin = 0;
			}
			res.redirect("/home");
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
				res.render("home.ejs",{valAdmin : req.session.admin});
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
app.get("/result",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		bdd.getPaquetSalle(req.session.idUser).then(function(resolve){
			console.log(resolve);
			res.render('resultat.ejs',{paquets : resolve});
		});
	}
});
app.post("/result",urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		let idPaquet = req.body.idPaquet;
		if(isNaN(idPaquet)){
			res.redirect("/home");
		}
		else{
			bdd.writeResult(req.session.idUser,parseInt(idPaquet)).then(function(target){
				res.download(target,function(err){
					if(err){
						console.log(err)
					}
					else{
						fs.unlink(target, (err) => {
						  if (err) {
						    console.error(err)
						    return
						  }
						});
					}
				});
			});
		}
	}
});
app.post("/create",urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		let nbrTas = req.body.nbrTas;
		let idPaquet = req.body.idPaquet;
		if(isNaN(nbrTas) || isNaN(idPaquet)){
			res.redirect("/home");
		}
		else{
			nbrTas = parseInt(nbrTas) +1;
			idPaquet = parseInt(idPaquet);
			if(nbrTas != undefined || idPaquet != undefined){
				bdd.createSalle(idPaquet,nbrTas,req.session.idUser).then(function(resolve){
					req.session.salleJoined = resolve["insertId"];
					bdd.initSalle(req.session.salleJoined,nbrTas,idPaquet);
					res.redirect("/home");
				});
			}
		}
	}
});
app.get("/result",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		res.render('result.ejs');
	}
});
app.get("/game/:idSalle",function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined || req.session.salleJoined == undefined){
		if(req.session.salleJoined == undefined){
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
app.get('/paquet',function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		bdd.getPaquet().then(function(resolve){
			res.render('paquet.ejs',{paquets : resolve});
		});
	}
	
});
app.get('/uploadImage',function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		res.render('upload.ejs');
	}
});
app.post('/paquet/create',urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		let namePaquet = ent.encode(req.body.namePaquet);
		bdd.getCartes().then(function(resolve){
			req.session.namePaquet = namePaquet;
			if(req.body.idPaquet == undefined){
				res.render('paquetCreate.ejs',{namePaquet : req.body.namePaquet,cartes: resolve,importPaquet : "null"});
			}
			else{
				let idPaquet = req.body.idPaquet;
				if(isNaN(idPaquet)){
					res.render("/home");
				}
				else{
					bdd.getLPaquet(parseInt(idPaquet)).then(function(resolve2){
						res.render('paquetCreate.ejs',{namePaquet : namePaquet,cartes: resolve,importPaquet : resolve2});
					});
				}
			}
		});
	}
});
app.post('/paquet/create/upload',urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		bdd.createPaquet(req.session.idUser,req.session.namePaquet,JSON.parse(req.body.json)).then(function(resolve){
			res.redirect("/home");
		});
	}

});
app.post('/paquet/delete',urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		let idPaquet = req.body.idPaquet;
		if(isNaN(idPaquet)){
			res.redirect("/home");
		}
		else{
			bdd.deletePaquet(req.session.idUser,parseInt(idPaquet)).then(function(resolve){
				res.redirect("/paquet");
			});
		}
	}

});
app.post('/uploadImage/upload',multer(multerConf).single('photo'),function(req,res){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
	   console.log(req.file);
		if(req.file){
			let name = ent.encode(req.file.filename);
			let label = req.body.label;
			console.log("INSERT IMAGE : ",name,label);
			bdd.addCarte(name,label).then(function(resolve){
				console.log(resolve);
				res.redirect('/uploadImage');
			});
		}
	}
});
/* Si la page n'est pas trouvée*/
app.get('/leaveRoom',function(req,res,next){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		console.log(req.session.salleJoined);
		req.session.salleJoined = undefined;
		console.log(req.session.salleJoined);
		res.redirect("/home");
	}
});
app.use(function(req,res,next){
	if(req.session.name == undefined || req.session.idUser == undefined || req.session.spectateur == undefined){
		res.redirect("/login");
	}
	else {
		res.redirect("/home");
	}
});
require('./ioHandler.js')(io,lock,bdd,ent);
server.listen(8080);

