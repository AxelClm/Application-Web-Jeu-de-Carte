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
app.get("/home",function(req,res){
	if(req.session.name == undefined || req.session.id == undefined || req.session.spectateur == undefined){
		console.log(req.session.name);
		res.redirect("login.ejs");
	} 
	else{
		res.render("home.ejs");
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