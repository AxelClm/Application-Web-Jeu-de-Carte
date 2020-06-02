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

function switchGameMode(){
	let container = document.querySelector("body");
	container.innerHTML = "";
	drawTas(container,7);
}
function drawTas(container,nbr){
	let sidebar = document.createElement("aside");
	sidebar.id = "sidebar";
		let ul = document.createElement("ul");
		ul.className = "list-group h-auto";
		sidebar.appendChild(ul);
			let li1 = document.createElement("li");
			li1.innerHTML = "A trier";
			li1.className = "list-group-item pb-5 list-group-item-secondary";
			ul.appendChild(li1);
			for(var i = 0 ; i<nbr;i++){
				let tas = document.createElement("li");
				tas.innerHTML = "tas n°"+i;
				tas.className ="list-group-item list-group-item-secondary";
					let button = document.createElement("button");
					button.className = "ml-4 btn btn-info";
					button.innerHTML = "Aperçu";
					tas.appendChild(button);
				ul.appendChild(tas);
			}
		sidebar.appendChild(ul);
	container.appendChild(sidebar);
}