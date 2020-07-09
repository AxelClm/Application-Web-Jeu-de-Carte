module.exports = function(io,lock,bdd,ent){
	io.on('connection',function (socket){		
	var session = socket.handshake.session;
	if(session.name == undefined || session.idUser == undefined || session.spectateur == undefined){
		socket.emit("console","Pas connecté");
		socket.emit("erreur",0);
		socket.disconnect();
	}
	else{
		socket.on("test",function(){
			socket.emit("console","test");
			console.log("test");
		});
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
		socket.emit("Spectateur",session.spectateur);
		//PARTIE SPECTATEUR
		if(session.spectateur == 1){
			lock.acquire(session.salleJoined,function(release){
				bdd.getStatut(session.salleJoined).then(function(statut){
					console.log("le spectateur rejoins la salle: "+session.salleJoined+" qui a un statut: " +statut);
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
				console.log("le Joueur rejoins la salle: "+session.salleJoined);
				bdd.getJoueur(session.salleJoined).then(function(idJoueur){
					if(idJoueur == null){
						//Joueur Connecté
						bdd.setJoueur(session.salleJoined,session.idUser).then(function(){
							bdd.setStatut(session.salleJoined,1).then(function(){
								io.sockets.in("salle"+session.salleJoined).emit('statut',1);
								socket.emit("statut",1);
								release();
							});
						});
						//Input pour bouger une carte
						socket.on("MoveCardToTas",function(data){
							lock.acquire(session.salleJoined,function(release){
								var dataRead = JSON.parse(data);
								bdd.moveCard(dataRead["idTas"],dataRead["idLpaquet"],dataRead["idTasCible"]).then(function(resolve){
									io.sockets.in("salle"+session.salleJoined).emit('MoveCardToTas',JSON.stringify(dataRead));
									release();
								});
							});
							
						});
						socket.on("renommerTas",function(data){
							var dataRead = JSON.parse(data);
							console.log(dataRead)
							lock.acquire(session.salleJoined,function(release){
								bdd.renameTas(dataRead["idTas"],session.salleJoined,ent.encode(dataRead["nNom"])).then(function(resolve){
									io.sockets.in("salle"+session.salleJoined).emit('renameTas',JSON.stringify(dataRead));
									release();
								});
							});
						});
						socket.on("favorite",function(data){
							var dataRead = JSON.parse(data);
							console.log(dataRead);
							lock.acquire(session.salleJoined,function(release){
								bdd.setFavoriteCard(dataRead["idTas"],dataRead["idLPaquet"],session.salleJoined).then(function(resolve){
									io.sockets.in("salle"+session.salleJoined).emit('favorite',JSON.stringify(dataRead));
									release();
								});
							});
						});
						socket.on("afficheTas",function(data){
							var dataRead = JSON.parse(data);
							//VERIFIER QUE LES INPUTS SONT CORRECTS
							io.sockets.in("salle"+session.salleJoined).emit('ChangeTas',JSON.stringify(dataRead));
						});
						socket.on("carteVisible",function(data){
							io.sockets.in("salle"+session.salleJoined).emit('carteVisible',data);
						});
						socket.on("carteNonVisible",function(data){
							io.sockets.in("salle"+session.salleJoined).emit('carteNonVisible',data);
						});
						socket.on("end",function(data){
							bdd.terminateRoom(session.salleJoined).then(function(resolve){
								io.sockets.in("salle"+session.salleJoined).emit('statut',2);
								socket.emit('statut',2);
							})
						});
						socket.on("disconnect",function(){
							lock.acquire(session.salleJoined,function(release){
								bdd.getStatut(session.salleJoined).then(function(statut){
									if(statut !=2){
										bdd.setJoueur(session.salleJoined,null).then(function(resolve){
											bdd.setStatut(session.salleJoined,0).then(function(){
												io.sockets.in("salle"+session.salleJoined).emit('statut',0);
												release();
											});
										});
									}
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
}
