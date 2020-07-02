//Variables
var listeTas = {}; //objet contenant toute les tas
var tasActuel = 0;

// cartes et tas recuperes de la base de donnee

// methode qui remplit tas à trier de carte
function initTas(tas, carte){
	// creation des tas vides
	for (var i = 0; i < tas.length; i++) {
		listeTas[tas[i]["idTas"]] = [];

	}
	console.log(listeTas);
	// ajout de carte dans le tas initial
	/*
	for (var i = 0; i < carte.length; i++){
		listeTas.Tas0.push({"id" : carte[i]["idCarte"], "emplacement" : "images/ExempleCarte"+carte[i]["idCarte"]});
	}
	*/
	carte.forEach(row => {
		listeTas[row["idTas"]].push({idCarte :row["idCarte"],image :row["image"], idLpaquet: row["idLpaquet"]});
	});
	console.log(listeTas);
}

//methode qui supprime Element de son tas pour
//le déplacer vers tas choisi par l'utilisateur
function changementTas (choix, idCarte){
	//on cherche la position de la carte selectionee dans le tableau
	console.log(choix,idCarte);
	var indexCarte = listeTas[tasActuel].findIndex(x => x.idCarte == idCarte);
	var tmp = listeTas[tasActuel].splice(indexCarte, 1);
	console.log("Information du changement :");
	console.log(tmp);
	console.log(choix);

	tmp = tmp[0];
	//On envoie la requet au serveur
	let data = {idLpaquet:tmp["idLpaquet"],idTas: tasActuel,idTasCible: choix};
	socket.emit("MoveCardToTas",JSON.stringify(data));
	//on transfert la carte dans le tas selectionné
	listeTas[choix].push(tmp);
	console.log("Nouveau tableau");
	console.log(listeTas);

	//on reactualise l'affichage
	afficheTas(tasActuel);
}
function changementTas2 (choix,idLpaquet,ancienTas){
	//on cherche la position de la carte selectionee dans le tableau
	console.log("La Carte"+idLpaquet+"Doit être bougée dans le tas "+choix+"depuis le tas"+ancienTas);
	var indexCarte = listeTas[ancienTas].findIndex(x => x.idLpaquet == idLpaquet);
	var tmp = listeTas[ancienTas].splice(indexCarte, 1);
	tmp = tmp[0];
	//on transfert la carte dans le tas selectionné
	listeTas[choix].push(tmp);
	//on reactualise l'affichage
	afficheTas(tasActuel);
}


//methode qui affiche les cartes appartenant au tas sélectionné
function afficheTas(idTas,nom) {
	// on ajoute dans la balise <div> les cartesayant pour id "contenuImg"
	tasActuel =idTas;
	console.log("tas choisi = "+idTas);
	var conteneur = document.getElementById('contenuImg');
	$("#contenuImg").stop();
	$("#contenuImg").hide();
	//on vide le conteneur au cas où la
	// la page affiche déjà des cartes
	while(conteneur.hasChildNodes()){
		conteneur.removeChild(conteneur.lastChild);
	}
	var data = {idTas: idTas,nom : nom}
	socket.emit("afficheTas",JSON.stringify(data));
	//On change l'affichage
	$("#nomTas").html(nom);
	$("#capacitéTas").html(listeTas[idTas].length);
	console.log(listeTas);
	console.log(listeTas[idTas]);
	idFavorite = tasDB[tasDB.findIndex(x => x.idTas == idTas)].idLTFavorite;
	console.log("idFavorite: "+idFavorite);
	//on ajoute les images a la balise <div> avec le classe image
	//on ajoute les images dans la balise <div id="contenuImg">
	//on commence par 1 car le premier indice contient l'id du tas
	for (var i = 0; i < listeTas[idTas].length; i++) {
		var img = document.createElement('img');
		if(Spectateur == 0){
			img.setAttribute("data-toggle","modal");
			img.setAttribute("data-target","#exampleModal");
		}
		console.log((listeTas[idTas][i]["image"]+(".png")));
		img.setAttribute("src","/images/"+(listeTas[idTas][i]["image"]));
		img.setAttribute('id',listeTas[idTas][i]["idCarte"]);
		img.setAttribute('idLpaquet',listeTas[idTas][i]["idLpaquet"])

		//ajout de marge aux images
		img.style.marginRight = "10px";
		img.style.marginBottom = "10px";
		if(listeTas[idTas][i]["idLpaquet"] == idFavorite){
			img.classList.add("fav");
		}
		conteneur.appendChild(img);
	}	
	$("#contenuImg").fadeIn(200);
	if(Spectateur == 0){
		initObserver();
	}
		displayBtn();

		let btnEnd = document.getElementById("end");
		if (btnEnd != null) {
			btnEnd.onclick = function(){
				switch(isOver()){

					case true:
						// on passe à la page de résultat 
						console.log("on peut passer à la page de résultat");
						console.log(listeTas);
						console.log(tabTitre);
						console.log(tabFavorite);
						socket.emit("end",true);
						break;

					case false:
						// affichage pop-up
						let modalError = document.getElementsByClassName('Error');
						if(modalError != null){
							$('#Error').remove();// suppression pour pas qu'il y est plusieurs pop-up
						}
						initModalError();
						$('#Error').modal('show');
						console.log("il manque des noms de titre et cartes favorite");
						break;

					default:
						break;
				}
				
				console.log(tasDB);
			}
			
			console.log(tasDB);
		}
	
}

