// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    var nickname;
    
    $('form').submit(function(){
        socket.emit('chat', { message: $('#m').val()});
	   $('#m').val('');
	   return false;
    });

    socket.on('chat', function(msg){
        var hexcolor = msg.userInfo.nameColour;
        
        // messages sent by user is bolded, otherwise regular style
        if(msg.userInfo.clientKey === socket.io.engine.id){
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
    
    // clears user list, and prints new one
    socket.on('updatelist', function(msg){
        $('#userlist').empty();
        for (let i = 0; i < msg.userList.length; i++){
            let hexcolor = msg.userList[i].nameColour;
            $('#userlist').prepend($('<li>').html("<b><font color=\"" + hexcolor + "\">" + msg.userList[i].nickname + "</font>"));   
        }
    });
});
