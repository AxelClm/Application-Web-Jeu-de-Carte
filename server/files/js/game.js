const socket = io.connect('http://localhost:8080');
const urlcourante = document.location.href; 
const idSalle = urlcourante.substring (urlcourante.lastIndexOf( "/" )+1 );

var tasDB= '[{"idTas":136,"nom":"Tas n°0"},{"idTas":137,"nom":"Tas n°1"}]';
var ligneTasDB = 'none';
var tabTitre = {};
var tabFavorite = {};


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

socket.on("statut",function(statut){
	switch (statut){
		case 0:
			console.log("statut = 0");
			switchWaitingForPlayer();
			break;
		case 1:
			socket.emit("getTas","true");
			loadGame();
			break;
		
	}
});
socket.on("Tas",function(data){
	tasDB = JSON.parse(data);
});

socket.on("LigneTas",function(data){
	ligneTasDB = JSON.parse(data);
});
function loadGame(){
	var checkinit = setInterval(function (){
		if(tasDB != "none" && ligneTasDB != "none"){
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
											$("img").attr("data-toggle", ""); //désactivation du modal pour choisir la carte favorite
											$("img").click(function(event){
												console.log($(this).attr('id'));
												var idCarte = $(this).attr('id');
												idCarte = idCarte.slice(0, -1); 
												setTimeout(function(){ $("img").attr("data-toggle", "modal"); }, 3000); //réactivation du modal
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
			console.log($(button).attr('id'));

			//on met a jour le tableau contenant la liste des noms
			//donnés au tas par le joueur
			tabTitre[$(button).attr('id')] = field;

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