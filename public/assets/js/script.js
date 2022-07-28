// declarations de variables
const socket = io();
let monSocketClients = [];
let mesMessages = [];

let monId;
const clients = document.getElementById("clients");
const messagesFrame = document.getElementById("messagesFrame");
const private = document.getElementById("private");//modale
const sendPrivate = document.getElementById("sendPrivate");//bouton envoie private
const responsePrivate = document.getElementById("responsePrivate");
const responsePrivateInner = document.getElementById("responsePrivateInner");
const closePrivate = document.getElementById("closePrivate")
const closeResponsePrivate = document.getElementById("closeResponsePrivate");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pseudo = urlParams.get('pseudo');

// déclarations de fonctions
function displayClients(monSocketClients) {
    let clientsTmp = "";
    monSocketClients.forEach(element => {
        if(monId !== element.id){
            clientsTmp += `<div onclick="privateMessage('${element.id}');" >${element.pseudo}</div>`;
        }
    });
    clients.innerHTML = clientsTmp;
}
function privateMessage(idContact) {
    // j'ouvre une modale qui contient un textarea tinymce et un bouton "Envoie privé"
    private.classList.remove('hide');
    private.classList.add('show');
    //console.log(idContact)
    tinymce.init({
        selector: '#myprivate',
        plugins: [
            'a11ychecker', 'advlist', 'advcode', 'advtable', 'autolink', 'checklist', 'export',
            'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
            'powerpaste', 'fullscreen', 'formatpainter', 'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
        ],
        toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
    });
   
    function fuckingFunction() {
        let monMessage = tinyMCE.get('myprivate').getContent();
        let date = new Date();
        // idContact, monId, pseudo
        socket.emit("newPrivateMessage", {
            message: monMessage,
            date: date,
            idContact: idContact,
            id: monId,
            pseudo: pseudo
        })
        tinyMCE.activeEditor.setContent('');
        private.classList.add('hide');
        private.classList.remove('show');
        sendPrivate.removeEventListener("click", fuckingFunction);
    }
    
    
    
    sendPrivate.addEventListener("click", fuckingFunction);
    closePrivate.addEventListener("click",()=>{
        tinyMCE.activeEditor.setContent('');
        private.classList.add('hide');
        private.classList.remove('show');
        sendPrivate.removeEventListener('click',()=>{
            
        })
    })
}
function displayMessages(mesMessages) {
    let messagesTmp = "";
    mesMessages.forEach(element => {
        messagesTmp += `<div class="messages">${element.pseudo}: ${element.message}</div>`
    });
    messagesFrame.innerHTML = messagesTmp;
}

tinymce.init({
    selector: '#mytextarea',
    plugins: [
        'a11ychecker', 'advlist', 'advcode', 'advtable', 'autolink', 'checklist', 'export',
        'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
        'powerpaste', 'fullscreen', 'formatpainter', 'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor emoticons | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});

document.getElementById("sendMessage").addEventListener("click", () => {
    let monMessage = tinyMCE.get('mytextarea').getContent();
    let date = new Date();
    // je possede déjà monId et pseudo
    mesMessages.push({
        id: monId,
        pseudo: pseudo,
        message: monMessage,
        date: date
    })
    //console.dir(mesMessages);
    socket.emit("newMessage", { messages: mesMessages })
    tinyMCE.activeEditor.setContent('');
    displayMessages(mesMessages);
})

socket.on("init", (init) => {
    console.log(init.message);
    //console.log(init.id);
    monId = init.id;
    monSocketClients = init.socketClients;
    mesMessages = init.messages;
    //pseudo = prompt("Veuillez vous identifier");
    // j'ajoute mon pseudo au tableau des clients
    for (let i = 0; i < monSocketClients.length; i++) {
        if (monSocketClients[i].id === monId) {
            monSocketClients[i].pseudo = pseudo;
        }
    }
    //console.dir(monSocketClients);
    // je dois maintenant renvoyer au serveur le tableau de clients modifié
    socket.emit('initResponse', {
        socketClients: monSocketClients
    })
    //displayClients
    displayClients(monSocketClients);
    displayMessages(mesMessages);
})
socket.on('newClient', (newClient) => {
    monSocketClients = newClient.socketClients;
    // displayClients
    displayClients(monSocketClients);
})
socket.on('clientDisconnect', (clientDisconnect) => {
    monSocketClients = clientDisconnect.socketClients;
    //console.dir(monSocketClients);
    //displayClients
    displayClients(monSocketClients);
})
socket.on('newMessageResponse', (newMessageResponse) => {
    console.dir(newMessageResponse);
    mesMessages = newMessageResponse.messages
    //displayMessages(mesMessages)
    displayMessages(mesMessages);
})
socket.on('newPrivateMessageResponse', (newPrivateMessageResponse) => {
    for (const [key, value] of Object.entries(newPrivateMessageResponse)) {
        let responseCard = document.createElement("div");
        responseCard.classList.add("privateMessages");
        responseCard.innerHTML = `${value.pseudo}: ${value.message}`;
        responsePrivateInner.append(responseCard); 
        
        closeResponsePrivate.addEventListener("click", ()=>{
            responseCard.remove();
            responsePrivate.classList.add('hide');
            responsePrivate.classList.remove('show');
        })
        
        responsePrivate.addEventListener("click", ()=>{
            responseCard.remove();
            responsePrivate.classList.add('hide');
            responsePrivate.classList.remove('show');
        })
        
        responsePrivateInner.addEventListener("click",(e)=>{
            e.stopPropagation();
            e.preventDefault();
        })
    }
    responsePrivate.classList.remove('hide');
    responsePrivate.classList.add('show');
})
