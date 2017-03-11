// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    var nickname;
          
    $('form').submit(function(){
        socket.emit('chat', { message: $('#m').val()});
	   $('#m').val('');
	   return false;
    });
    
    // send cookie to server
    socket.on('getCookie', function(msg){
        var decodedCookie = decodeURIComponent(document.cookie);
        socket.emit('sendCookie', {item: decodedCookie});
    });
    
    // if no cookies are set, set a new cookie
    socket.on('setCookie', function(msg){
        document.cookie = msg.cookie + ";path=/";
        nickname = msg.nickname;
    });

    socket.on('chat', function(msg){
        var hexcolor = msg.userInfo.nameColour;
        
        // messages sent by user is bolded, otherwise regular style
        if(msg.userInfo.nickname === nickname){
            $('#messages').prepend($('<li>').html(msg.time + "  ||  <b><font color=\"" + hexcolor + "\">" + msg.userInfo.nickname + "</font>: " + msg.message + "</b>"));
        }
        else{
            $('#messages').prepend($('<li>').html(msg.time + "  ||  <b><font color=\"" + hexcolor + "\">" + msg.userInfo.nickname + "</font></b>: " + msg.message));
        }
    });
    
    socket.on('notice', function(msg){
	   $('#messages').prepend($('<li>').html(msg.time + "  ||  " + '<i>' + msg.chatNotice + '</i>'));
    });
    
    socket.on('nickname', function(msg){
	   $('#messages').prepend($('<li>').html('<b><i>' + msg.nickname + '</b></i>'));
    });
    
    socket.on('updateNickname', function(msg){
       nickname = msg.nickname;
    });
    
    // clears user list, and prints new one
    'use strict'
    socket.on('updatelist', function(msg){
        $('#userlist').empty();
        for (var i = 0; i < msg.userList.length; i++){
            var hexcolor = msg.userList[i].nameColour;
            $('#userlist').prepend($('<li>').html("<b><font color=\"" + hexcolor + "\">" + msg.userList[i].nickname + "</font>"));   
        }
    });
});
