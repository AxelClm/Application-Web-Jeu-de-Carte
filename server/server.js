var app = require('express')();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });
var sharedsession = require("express-socket.io-session");
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.use(session);
io.use(sharedsession(session));

app.get("/login",function(req,res){
	res.render(login.ejs);
});
app.get("/home",function(req,res){
	res.render(home.ejs);
});
app.get("/result",function(req,res){
	res.render(result.ejs);
});
app.get("/join",function(req,res){
	res.render(home.ejs);
});
app.get("/game",function(req,res){
	res.render(home.ejs);
});
