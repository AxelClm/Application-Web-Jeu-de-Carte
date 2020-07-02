const socket = io.connect();
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
					if(ent.intersectionRatio == 1){
						socket.emit("carteVisible",ent.target.getAttribute("idLpaquet"));
					}
					else{
						socket.emit("carteNonVisible",ent.target.getAttribute("idLpaquet"));
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
		case 0: // si le joueur n'est pas dans la salle
			console.log("statut = 0");
			loaded = 0;
			switchWaitingForPlayer();
			break;
		case 1: // si le joueur est dans la salle
			socket.emit("getTas","true");
			loadGame();
			break;
		case 2: //lorsque le joueur a terminé
			intiResult();// affichage des resultats
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
	let dataRead = JSON.parse(data);
	let currTas = getCurrTas();
	tabTitre[dataRead["idTas"]] = dataRead["nNom"];
	$('#'+dataRead["idTas"]).text(dataRead["nNom"]);
	afficheTas(currTas,$("#"+currTas).html());
});
socket.on("favorite",function(data){
	let dataRead = JSON.parse(data);
	tasDB[tasDB.findIndex(x => x.idTas == dataRead["idTas"])].idLTFavorite = dataRead["idLPaquet"];
	afficheTas(tasActuel,$("#"+tasActuel).html());
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
		let button = document.createElement("button");
			button.onclick = function(){
				window.location="/leaveRoom";
			}
			button.innerHTML = "Quitter la salle";
	container.appendChild(button);
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
		createModal(wrapper);
		createModalRenameTas(wrapper);
	container.innerHTML = "";
	container.appendChild(wrapper);
	initmodal();
	initRenameModal();
	initTabTitre();	
}