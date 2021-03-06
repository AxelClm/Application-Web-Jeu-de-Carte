	//Variables
	var listeTas = {}; //objet contenant toute les tas
	var tasActuel = 0;
	var suffixe = "Tas"

	// cartes et tas recuperes de la base de donnee (simulation)
	var tasDB = [{"idTas":136,"nom":"Tas n°0"},{"idTas":137,"nom":"Tas n°1"},{"idTas":138,"nom":"Tas n°2"},{"idTas":139,"nom":"Tas n°3"},{"idTas":140,"nom":"Tas n°4"},{"idTas":141,"nom":"Tas n°5"},{"idTas":142,"nom":"Tas n°6"}];
	var carteDB = [{"idTas":171,"idCarte":1,"image":"1"},{"idTas":171,"idCarte":1,"image":"1"},{"idTas":171,"idCarte":2,"image":"2"}];

	// creation des tas vides
	for (var i = 0; i < 8; i++) {
		listeTas[suffixe+i] = [];
	}


	//ajout des cartes dans le tas initial
	for (var i = 0; i< carteDB.length; i++) {
		listeTas.Tas0.push({"id" : carteDB[i]["idCarte"], "emplacement" : "images/ExempleCarte"+carteDB[i]["idCarte"]});
	}

	console.log(listeTas.Tas0);


	//methode qui supprime Element de son tas pour
	//le déplacer vers tas choisi par l'utilisateur
	function changementTas (choix, idCarte){
		//on cherche la position de la carte selectionee dans le tableau
		var txt = suffixe+tasActuel;
		var indexCarte = listeTas[txt].findIndex(x => x.id == idCarte);
		var tmp = listeTas[txt].splice(indexCarte, 1);

		console.log("pos "+ indexCarte);

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

		console.log(listeTas);
		console.log(txt);
		console.log(listeTas[txt]);


		//on ajoute les images dans la balise <div id="contenuImg">
		for (var i = 0; i < listeTas[txt].length; i++) {
			var img = document.createElement('img');
			img.setAttribute("data-toggle","modal");
			img.setAttribute("data-target","#exampleModal");
			img.setAttribute("src",(listeTas[txt][i]["emplacement"]+(".png")));
			img.setAttribute('id',listeTas[txt][i]["id"]);

			//ajout de marge aux images
			img.style.marginRight = "10px";
			img.style.marginBottom = "10px";

			conteneur.appendChild(img);
		}
		$("#contenuImg").fadeIn(200);
	}


	$('#exampleModal').on('show.bs.modal', function (event) {
 	var img = $(event.relatedTarget);
	var id = img[0].id;
	console.log("Carte trouvée : "+ id);
	var modal = $(this);
	var liste = modal.find('.modal-body input');
	$('#soumission').click(function (){
		var button = $(this);
		console.log(button);
		var tas = $('input[name=tas]:checked').val();
		button.onClick = changementTas(tas,id);
		$("#soumission").unbind('click');
		modal.modal('hide');
		});
	});
