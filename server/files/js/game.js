const socket = io.connect('http://localhost:8080');
const urlcourante = document.location.href; 
const idSalle = urlcourante.substring (urlcourante.lastIndexOf( "/" )+1 );
var Spectateur ="none";
var tasDB= 'none';
var ligneTasDB = 'none';
var tabTitre = {};
var tabFavorite = {};
var loaded = 0;
var Observer;
var checkImg;

socket.on("console",function(message){
	console.log(message);
});

socket.on("erreur",function(errorCode){
	switch (errorCode){
		case 0:
		document.location.reload(true);
		break;
	}
});
socket.on("Spectateur",function(data){
	Spectateur=data;
	if(Spectateur == 0){
		Observer = new IntersectionObserver( 
			entries => {
				entries.forEach(ent => {
					if(ent.isIntersecting == true){
						window.requestIdleCallback(function(){socket.emit("carteVisible",ent.target.getAttribute("idLpaquet"))});
					}
					else{
						window.requestIdleCallback(function(){socket.emit("carteNonVisible",ent.target.getAttribute("idLpaquet"))});
					}
				});
			}, 
			options = {
  				root: document.querySelector('#content'),
  				rootMargin: '0px',
  				threshold: 1.0
			}
		);
	}
});
socket.on("carteVisible",function(data){
	$("#contenuImg img").each(function(index,element){if(element.getAttribute("idLPaquet") == data){element.style.borderColor="red";}});
});
socket.on("carteNonVisible",function(data){
	$("#contenuImg img").each(function(index,element){if(element.getAttribute("idLPaquet") == data){element.style.borderColor="black";}});
});
socket.on("statut",function(statut){
	switch (statut){
		case 0:
			console.log("statut = 0");
			loaded = 0;
			switchWaitingForPlayer();
			break;
		case 1:
			socket.emit("getTas","true");
			loadGame();
			break;
		
	}
});
socket.on("ChangeTas",function(data){
	let dataP = JSON.parse(data);
	afficheTas(dataP["idTas"],dataP["nom"]);
});
socket.on("Tas",function(data){
	tasDB = JSON.parse(data);
});
socket.on("renameTas",function(data){
	tasDB ="none";
	ligneTasDB="none";
	socket.emit("getTas",true);
	loadGame();
});
socket.on("favoriteCard",function(data){
	
});
socket.on("LigneTas",function(data){
	ligneTasDB = JSON.parse(data);
});
socket.on("MoveCardToTas",function(data){
	//Dans le cas ou on reçois un input avant que la page soit complétement chargée
	dataRead = JSON.parse(data);
	console.log(dataRead);
	safeMoveCards(dataRead);
});
function safeMoveCards(data){
	var checkloaded = setInterval(function (){
		if(loaded == 1){
			changementTas2(data["idTasCible"],data["idLpaquet"],data["idTas"]);
			clearInterval(checkloaded);
		}
	},100);
}
function loadGame(){
	var checkinit = setInterval(function (){
		console.log(Spectateur);
		if(tasDB != "none" && ligneTasDB != "none" && Spectateur !="none"){
			initTas(tasDB,ligneTasDB);
			console.log(tasDB);
			console.log(ligneTasDB);
			switchGameMode();
			clearInterval(checkinit);
			console.log("Tas et LigneTas init");
		}
	},100);
}
function switchWaitingForPlayer(){
	let container = document.querySelector("body");
	container.innerHTML = "";
		let pMessage = document.createElement("p");
		pMessage.innerHTML = "Donnez ce lien au joueur";
	container.appendChild(pMessage);
		let pURL = document.createElement("p");
		pURL.innerHTML = urlcourante;
	container.appendChild(pURL);
}
function showLoadingScreen(container){
	let load = document.createElement("div");
	load.className = "spinner-border beforeLoading";
	container.appendChild(load);
}
function switchGameMode(){
	let container = document.querySelector("body");
	container.innerHTML = "";
	showLoadingScreen(container);
		let wrapper = document.createElement("div");
		wrapper.className ="wrapper";
		createSideBar(wrapper);
		createContent(wrapper);
		createModal(wrapper,7);
		createModalRenameTas(wrapper);
	container.innerHTML = "";
	container.appendChild(wrapper);
	initmodal();
	initRenameModal();
	initTabTitre();	

	

}
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
										tas.onclick = function(){console.log(this.num);afficheTas(this.num,this.innerHTML)};
										tas.innerHTML = tasDB[i]["nom"];

										// ajout bouton qui declenche le modal
										// qui permet de nommer un tas
										var btn = document.createElement("button");
										btn.className = "btn btn-sm btn-dark";
										btn.setAttribute("type", "button");
										btn.setAttribute("data-toggle", "modal");
										btn.setAttribute("data-target", "#modalRename");
										btn.innerHTML = "Renommer tas";
										btn.id = tasDB[i]["idTas"];

										// bouton qui sert a choisir la carte favorite du tas
										var btn2 = document.createElement("button");
										btn2.id = tasDB[i]["idTas"];
										btn2.setAttribute("type", "button");
										btn2.innerHTML = "choisir carte favorite";
										btn2.id = tasDB[i]["idTas"]+"b";
										btn2.onclick = function() {
											console.log(this.id);
											console.log("veuillez choisir votre carte favorite");
											$("#contenuImg img").attr("data-toggle", ""); //désactivation du modal pour choisir la carte favorite
											$("#contenuImg img").click(function(event){
												console.log($(this).attr('id'));
												var idCarte = $(this).attr('id');
												var idLPaquet = $(this).attr("idLpaquet");
												socket.emit("favoriteCard",JSON.stringify({idLPaquet: idLPaquet, idTas : tasActuel}));
												idCarte = idCarte.slice(0, -1);
												$(this).css("border-color","blue");
												$("#contenuImg img").each(function(index,element){
													$(element).unbind('click');
												});
												setTimeout(function(){ $("img").attr("data-toggle", "modal"); }, 100); //réactivation du modal
											});
										};

									liTas.appendChild(tas);
									liTas.appendChild(btn);
									liTas.appendChild(btn2);
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
		let contenuImg = document.createElement("div");
			contenuImg.id="contenuImg";
		content.appendChild(contenuImg);
	wrapper.appendChild(content)
}
function createModal(wrapper,nbrTas){
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
								label.setAttribute("for","t"+i);
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

//------------------------------------------------//
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

function initRenameModal(){
	$('#modalRename').on('show.bs.modal', function (event) {
		var modal = $(this);
		var button = $(event.relatedTarget);

		// on recupere ce qui est ecrit dans le champs de texte
		$('#validation').unbind().click(function (){
			var field = $("#titretas").val(); // le contenue du champs de text
			console.log(field);
			modal.modal('hide');
			var precedent = button.prev();
			// modifie le titre dans html
			precedent[0].innerText = field;
			var idTas = $(button).attr('id');
			//on met a jour le tableau contenant la liste des noms
			//donnés au tas par le joueur
			tabTitre[idTas] = field;
			socket.emit("renommerTas",JSON.stringify({idTas: idTas, nNom : field}));
			// on vide le champ de text
			$("#titretas").val('');
			console.log(tabTitre);
		});
	});
}

// initialisation du tableau qui contient les noms
// donnés au tas par le joueur
function initTabTitre(){
	for(var i = 0; i < tasDB.length; i++){
		tabTitre[tasDB[i]["idTas"]] = null;
		tabFavorite[tasDB[i]["idTas"]] = null;
	}
	console.log(tabTitre);
} 