function initObserver(){
		clearInterval(checkImg);
		checkImg = setInterval(function (){
			if($("#contenuImg img").length > 0){
				$("#contenuImg img").each(function(index,element){
					Observer.observe(element);
				});
			}
		},100);
	}

function getCurrTas(){
	return tasActuel;
}

// Methode qui indique si le tas 0 (initial) est vide
function tas0isEmpty(){
	var firstIdTas = Object.keys(listeTas)[0];

	return ((listeTas[firstIdTas].length === 0) ? true : false);
}

// fonction qui détermine si les boutons doivent être affichés
function displayBtn(){
	let btnFav = document.getElementById("choixFav");
	let btnRename = document.getElementById("renameCard");
	let btnEnd = document.getElementById("end");

	if(tas0isEmpty()){ // si le tas initial est vide
		if(btnEnd === null) initEndBtn(); // on verifie si le bouton de fin n'est pas sur la page avant de le créer

		if (tasActuel == Object.keys(listeTas)[0]) {// si le joeur se trouve dans le tas intial on efface les boutons 
													// seulement s'ils y sont
			if ((btnFav != null) && (btnRename != null)) {
				btnRename.remove();
				btnFav.remove();
			}
		}else if ((btnFav === null) && (btnRename === null)) {// sinon on vérifie si les boutons n'existent pas 
			initButton();									  // avant de les ajouter
		}
	}else if ((btnEnd != null) && (btnFav != null) && (btnRename != null)){ //on efface les boutons si le tas initial n'est
		btnEnd.remove();													// pas vide
		btnRename.remove();
		btnFav.remove();
	}
}

// fonction qui vérifie si chaque tas a un nom
// donné par le joueur et une carte favorite
function isOver(){
	let tab = [];

	console.log("tasDB");
	console.log(tasDB);

	//on récupère toute les balises <a> 
	var x = document.getElementsByTagName('a');
	console.log(x);

	// on garde seulement les balises <a> qui ont un id
	// (vu que les balises <a> avec un id renvoi au tas) 
	for(let element of x){
		if(element.id != "") tab.push(element);
	}

	tab.shift() // on enlève le premier élément car c'est le tas initial
				// il n'a pas a être vérifié

	var i = 1;
	// on vérifie si tous les tas sont renommés et ont une carte favorite (excepté Tas n°0)
	for(let element of tab){

		if((listeTas[element.id].length != 0)){
			if(((tasDB[i].idLTFavorite == null)) || (element.text.includes("Tas n°"))){
				return false;
			}
		}
		
		i++;
	}

	return true;
}

// vérifie si la carte est favorite
function isCarteFav(idCarte){
	for(let element in tabFavorite){
		if(idCarte == tabFavorite[element]) return true;
	}

	return false
}