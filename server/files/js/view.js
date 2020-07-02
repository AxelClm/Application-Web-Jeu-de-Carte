// creation de la side bar
function createSideBar(wrapper){
	let sidebar = document.createElement("nav");
		sidebar.id = "sidebar";
			let ul = document.createElement("ul");
			ul.className = "list-unstyled components";
				let li = document.createElement("li");
				li.className= "active";
					let lien = document.createElement("a");
						lien.href="#tasSubMenu";
						lien.setAttribute("data-toggle","collapse");
						lien.setAttribute("aria-expended","false");
						lien.className = "dropdown-toggle";
						lien.innerHTML="Tas";
				li.appendChild(lien);
					let tasUL = document.createElement("ul");
						tasUL.className="collapse list-unstyled";
						tasUL.id = "tasSubMenu";
							for(var i = 0;i<tasDB.length;i++){
								let liTas = document.createElement("li");
										let tas = document.createElement("a");
										tas.num = tasDB[i]["idTas"];
										tas.id = tasDB[i]["idTas"];
										tas.onclick = function(){console.log(this.num);afficheTas(this.num,this.innerHTML)};
										tas.innerHTML = tasDB[i]["nom"];
									liTas.appendChild(tas);
								tasUL.appendChild(liTas);
							}
				li.appendChild(tasUL);
			ul.appendChild(li);
		sidebar.appendChild(ul);
	wrapper.appendChild(sidebar);
	$(document).ready(function () {
            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').toggleClass('active');
            });
        });
}

// creation de la  div qui contient les cartes
function createContent(wrapper){
	let content = document.createElement("div");
		content.id='content';
		let nav = document.createElement("nav");
			nav.className="navbar navbar-expand-lg navbar-light bg-light";
				let container = document.createElement("div");
				container.className="container-fluid";
					let button = document.createElement("button");
					button.className ="btn btn-info";
					button.id = "sidebarCollapse";
				container.appendChild(button);
					let div = document.createElement("div");
					div.innerHTML="";
					div.id = "nomTas"
				container.appendChild(div);
					let div2 = document.createElement("div");
					div2.innerHTML = 48;
					div2.id = "capacitéTas"
				container.appendChild(div2);
			nav.appendChild(container);
		content.appendChild(nav);

		//div contenant les boutons de mise en favoris 
		//de carte et le nomma des tas
		let divBtn = document.createElement("div");
			divBtn.id = "divBtn";
		content.appendChild(divBtn);	
			
		let contenuImg = document.createElement("div");
			contenuImg.id="contenuImg";
		content.appendChild(contenuImg);
	wrapper.appendChild(content)
}

// creation du modal pour le déplacement de la carte
// fonctionnement modal
//https://getbootstrap.com/docs/4.0/components/modal/
function createModal(wrapper){
	let modalFade = document.createElement("div");
		modalFade.id="exampleModal";
		modalFade.className="modal fade";
		modalFade.setAttribute("tabindex","-1");
		modalFade.setAttribute("role","dialog");
		modalFade.setAttribute("aria-labelledby","exampleModalLabel");
		modalFade.setAttribute("aria-hidden","true");
		let modalDialog = document.createElement("div");
			modalDialog.className="modal-dialog";
			modalDialog.setAttribute("role","document");
			let modalContent = document.createElement("div");
				modalContent.className="modal-content";
				let modalHeader = document.createElement("div");
				modalHeader.className="modal-header";
					let modalTitle = document.createElement("h5");
						modalTitle.className="modal-tilte";
						modalTitle.id = "exampleModalLabel";
						modalTitle.innerHTML="Déplacer la carte vers le tas";
					modalHeader.appendChild(modalTitle);
			modalContent.appendChild(modalHeader);
				let modalBody = document.createElement("div");
					modalBody.className="modal-body";
					for(var i =0;i<tasDB.length;i++){
						let div = document.createElement("div");
							let inputButton = document.createElement("input");
								inputButton.setAttribute("type","radio");
								inputButton.setAttribute("name","tas");
								inputButton.setAttribute("value",tasDB[i]["idTas"]);
								inputButton.id = "t"+tasDB[i]["idTas"];
								inputButton.setAttribute("checked","true");
							div.appendChild(inputButton);
							let label = document.createElement("label");
								label.setAttribute("for","t"+tasDB[i]["idTas"]);
								label.innerHTML = tasDB[i]["nom"];
							div.appendChild(label);
						modalBody.appendChild(div);
					}
			modalContent.appendChild(modalBody);
				let modalFooter = document.createElement("div");
					modalFooter.className="modal-footer";
						let annuler = document.createElement("button");
							annuler.className = "btn btn-secondary";
							annuler.setAttribute("data-dismiss","modal");
							annuler.setAttribute("type","button");
							annuler.innerHTML="Annuler";
					modalFooter.appendChild(annuler);
						let envoyer = document.createElement("button");
							envoyer.setAttribute("type","button");
							envoyer.className = "btn btn-primary";
							envoyer.id = "soumission"
							envoyer.innerHTML="Valider";
					modalFooter.appendChild(envoyer);
			modalContent.appendChild(modalFooter);
		modalDialog.appendChild(modalContent);
	modalFade.appendChild(modalDialog);
	wrapper.appendChild(modalFade);
}

