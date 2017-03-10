var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var history = [];
var clientList = []; // dictionary list
var timestamp;
var nicknameList = [];

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
    nicknameList.push(randomName(clientID));
    
    let index = indexOfClient(clientID, 'clientKey');
    console.log('a user connected: ' + clientList[index].clientKey);
    
    // send to all but joining user
    socket.broadcast.emit('notice', {time: pollTime(), chatNotice: clientList[index].nickname + ' has joined the room'});
    
    printList(clientList);
    
    // send history chat to recently connected user
    if (history.size != 0) {
        for (let i = 0; i < history.length; i++){
            io.sockets.connected[clientID].emit('chat', history[i]);   
        }
    }
    io.sockets.connected[clientID].emit('nickname', {nickname: 'Your default name is: ' + clientList[index].nickname});
    
    // --------------------------------------- CHAT --------------------------------------- //
    socket.on('chat', function(msg){
        msg.userInfo = clientList[indexOfClient(clientID, 'clientKey')];
        msg.time = pollTime();
        
        let save = emitMessage(msg);
        // save regular messages into history log
        if (save){
            history.push(msg);
        }
        console.log(msg);
    });
    
    // ------------------------------------ DISCONNECT ------------------------------------ //
    socket.on('disconnect', function(){
        console.log('user disconnected: ' + clientList[indexOfClient(clientID, 'clientKey')].clientKey);
        io.emit('notice', {time: pollTime(), chatNotice: clientList[indexOfClient(clientID, 'clientKey')].nickname + ' has left the room'});
        
        if (indexOfClient(clientID, 'clientKey') > -1){
            clientList.splice(indexOfClient(clientID, 'clientKey'), 1);
        }
        
        // emit remaining list of people
        printList(clientList);
        
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

// checks for /nickname or /nickcolor commands before emitting message
function emitMessage(msg){
    if(msg.message.includes("/nickcolor")){
        let tuple = msg.message.split(" ");
        msg.userInfo.nameColour = tuple[1];
        io.sockets.connected[msg.userInfo.clientKey].emit('notice', {time: pollTime(), chatNotice: 'Your nickname colour has been updated'});
        console.info('-------------- set colour: ' + msg.userInfo.nameColour + ' ----------------');
    }
    else if(msg.message.includes("/nick")){
        let tuple = msg.message.split(" ");
        
        // only save nickname if it doesn't already exist as someone else's
        if (indexOfClient(tuple[1], 'nickname') == -1){
            
            // replace nickname
            clientList[indexOfClient(msg.userInfo.clientKey, 'clientKey')].nickname = tuple[1];
            
            msg.userInfo.nickname = tuple[1];
            io.sockets.connected[msg.userInfo.clientKey].emit('notice', {time: pollTime(), chatNotice: 'Your name is now set to: ' + msg.userInfo.nickname});
            
            // update user nickname list
            printList(clientList);
        }
        else{
            io.sockets.connected[msg.userInfo.clientKey].emit('notice', {time: pollTime(), chatNotice: 'Nickname already exists, please choose another.'});
        }
        console.info('-------------- set nickname: ' + msg.userInfo.nickname + ' ----------------');
    }
    else{
        io.emit('chat', msg);
        return 1;
    }
}

// returns index of user with clientKey in clientLlist
function indexOfClient(id, key){
    for (let i = 0; i < clientList.length; i++){
        if(key === 'clientKey'){
            if(clientList[i].clientKey.toLowerCase() === id.toLowerCase()){
                return i;
            }
        }
        else if(key === 'nickname'){
            if(clientList[i].nickname.toLowerCase() === id.toLowerCase()){
                return i;
            }
        }
    }
    return -1;    
}

function printList(list){
    if (list.size != 0){
        for (let i = 0; i < list.length; i++){
            console.log('updating name list: ' + list[i].nickname);
            io.emit('updatelist', {user: list[i]});
        }
    }
}