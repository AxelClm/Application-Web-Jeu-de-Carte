var mysql = require('mysql');
var xl = require('excel4node');
var bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : "DBServ",
});

module.exports= {
	// MYSQL auto escape quand les arguments sont passés avec ?;
	deletePaquet: function(idUser,idPaquet){
		return new Promise(function(resolve, reject){
			bdd.query("DELETE FROM paquet WHERE paquet.idPaquet = ? and paquet.Createur = ?;", [idPaquet,idUser],function(err,result,fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	terminateRoom:function(idSalle){
		return new Promise(function(resolve, reject){
			bdd.query("UPDATE salle SET salle.statut = 2 where salle.idSalle = ?;", [idSalle],function(err,result,fields){
				if(err){reject(error);throw err;}{
					resolve(result);
				}
			});
		});
	},
	getRooms : function(idUser){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT idSalle, statut, user.Nom, paquet.Nom as NomPaquet FROM salle, user, paquet WHERE idJoueur = user.idUser and salle.idPaquet = paquet.idPaquet and salle.Createur = ? UNION SELECT idSalle, statut, salle.idJoueur as Nom , paquet.Nom FROM salle,paquet where salle.idJoueur is null and salle.idPaquet = paquet.idPaquet and salle.Createur = ?;",
				[idUser,idUser],function(err, result, fields){
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
				if(err){reject(err);throw err;}{
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
	createSalle : function(idPaquet,nbrTasMax,idUser){
		return new Promise(function(resolve,reject){
			bdd.query("INSERT INTO salle (idPaquet,nbrTasMax,Createur,statut) VALUES (?,?,?,0);",[idPaquet,nbrTasMax,idUser],function (err,result,fields){
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
	},
	getPaquetSalle: function(idUser){
		return new Promise(function(resolve,reject){
			bdd.query("SELECT DISTINCT salle.idPaquet,paquet.Nom FROM `salle`,paquet WHERE salle.Createur = ? and salle.idPaquet = paquet.idPaquet",[idUser], function(err,result,fields){
				if(err){reject(err);throw err;}{
					resolve(result);
				}
			});
		});
	},
	writeResult: function(idUser,idPaquet){
		return new Promise(function(resolve,reject){
			let wb = new xl.Workbook();
			getSalleUser(idUser,idPaquet).then(function(salles){
				createXLS(salles,wb,idPaquet).then(function(name){
					resolve(name);
				});
			});
		});
	}
}
function getSalleUser(Createur,idPaquet){
	return new Promise(function(resolve,reject){
		bdd.query("SELECT * FROM salle,tas,lignetas,carte,lignepaquet,user WHERE salle.Createur = ? and salle.idPaquet = ? and salle.statut = 2 and tas.idSalle = salle.idSalle and tas.idTas = lignetas.idTas and carte.idCarte = lignepaquet.idCarte and salle.idJoueur = user.idUser ORDER BY salle.idSalle",
			[Createur,idPaquet], function(err,result,fields){
			if(err){reject(err);throw err;}{
				console.log(result);		
				resolve(result);
			}
		})
	});
}
function createXLS(salles,wb,idPaquet){
	return new Promise(function(resolve,reject){
		getPaquet(idPaquet).then(function(cartes){
			
			let i = 1;
			var tabAssos = [];
			//Init tab assos
			cartes.forEach(carte => {
				console.log(carte);
				tabAssos[carte["idLpaquet"]] = i+1;
				i = i+1;
			});	
			console.log(tabAssos);
			var lastIdS = -1;
			var ws;
			var endI = i;
			var tmp = [];
			var lock = 0;
			salles.forEach(salle => {
				if(salle["idSalle"] != lastIdS){
					lastIdS = salle["idSalle"];
					console.log("nouvelle page");
					ws = wb.addWorksheet();
					//ecriture des cartes
					let i=1;
					ws.cell(i,1).string("cartes");
					ws.cell(i,2).string("nom");
					ws.cell(i,3).string(salle["Nom"]);
					cartes.forEach(carte => {
						ws.cell(i+1,1).number(carte["idLpaquet"]).style({font: {size: 14,bold:true}});
						ws.cell(i+1,2).string(String(carte["nom"]));
						i = i+1;
					});
					let tmpId = salle["idSalle"];
					let tmpWS = ws;
					lock = lock + 1;
					writeTas(tmpId,tmpWS,i).then(function(){
						lock = lock - 1;
					});

				}	
				console.log(tabAssos[salle["idLPaquet"]],3,salle["idTas"]);
				ws.cell(tabAssos[salle["idLPaquet"]],3).number(salle["idTas"]);
			});
		var interval = setInterval(function(){
			if(lock != 0){
				console.log(lock," attente");
			}
			else{
				let name = "files/Result/"+idPaquet+Date.now()+".xlsx"
				wb.write(name,function(err,stats){
					 if (err) {
    					console.error(err);
  					} 
  					else {
    					console.log(stats); // Prints out an instance of a node.js fs.Stats object
    					clearInterval(interval);
						resolve(name);
  					}
				});
			}
		},1000)
		});
	});
}
function writeTas(idSalle,ws,lastIdS){
	return new Promise(function(resolve,reject){
		bdd.query("SELECT tas.idTas,tas.nom,tas.idLTFavorite from tas WHERE tas.idSalle = ?",[idSalle],function(err,result,fields){
			if(err){reject(err);throw err;}{
				console.log(result);
				let i = lastIdS +1;
				result.forEach(tas => {
					console.log(i,1);
					ws.cell(i,1).number(tas["idTas"]);
					ws.cell(i,2).string(tas["nom"]);
					console.log(tas);
					if(tas["idLTFavorite"] != null){
						ws.cell(i,3).number(tas["idLTFavorite"]);
					}
					else{
						ws.cell(i,3).string(String(tas["idLTFavorite"]));
					}
					i = i+1;
				});
				resolve(result);
			}
		});
	});
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
			bdd.query("SELECT * FROM lignepaquet,carte WHERE idPaquet = ? and lignepaquet.idCarte = carte.idCarte",idPaquet,function (err,result,fields){
				if(err){reject(err);throw err;}{
				console.log(result);
				resolve(result);
				}
			});
		});
}