// fonction qui affiche le modal lorsqu'une carte est cliquée
function initmodal(){
	var checkExist = setInterval(function() {
   		if ($('#exampleModal').length) {
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
		afficheTas(tasDB[0]["idTas"], tasDB[0]["nom"]);
		loaded = 1;
		initRenameModal();
      	clearInterval(checkExist);
   		}
	}, 100);
}

// creation du modal qui permet de nommer le tas
function createModalRenameTas(wrapper){
	var modal = document.createElement("div");
	modal.className = "modal fade";
	modal.id = "modalRename";
	modal.setAttribute("tabindex","-1");
	modal.setAttribute("role","dialog");
	modal.setAttribute("aria-labelledby","exampleModalLabel");
	modal.setAttribute("aria-hidden","true");
		var modalDialog = document.createElement("div");
		modalDialog.className = "modal-dialog";
		modalDialog.setAttribute("role", "document");
			var modalContent = document.createElement("div");
			modalContent.className = "modal-content";
				var modalHeader = document.createElement("div");
				modalHeader.className = "modal-header";
					var modalTitle = document.createElement("h5");
					modalTitle.className = "modal-tilte";
					modalTitle.id = modal.getAttribute("aria-labelledby");
					modalTitle.innerHTML = "Nommage du tas";
				modalHeader.appendChild(modalTitle);
			modalContent.appendChild(modalHeader);
				var modalBody = document.createElement("div");
				modalBody.className = "modal-body";
					var label = document.createElement("label");
					label.innerHTML = "Nommer le tas :";
					label.setAttribute("for", "titretas");				
					var input = document.createElement("input");
					input.id = "titretas";
					input.setAttribute("type", "text");
				modalBody.appendChild(label);
				modalBody.appendChild(input);
			modalContent.appendChild(modalBody);
				var modalFooter = document.createElement("div");
				modalFooter.className = "modal-footer";
					var btn = document.createElement("button");
					btn.setAttribute("type", "button");
					btn.className ="btn btn-secondary";
					btn.innerHTML = "Annuler";
					btn.setAttribute("data-dismiss", "modal");
					var btn2 = document.createElement("button");
					btn2.setAttribute("type", "button");
					btn2.className = "btn btn-primary";
					btn2.innerHTML = "Valider";
					btn2.id = "validation";
				modalFooter.appendChild(btn);
				modalFooter.appendChild(btn2);
			modalContent.appendChild(modalFooter);
		modalDialog.appendChild(modalContent);
	modal.appendChild(modalDialog);
	wrapper.appendChild(modal);
}

// fonction qui affiche le modal lorsqu'on appuie sur le bouton renommer
function initRenameModal(){
	$('#modalRename').on('show.bs.modal', function (event) {
		var modal = $(this);
		var button = $(event.relatedTarget);

		// on recupere ce qui est ecrit dans le champs de texte
		$('#validation').unbind().click(function (){
			currTas = getCurrTas();
			var field = $("#titretas").val(); // le contenue du champs de text
			console.log(field);
			modal.modal('hide');
      		socket.emit("renommerTas",JSON.stringify({idTas: currTas, nNom : field}));
			//on met a jour le tableau contenant la liste des noms
			//donnés au tas par le joueur
			tabTitre[currTas] = field;

			// modifie le titre dans html
			$("#nomTas").text(field);

			// modifie le titre du tas dans la sidebar
			$('#'+currTas).text(field);
			// on vide le champ de text
			$("#titretas").val('');
			console.log(tabTitre);
		});
	});
}

