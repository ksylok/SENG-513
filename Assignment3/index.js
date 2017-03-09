var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var history = [];
var clientList = []; // dictionary list
var timestamp;
//var index;

http.listen(port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// -------------------------------------- CONNECT ------------------------------------- //

// listen to 'chat' messages
io.on('connection', function (socket) {
    var clientID = socket.id;
    
    // set default name and default name colour
    clientList.push({
        clientKey: clientID,
        nickname: randomName(clientID),
        nameColour: '000000'
    });
    
    let index = indexOfClient(clientID);
    console.log('a user connected: ' + clientList[index].clientKey);
    
    // send to all but joining user
    socket.broadcast.emit('notice', {time: pollTime(), chatNotice: clientList[index].nickname + ' has joined the room'});
    
    // send history chat to recently connected user
    if (history.size != 0) {
        for (let i = 0; i < history.length; i++){
            io.sockets.connected[clientID].emit('chat', history[i]);   
        }
    }
    io.sockets.connected[clientID].emit('nickname', {nickname: 'Your default name is: ' + clientList[index].nickname});
    
    // --------------------------------------- CHAT --------------------------------------- //
    socket.on('chat', function(msg){
        //index = indexOfClient(clientID);
        msg.userInfo = clientList[indexOfClient(clientID)];
        msg.time = pollTime();
        
        emitMessage(msg);
        
        console.log(msg);
        history.push(msg);
    });
    
    // ------------------------------------ DISCONNECT ------------------------------------ //
    socket.on('disconnect', function(){
        //index = indexOfClient(clientID);
        console.log('user disconnected: ' + clientList[indexOfClient(clientID)].clientKey);
        io.emit('notice', {time: pollTime(), chatNotice: clientList[index].nickname + ' has left the room'});
        
        if (index > -1){
            clientList.splice(index, 1);
        }
        
        // emit remaining list of people
        if (clientList.size != 0){
            for (let i = 0; i < clientList.length; i++){
                console.log('users left: ' + clientList[i].clientKey);   
            }
        }
    });
});


// used to poll time every time a message is emitted
function pollTime(){
    var timestamp = new Date().toLocaleTimeString();
    return timestamp;
}

// generate default username based off of client id
function randomName(id){
    var name = id.toLowerCase().replace(/[^0-9a-z]/gi, '');
    return name.substring(5, 11);
}

// checks for \nickname or \nickcolor commands before emitting message
function emitMessage(msg){
    if(msg.message.includes("/nickcolor")){
        console.info('-------------- set colour! ----------------');
        let tuple = msg.message.split(" ");
        msg.userColour = tuple[1];
    }
    else if(msg.message.includes("/nick")){
        console.info('-------------- set nickname! ----------------');
    }
    else{
        io.emit('chat', msg);
    }
}

// returns index of user with clientKey in clientLlist
function indexOfClient(id){
    for (let i = 0; i < clientList.length; i++){
        if(clientList[i].clientKey === id){
            return i;
        }
    }
    return -1;    
}
