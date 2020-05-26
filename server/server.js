var app = require('express')();
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
				req.session.id = resolve[0]["idUser"];
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
			req.session.id = resolve["insertId"];
			req.session.spectateur = 0;
			res.redirect("/home");
		});
	}
});
app.get("/home",function(req,res){
	if(req.session.name == undefined || req.session.id == undefined || req.session.spectateur == undefined){
		console.log(req.session.name);
		res.redirect("login.ejs");
	} 
	else{
		if(req.session.spectateur == 1){
			res.render("home.ejs");
		}
		else{
			res.render("homeJ.ejs");
		}
		
	}
});
app.get("/create",function(req,res){
	if(req.session.name == undefined || req.session.id == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		bdd.getPaquet().then(function(resolve){
			res.render('create.ejs',{paquets : resolve});
		});
	}
});
app.post("/create",urlencodedParser,function(req,res){
	if(req.session.name == undefined || req.session.id == undefined || req.session.spectateur != 1){
		res.redirect("/home");
	}
	else{
		var nbrTas = req.body.nbrTas;
		var idPaquet = req.body.idPaquet;
		console.log(req.body.nbrTas);
		console.log(req.body.idPaquet);
		if(nbrTas != undefined || idPaquet != undefined){
			bdd.createSalle(idPaquet,nbrTas).then(function(resolve){
				console.log(resolve["insertId"]);
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
app.get("/game",function(req,res){
	res.render('game.ejs');
});
/* Si la page n'est pas trouvée*/
app.use(function(req,res,next){
	if(req.session.name == undefined || req.session.id == undefined || req.session.spectateur == undefined){
		res.redirect("/login");
	}
	else {
		res.redirect("/home");
	}
});
server.listen(8080);