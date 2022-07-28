const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const hostname = '127.0.0.1';
const port = 8000;
let socketClients = [];
let messages = [];



app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
})

// communication entre les clients et le serveur
// attention conneCTion
io.on('connection', (socket) => {
    console.dir(socket.id);
    socketClients.push({ id: socket.id })
    socket.emit("init", {
        message: "Yôkoso, User-san",
        id: socket.id,
        socketClients: socketClients,
        messages: messages
    })

    socket.on('initResponse', (initResponse) => {
        socketClients = initResponse.socketClients;
        console.dir(socketClients);
        // partager aux clients déjà connectés
        socket.broadcast.emit('newClient', { socketClients: socketClients })
    })
    socket.on("newMessage", (newMessage) => {
        messages = newMessage.messages;
        console.dir(messages)
        // je partage en broadcast le tableau message
        socket.broadcast.emit("newMessageResponse", {
            messages: messages
        })
    })
    /* socket.emit("newPrivateMessage",{
        message:monMessage,
        date:date,
        idContact:idContact,
        id:monId,
        pseudo:pseudo 
     }) */
    socket.on("newPrivateMessage", (newPrivateMessage) => {
        // je reçois idContact, id,message, pseudo,date
        // je dois faire un emit sur un unique id (newPrivateMessage.idContact)
        console.dir(newPrivateMessage);
        // stockage des messages eventuel
        socket.broadcast.to(newPrivateMessage.idContact).emit("newPrivateMessageResponse", {
            newPrivateMessageResponse: newPrivateMessage
        })
    })
    if (socketClients.length > 0) {
        socket.on('disconnect', () => {
            // socket.id = client déconnecté

            for (let i = 0; i < socketClients.length; i++) {
                if (socketClients[i].id === socket.id) {
                    socketClients.splice(i, 1);
                }
            }
            console.log(socket.id);
            console.dir(socketClients);
            socket.broadcast.emit('clientDisconnect', {
                socketClients: socketClients
            })
        })

    }
})



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});