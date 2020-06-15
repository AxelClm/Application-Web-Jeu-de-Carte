var mysql = require('mysql');
var bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database : "DBServ"
});

module.exports= {
	searchNamePass : function(name,password){
		return new Promise(function(resolve , reject){
			bdd.query("SELECT * FROM User Where nom = \""+name+ "\"and Password = \""+password+"\";",function (err,result,fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	createUser : function(name){
		return new Promise(function(resolve , reject){
			bdd.query("INSERT INTO USER(Nom,Spectateur) Values (\""+name+"\",false);",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getPaquet : function(){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT User.Nom as nomUser,Paquet.Nom as paquetNom,idPaquet FROM User,Paquet where Paquet.Createur = User.idUser",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	createSalle : function(idPaquet,nbrTasMax){
		return new Promise(function(resolve,reject){
			bdd.query("INSERT INTO SALLE (idPaquet,nbrTasMax,statut) VALUES ("+idPaquet+","+nbrTasMax+",0);",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getStatut: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT statut FROM salle Where idSalle = "+idSalle+";",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result[0]["statut"]);
				}
			});
		});
	},
	setStatut: function(idSalle,statut){
		return new Promise(function(resolve,reject){
			bdd.query("Update Salle set statut = ? where idSalle = ?",[statut,idSalle],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getJoueur: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT idJoueur FROM salle Where idSalle = "+idSalle+";",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result[0]["idJoueur"]);
				}
			});
		});
	},
	setJoueur: function(idSalle,idJoueur){
		return new Promise(function(resolve,reject){
			bdd.query("Update Salle set idJoueur = "+idJoueur+" Where idSalle = "+idSalle+";",function (err,result,fields){
				if(err){reject(err);throw err;}{
				console.log(result);
				resolve(result);
				}
			});
		});
	},
	initSalle: function(idSalle,nbrTasMax,idPaquet){
		return new Promise(function(resolve,reject){
			createTas(idSalle,nbrTasMax).then(function(resolved){
				initTas(idPaquet,resolved["insertId"]).then(function(resolved2){
					resolve(resolved2);
				});
			});
		});
	},
	getTas: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT idTas,nom from Tas where idSalle = ?",idSalle,function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getLTas: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("select Tas.idTas,LigneTas.idLpaquet,Carte.idCarte,image from Tas,LigneTas,LignePaquet,Carte where tas.idTas = ligneTas.idTas and idSalle = ?"+ 
				" and ligneTas.idLPaquet = LignePaquet.idLpaquet and LignePaquet.idCarte = Carte.idCarte",idSalle,function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	moveCard : function(idTas,idLpaquet,idTasCible){
		return new Promise(function(resolve,reject){
			deleteLTas(idTas,idLpaquet).then(function(resolved){
				if(resolved["affectedRows"] == 1){
					insertIntoTas(parseInt(idTasCible),idLpaquet).then(function(resolved2){
						resolve(resolved2);
					});
				}
			});
		});
	},
	renameTas : function(idTas,idSalle,nNom){
		return new Promise(function(resolve,reject){
			bdd.query("Update Tas set nom = ? Where idSalle = ? and idTas = ?",[nNom,idSalle,idTas],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	setFavoriteCard : function(idTas,idLPaquet,idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("Update Tas set idLTFavorite = ? Where idSalle = ? and idTas = ?",[idLPaquet,idSalle,idTas],function(err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	}
};
function deleteLTas(idTas,idLpaquet){
	return new Promise(function(resolve,reject){
			bdd.query("DELETE FROM LIGNETAS WHERE IDTAS = ? AND IDLPAQUET = ?",[idTas,idLpaquet],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
}
function  insertIntoTas(idTas,idLpaquet){
	return new Promise(function(resolve,reject){
		bdd.query("INSERT INTO ligneTas (idTas,idLpaquet) VALUES (?,?)",[idTas,idLpaquet],function(err,result,fields) {
			if(err){reject(err);throw err;}{
				resolve(result);
			}
		});
	});
}
function createTas (idSalle,nbrTasMax){
		return new Promise(function(resolve,reject){
			var liste = [];
			for (var i = 0 ; i<nbrTasMax;i++){
				liste[i]= ["Tas n°"+i, idSalle];
			}
			console.log(liste);
			bdd.query("INSERT INTO TAS (nom,idSalle) VALUES ?",[liste],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
			}
		});
	});
}
function initTas(idPaquet,idTas){
	return new Promise(function(resolve,reject){
		getPaquet(idPaquet).then(function (resolved){
			console.log(idTas);
			console.log(idPaquet);
			console.log(resolved);
			var liste = []
			for(var i = 0 ;i<resolved.length;i++){
				liste[i] = [idTas,resolved[i]["idLpaquet"]];
			}
			console.log(liste);
			bdd.query("INSERT INTO ligneTas (idTas,idLPaquet) VALUES ?",[liste],function (err,result,fields){
				if(err){reject(err);throw err;}{
					resolve(result);
				}
			});
		});
	});
}
function getPaquet(idPaquet){
	return new Promise(function(resolve,reject){
			bdd.query("SELECT * FROM lignePaquet WHERE idPaquet = ?",idPaquet,function (err,result,fields){
				if(err){reject(err);throw err;}{
				console.log(result);
				resolve(result);
				}
			});
		});
}