// initialisation du tableau qui contient les noms
// donnés au tas par le joueur
function initTabTitre(){
	for(var i = 1; i < tasDB.length; i++){
		tabTitre[tasDB[i]["idTas"]] = tasDB[i]["nom"]; // on copie les noms qui sont dans tasDB au cas où il y a une déconnexion de la part du joueur 
		tabFavorite[tasDB[i]["idTas"]] = null;         // car tasDB garde les titres donnés par le joueur
	}
	console.log(tabTitre);
}

//Méthode qui crée boutons choix carte favorite et
//modification du titre du tas
function initButton(){
	let currTas = getCurrTas();

	// div contenant les boutons
	let contentBtn = document.getElementById('divBtn');
	contentBtn.style.marginBottom = "20px";

		// Bouton de rennommage de tas 
		let btn = document.createElement("button");
		btn.setAttribute("type","button");
		btn.setAttribute("data-toggle", "modal");
		btn.setAttribute("data-target", "#modalRename");
		btn.className = "btn btn-info btn-sm"
		btn.id = "renameCard"
		btn.innerHTML = "Renommer le tas";
		btn.style.marginRight = "10px";

		//bouton choix carte favorite
		let btn2 = document.createElement("button");
		btn2.setAttribute("type","button");
		btn2.className = "btn btn-info btn-sm";
		btn2.innerHTML= "Choisir une carte favorite";
		btn2.id = "choixFav";
		btn2.onclick = function() {
			console.log("veuillez choisir votre carte favorite");
			$("#contenuImg img").attr("data-toggle", ""); //désactivation du modal pour choisir la carte favorite
			$("#contenuImg img").click(function(event){
				console.log($(this).attr('id'));
				var idCarte = $(this).attr('id');
	      var idLPaquet = $(this).attr('idLPaquet');
				tasDB[tasDB.findIndex(x => x.idTas == tasActuel)].idLTFavorite = idLPaquet;
				$("#contenuImg img").removeClass("fav");
				$(this).addClass("fav");
	      socket.emit("favorite",JSON.stringify({idTas: tasActuel, idLPaquet: idLPaquet}));
				$("#contenuImg img").each(function(index,element){
					$(element).unbind('click');
				});
				tabFavorite[getCurrTas()] = idCarte;
				setTimeout(function(){ $("img").attr("data-toggle", "modal"); }, 100); //réactivation du modal
			});
		};

	contentBtn.appendChild(btn);
	contentBtn.appendChild(btn2);
}

// Bouton qui affiche la fin de jeu
function initEndBtn(){
	let ul = document.getElementById('tasSubMenu');

	let btn = document.createElement('button');
	btn.setAttribute("type","button");
	btn.className = "btn btn-success btn-sm";
	btn.id = "end";
	btn.innerHTML = "J'ai fini !";
	btn.style.marginLeft = "15px";

	//ajout du bouton dans la sidebar
	ul.appendChild(btn);
}

