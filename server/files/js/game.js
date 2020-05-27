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
	}
});

function switchWaitingForPlayer(){
	let container = document.querySelector("#container");
	container.innerHTML = "";
		let pMessage = document.createElement("p");
		pMessage.innerHTML = "Donnez ce lien au joueur";
	container.appendChild(pMessage);
		let pURL = document.createElement("p");
		pURL.innerHTML = urlcourante;
	container.appendChild(pURL);
}