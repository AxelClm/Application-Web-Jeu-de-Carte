	//Variables
	var listeTas = {}; //objet contenant toute les tas
	var tasActuel = 0;
	var suffixe = "Tas"


	// creation des tas vides
	for (var i = 0; i < 8; i++) {
		listeTas[suffixe+i] = [];
	}

	console.log(listeTas);


	//ajout des cartes dans le tas initial
	for (var i = 0; i < 5; i++) {
		listeTas.Tas0.push({"id" : i+1, "emplacement" : "images/ExempleCarte"+(i+1)});
	}

	listeTas.Tas7.push({"id" : 12, "emplacement" : "images/ExempleCarte"+(12)});
	console.log(listeTas);
	//methode qui supprime Element de son tas pour
	//le déplacer vers tas choisi par l'utilisateur
	function changementTas (choix, idCarte){
		//on cherche la position de la carte selectionee dans le tableau
		var txt = suffixe+tasActuel;
		var indexCarte = listeTas[txt].findIndex(x => x.id == idCarte);
		var tmp = listeTas[txt].splice(indexCarte, 1);
		console.log("choix: "+choix);
		console.log("pos: "+ indexCarte);

		console.log("carte tirée :");
		console.log(tmp[0]);

		tmp = tmp[0];

		//on transfert la carte dans le tas selectionné
		txt = suffixe+choix;
		listeTas[txt].push(tmp);
		console.log("Nouveau tableau");
		console.log(listeTas);

		//on reactualise l'affichage
		afficheTas(tasActuel);
	}


	//methode qui affiche les cartes appartenant au tas sélectionné
	function afficheTas(argument) {
		var txt = suffixe+argument;
		tasActuel = argument;
		// on ajoute dans les cartes dans la balise <div> ayant pour id "contenuImg"
		var conteneur = document.getElementById('contenuImg');
		$("#contenuImg").stop();
		$("#contenuImg").hide();
		//on vide le conteneur au cas où la
		// la page affiche déjà des cartes
		while(conteneur.hasChildNodes()){
			conteneur.removeChild(conteneur.lastChild);
		}
		//On change l'affichage
		$("#nomTas").html("Tas n°"+tasActuel);
		$("#capacitéTas").html(listeTas[txt].length);
		console.log(listeTas);
		console.log(txt);
		console.log(listeTas[txt]);
		//on ajoute les images a la balise <div> avec le classe image
		//on ajoute les images dans la balise <div id="contenuImg">
		for (var i = 0; i < listeTas[txt].length; i++) {
			var img = document.createElement('img');
			img.setAttribute("data-toggle","modal");
			img.setAttribute("data-target","#exampleModal");
			console.log((listeTas[txt][i]["emplacement"]+(".png")));
			img.setAttribute("src","/"+(listeTas[txt][i]["emplacement"]+(".png")));
			img.setAttribute('id',listeTas[txt][i]["id"]);

			//ajout de marge aux images
			img.style.marginRight = "10px";
			img.style.marginBottom = "10px";

			conteneur.appendChild(img);
		}	
		$("#contenuImg").fadeIn(200);
	}