//modal qui s'affiche s'il reste des tas qui ne sont pas renommés
// et qui n'ont pas de carte favorite
function initModalError(){

	let wrapper = document.getElementsByClassName('wrapper');
	wrapper = wrapper[0];

	let modal = document.createElement("div");
	modal.className = "modal fade";
	modal.id = "Error";
	modal.setAttribute("tabindex","-1");
	modal.setAttribute("role","dialog");
	modal.setAttribute("aria-labelledby","modalErrorLabel");
	modal.setAttribute("aria-hidden","true");
		var modalDialog = document.createElement("div");
		modalDialog.className = "modal-dialog";
		modalDialog.setAttribute("role", "document");
			var modalContent = document.createElement("div");
			modalContent.className = "modal-content";
				var modalHeader = document.createElement("div");
				modalHeader.className = "modal-header";
					var modalTitle = document.createElement("h5");
					modalTitle.className = "modal-tilte";
					modalTitle.id = "modalErrorLabel";
					modalTitle.innerHTML = "Informations manquantes";
				var modalBody = document.createElement("div");
				modalBody.className = "modal-body";
				var modalFooter = document.createElement("div");
				modalFooter.className = "modal-footer";
					var btn = document.createElement("btn");
					btn.className = "btn btn-primary";
					btn.innerHTML = "OK";
					btn.setAttribute("type","button");
					btn.setAttribute("data-dismiss", "modal");
				modalFooter.appendChild(btn);
				modalHeader.appendChild(modalTitle)
			modalContent.appendChild(modalHeader);
			modalContent.appendChild(modalBody);
			modalContent.appendChild(modalFooter);
		modalDialog.appendChild(modalContent);
	modal.appendChild(modalDialog);


	// on indique les tas qui n'ont pas de carte favorite
	for(let i = 1; i < tasDB.length; i++){
		if ((tasDB[i].idLTFavorite == null) && (listeTas[tasDB[i].idTas].length != 0)){
			let p = document.createElement("p");
			p.style.marginBottom = "10px";
			var node = document.createTextNode(tabTitre[tasDB[i].idTas] +" n'a pas de carte favorite.");
			p.appendChild(node);
			modalBody.appendChild(p);
		}
	}

	// on indique les tas qui n'ont pas été renommés
	for(let i = 1; i < tasDB.length; i++){
		if ((tabTitre[tasDB[i].idTas].includes("Tas n°")) && (listeTas[tasDB[i].idTas].length != 0)){
			let p = document.createElement("p");
			p.style.marginBottom = "10px";
			var node = document.createTextNode(tabTitre[tasDB[i].idTas] +" doit être renommé.");
			p.appendChild(node);
			modalBody.appendChild(p);
		}
	}

	wrapper.appendChild(modal);
}


// Affichage de la table de resultat
function intiResult(){
	var tabIdTas = Object.keys(tabTitre);

	var table = document.createElement('table');
	var thead = document.createElement('thead');
	var tbody = document.createElement('tbody');
	var tr1 = document.createElement('tr');
	var th1 = document.createElement('th');
	var th2 = document.createElement('th');
	var th3 = document.createElement('th');

	// bouton qui permet de quitter la salle
	var btn = document.createElement('button');
	btn.setAttribute("type","button");
	btn.id = "out";
	btn.className = "btn btn-danger m-2";
	btn.innerText = "Quitter la salle";
	btn.onclick = function(){
		window.location.href = "/login";
	}

	let wrapper = document.getElementsByClassName('wrapper')[0];
	

	let h1 = document.createElement('h1');
	h1.innerHTML = "Page de résultats";
	h1.style.marginRight = "10px";

	wrapper.innerHTML = "";
	wrapper.style.display = "block";

	//Tableau de résultat
	table.id = 'tabResult';
	table.className = "table table-striped";

	th1.innerHTML = "ID carte";
	th2.innerHTML = "Nom du tas";
	th3.innerHTML = "Carte favorite";

	th1.setAttribute('scope', 'col');
	th2.setAttribute('scope', 'col');
	th3.setAttribute('scope', 'col');

	tr1.appendChild(th1);
	tr1.appendChild(th2);
	tr1.appendChild(th3);
	thead.appendChild(tr1);
	table.appendChild(thead);
	table.appendChild(tbody);

	var j = -2;
	for(let tab in listeTas){
		j++;
		for(var i = 0; i < listeTas[tab].length; i++){
			var tr = document.createElement('tr');
			var td1 = document.createElement('td');
			var td2 = document.createElement('td');
			var td3 = document.createElement('td');

			td1.innerHTML = listeTas[tab][i]['idCarte'];
			td2.innerHTML = tabTitre[tabIdTas[j]];
			td3.innerHTML = isCarteFav(listeTas[tab][i]['idCarte']) ? 'Oui' : 'Non';

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);

			tbody.appendChild(tr);
		}
	}


	table.appendChild(tbody);
	wrapper.appendChild(h1);
	wrapper.appendChild(btn);
	wrapper.appendChild(table);
}
