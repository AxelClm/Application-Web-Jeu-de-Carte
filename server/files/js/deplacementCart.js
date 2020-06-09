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
			listeTas[row["idTas"]].push({idCarte :row["idCarte"],image :row["image"]});
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
		console.log("choix: "+choix);
		console.log("pos: "+ indexCarte);

		console.log("carte tirée :");
		console.log(tmp[0]);

		tmp = tmp[0];

		//on transfert la carte dans le tas selectionné
		listeTas[choix].push(tmp);
		console.log("Nouveau tableau");
		console.log(listeTas);

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
		//On change l'affichage
		$("#nomTas").html(nom);
		$("#capacitéTas").html(listeTas[idTas].length);
		console.log(listeTas);
		console.log(listeTas[idTas]);
		//on ajoute les images a la balise <div> avec le classe image
		//on ajoute les images dans la balise <div id="contenuImg">
		//on commence par 1 car le premier indice contient l'id du tas
		for (var i = 0; i < listeTas[idTas].length; i++) {
			var img = document.createElement('img');
			img.setAttribute("data-toggle","modal");
			img.setAttribute("data-target","#exampleModal");
			console.log((listeTas[idTas][i]["image"]+(".png")));
			img.setAttribute("src","/images/"+(listeTas[idTas][i]["image"]+(".png")));
			img.setAttribute('id',listeTas[idTas][i]["idCarte"]);

			//ajout de marge aux images
			img.style.marginRight = "10px";
			img.style.marginBottom = "10px";

			conteneur.appendChild(img);
		}	
		$("#contenuImg").fadeIn(200);
	}

