var mysql = require('mysql');
var bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : "DBServ"
});

module.exports= {
	// MYSQL auto escape quand les arguments sont passés avec ?;

	getRooms : function(){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT idSalle, statut, user.Nom, paquet.Nom as NomPaquet FROM salle, user, paquet WHERE idJoueur = user.idUser and salle.idPaquet = paquet.idPaquet;", function(err, result, fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	deleteRoom : function(idSalle){
		return new Promise(function(resolve, reject){
			bdd.query("DELETE FROM salle WHERE idSalle = ?;", [idSalle],function(err,result,fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	searchNamePass : function(name,password){
		return new Promise(function(resolve , reject){
			bdd.query("SELECT * FROM user WHERE Nom = ? and Password = ?;",[name,password],function (err,result,fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	createSpecUser : function(name, password, admin){
		return new Promise(function(resolve , reject){
			bdd.query("INSERT INTO user (Nom, Password, Spectateur, Administrateur) Values (?,?,1,?);",[name,password,admin],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	isAdmin : function(name){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT Administrateur FROM user WHERE Nom = ?;",[name],function(err, result, fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	createUser : function(name){
		return new Promise(function(resolve , reject){
			bdd.query("INSERT INTO user (Nom,Spectateur) VALUES (?,false);",[name],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getPaquet : function(){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT user.Nom as nomUser,paquet.Nom as paquetNom,idPaquet FROM user,paquet WHERE paquet.Createur = user.idUser",function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	createSalle : function(idPaquet,nbrTasMax){
		return new Promise(function(resolve,reject){
			bdd.query("INSERT INTO salle (idPaquet,nbrTasMax,statut) VALUES (?,?,0);",[idPaquet,nbrTasMax],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getStatut: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT statut FROM salle WHERE idSalle = ?;",[idSalle],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result[0]["statut"]);
				}
			});
		});
	},
	setStatut: function(idSalle,statut){
		return new Promise(function(resolve,reject){
			bdd.query("UPDATE salle SET statut = ? WHERE idSalle = ?",[statut,idSalle],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getJoueur: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT idJoueur FROM salle WHERE idSalle = ?;",[idSalle],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result[0]["idJoueur"]);
				}
			});
		});
	},
	setJoueur: function(idSalle,idJoueur){
		return new Promise(function(resolve,reject){
			bdd.query("UPDATE salle SET idJoueur = ? WHERE idSalle = ?;",[idJoueur,idSalle],function (err,result,fields){
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
			bdd.query("SELECT idTas,nom,idLTFavorite from tas where idSalle = ?",idSalle,function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getLTas: function(idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("select tas.idTas,lignetas.idLpaquet,carte.idCarte,image from tas,lignetas,lignepaquet,carte where tas.idTas = lignetas.idTas and idSalle = ?"+ 
				" and lignetas.idLPaquet = lignepaquet.idLpaquet and lignepaquet.idCarte = carte.idCarte",idSalle,function (err,result,fields){
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
			bdd.query("Update tas set nom = ? Where idSalle = ? and idTas = ?",[nNom,idSalle,idTas],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	setFavoriteCard : function(idTas,idLPaquet,idSalle){
		return new Promise(function(resolve,reject){
			bdd.query("Update tas set idLTFavorite = ? Where idSalle = ? and idTas = ?",[idLPaquet,idSalle,idTas],function(err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	addCarte : function(nomImage,labelImage){
		return new Promise(function(resolve,reject){
			bdd.query("INSERT INTO carte (image,nom) VALUES (?,?)",[nomImage,labelImage],function(err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	getCartes: function(){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT * FROM carte",function(err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
	},
	createPaquet: function(Createur,Nom,tabCartesid){
		return new Promise(function(resolve,reject){
			createPaquet(Createur,Nom).then(function(resolved){
				insertCartes(resolved["insertId"],tabCartesid).then(function(resolved2){
					resolve(resolved2);
				});
			});
		});
	},
	getLPaquet: function(idPaquet){
		return new Promise(function(resolve,reject){
			getPaquet(idPaquet).then(function(resolved){
				resolve(resolved);
			})
		});
	}
}
function createPaquet(Createur,Nom){
	return new Promise(function(resolve,reject){
		bdd.query("INSERT INTO paquet (Createur,Nom) VALUES (?,?)",[Createur,Nom], function(err,result,fields){
			if(err){reject(err);throw err;}{
				resolve(result);
			}
		})
	});
}
function insertCartes(idPaquet,listeCartes){
	return new Promise(function(resolve,reject){
			var liste = [];
			for (var i = 0 ; i<listeCartes.length;i++){
				liste[i]= [idPaquet, parseInt(listeCartes[i])];
			}
			console.log(liste);
			bdd.query("INSERT INTO lignepaquet (idPaquet,idCarte) VALUES ?",[liste],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
			}
		});
	});
}
function deleteLTas(idTas,idLpaquet){
	return new Promise(function(resolve,reject){
			bdd.query("DELETE FROM lignetas WHERE idTas = ? AND idLPaquet = ?",[idTas,idLpaquet],function (err,result,fields){
				if(err){reject(err);throw err;}{
				resolve(result);
				}
			});
		});
}
function  insertIntoTas(idTas,idLpaquet){
	return new Promise(function(resolve,reject){
		bdd.query("INSERT INTO lignetas (idTas,idLpaquet) VALUES (?,?)",[idTas,idLpaquet],function(err,result,fields) {
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
			bdd.query("INSERT INTO tas (nom,idSalle) VALUES ?",[liste],function (err,result,fields){
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
			bdd.query("INSERT INTO lignetas (idTas,idLPaquet) VALUES ?",[liste],function (err,result,fields){
				if(err){reject(err);throw err;}{
					resolve(result);
				}
			});
		});
	});
}
function getPaquet(idPaquet){
	return new Promise(function(resolve,reject){
			bdd.query("SELECT * FROM lignepaquet WHERE idPaquet = ?",idPaquet,function (err,result,fields){
				if(err){reject(err);throw err;}{
				console.log(result);
				resolve(result);
				}
			});
		});
}