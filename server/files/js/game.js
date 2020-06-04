const socket = io.connect('http://localhost:8080');
const urlcourante = document.location.href; 
const idSalle = urlcourante.substring (urlcourante.lastIndexOf( "/" )+1 );

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
			switchGameMode();
			break;
		
	}
});

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
		createSideBar(wrapper,7);
		createContent(wrapper);
		createModal(wrapper,7);
	container.innerHTML = "";
	container.appendChild(wrapper);
	initmodal();

}
function createSideBar(wrapper,nbrTas){
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
							for(var i = 0;i<nbrTas;i++){
								let liTas = document.createElement("li");
										let tas = document.createElement("a");
										tas.num = i;
										tas.onclick = function(){console.log(this.num);afficheTas(this.num)};
										tas.innerHTML = "Tas n°"+i;
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
					div.innerHTML="A trier sqkdjqksjdqjslkjdskqjsdj";
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
					for(var i =0;i<nbrTas;i++){
						let div = document.createElement("div");
							let inputButton = document.createElement("input");
								inputButton.setAttribute("type","radio");
								inputButton.setAttribute("name","tas");
								inputButton.setAttribute("value",i);
								inputButton.id = "t"+i;
								inputButton.setAttribute("checked","true");
							div.appendChild(inputButton);
							let label = document.createElement("label");
								label.setAttribute("for","t"+i);
								label.innerHTML = "Tas n°"+i;
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
      	clearInterval(checkExist);
   		}
	}, 100);
}