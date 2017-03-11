var express = require('express');
var app = express();
//var cookieParser = require('cookie-parser');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var history = [];
var clientList = []; // dictionary list
var timestamp;
var cookieList = [];
var index;

http.listen(port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// -------------------------------------- CONNECT ------------------------------------- //

// listen to 'chat' messages
io.on('connection', function (socket) {
    
    var clientID = socket.id;
    var userCookie;
    
    // request cookie from client
    io.sockets.connected[clientID].emit('getCookie', '');   
    socket.on('sendCookie', function(msg){
        console.log('COOKIE: ' + msg.item);
        if (msg.item == ""){
            userCookie = clientID;
            io.sockets.connected[clientID].emit('setCookie', {cookie: userCookie, nickname: randomName(clientID)});
            
            var newUser = {
                clientKey: clientID,
                nickname: randomName(clientID),
                nameColour: '000000',
                cookie: userCookie
            };
            
            // create new user
            clientList.push(newUser);
            cookieList.push(newUser);
            
            index = indexOfClient(userCookie, 'cookie');
            console.log('a user connected: ' + clientList[index].clientKey);
        }
        else{   // user already exists, search for user info
            console.log('A user connected: ' + clientID);
            userCookie = msg.item;
            console.log('FIND MY COOKIE ' + userCookie);
            if (userExists(userCookie)){
                console.log('user exists!');
            }
            else{
                for (var i = 0; i < cookieList.length; i++){
                    if(cookieList[i].cookie === userCookie){
                        clientList.push(cookieList[i]);
                        console.log('push!');
                    } 
                }
            }
            index = indexOfClient(userCookie, 'cookie');
            socket.emit('updateNickname', {nickname: clientList[index].nickname});
        }
                    
    console.log('index: ' + index);
    console.log('a user connected: ' + clientList[index].clientKey);
    
    // send to all but joining user
    socket.broadcast.emit('notice', {time: pollTime(), chatNotice: clientList[index].nickname + ' has joined the room'});
    
    // update new user list
    printList(clientList);
    
    // send history chat to recently connected user
    if (history.size != 0) {
        for (let i = 0; i < history.length; i++){
            io.sockets.connected[clientID].emit('chat', history[i]);   
        }
    }
    io.sockets.connected[clientID].emit('nickname', {nickname: 'Your default name is: ' + clientList[index].nickname});
        
    });
   
    
    // --------------------------------------- CHAT --------------------------------------- //
    socket.on('chat', function(msg){
        msg.userInfo = clientList[index];
        msg.time = pollTime();
        
        let save = emitMessage(socket, msg);
        // save regular messages into history log
        if (save){
            history.push(msg);
        }
        console.log(msg);
    });
    
    // ------------------------------------ DISCONNECT ------------------------------------ //
    socket.on('disconnect', function(){
        if (clientList.size !== 0){
            console.log('user disconnected: ' + clientList[index].clientKey);
            io.emit('notice', {time: pollTime(), chatNotice: clientList[index].nickname + ' has left the room'});

            if (index > -1){
                clientList.splice(index, 1);
            }

            // emit remaining list of people
            printList(clientList);
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

// checks for /nickname or /nickcolor commands before emitting message
function emitMessage(socket, msg){
    if(msg.message.includes("/nickcolor")){
        let tuple = msg.message.split(" ");
        
        msg.userInfo.nameColour = tuple[1];
        socket.emit('notice', {time: pollTime(), chatNotice: 'Your nickname colour has been updated'});
        
        // update user list on application
        printList(clientList);
        console.info('-------------- set colour: ' + msg.userInfo.nameColour + ' ----------------');
    }
    else if(msg.message.includes("/nick")){
        let tuple = msg.message.split(" ");
        
        // only save nickname if it doesn't already exist as someone else's
        if (indexOfClient(tuple[1], 'nickname') == -1){
            
            // replace nickname            
            msg.userInfo.nickname = tuple[1];
            socket.emit('updateNickname', {nickname: msg.userInfo.nickname});
            socket.emit('notice', {time: pollTime(), chatNotice: 'Your name is now set to: ' + msg.userInfo.nickname});
            
            // update user list on application
            printList(clientList);
        }
        else{
            socket.emit('notice', {time: pollTime(), chatNotice: 'Nickname already exists, please choose another.'});
        }
        console.info('-------------- set nickname: ' + msg.userInfo.nickname + ' ----------------');
    }
    else{
        io.emit('chat', msg);
        return 1;
    }
}

// returns index of user with specific key value in clientLlist
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
        else if(key === 'cookie'){
            if(clientList[i].cookie === id){
                return i;
            }
        }
    }
    return -1;    
}

function printList(list){
    if (list.size != 0){
        io.emit('updatelist', {userList: list});
    }
}

// find user that has specific cookie
/*function findUser(cookie){
    for (var i = 0; i < clientList.length; i++){
        if (clientList[i].cookie === cookie){
            return i;
        }
    }
    return -1;
}*/

function userExists(cookie){
    for (var i = 0; i < clientList.length; i++){
        if (clientList[i].cookie === cookie){
            return true;   
        }
    }
    return false;    
}