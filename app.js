var express = require('express'),
    app = express(),
    path = require('path'); //built in path module, used to resolve paths of relative files
    server = require('http').createServer(app),
    io = require('socket.io')(server, {
        'pingInterval': 40000,
        'pingTimeout': 25000
    });
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    users = {};
var port = process.env.port || process.env.PORT || process.env.NODE_APP_INSTANCE || 3000    
server.listen(port);

app.get('/',(requestAnimationFrame,res)=>{
    res.send('Hello World!');
})

mongoose.connect('mongodb://35.200.161.137:27017/db1',function (err) {
    if (err){
        console.log(err);
    }else {
        console.log('Connected to mongo db')
    }
})

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Routes
app.use('/messages', require('./routes/messages'));

var chatSchema = mongoose.Schema({

    username: String,
    msg: String,
    room: String,    
    created: {type: Date, default: Date.now}
})
var Chat = mongoose.model('Message', chatSchema);

var rooms = mongoose.Schema({

    room: String,    
    created: {type: Date, default: Date.now}
})
var Room = mongoose.model('Room', rooms);
// app.use(express.static(path.join(__dirname + '/assets'))); //allows html file to reference stylesheet "helloworld.css" that is stored in ./css directory
// app.get('/', function (req, res) {
//     res.sendfile(__dirname + '/assets/index.html');
// })


// var room = [];


io.on('connection',function (socket) {
  console.log('connection established');


    // Chat.find({}, function (err, docs) {
    //     if (err) throw err;
    //     socket.emit('load old msgs', docs);
    // })
    socket.on('joinRoom', function(data){
        Room.find({ room: data.room }, function(err, room){ 
     //   if(room.length!=0){
            if(room.includes(data.room)){
                socket.join(data.room)
                console.log('joined room', data.room)
              //  socket.emit('joined', { room: data.room})
                console.log(room);

            }
        else{
            socket.join(data.room);
//            room.push(data.room);
                room.push({ 
                room: data.room, 
                 });
            
            console.log('joined room',data.room);
         //   socket.emit('joined', { room: data.room })
            console.log(room);
        }

        room: data.room;
        updateUsernames();
    });
    })
    socket.on('roomMessage', function(data){
	if(data.endmessageid){
    Chat.find({room:data.room,'_id': {'$gt': data.endmessageid}}).limit(20)
	 .then(function(chats){
        socket.emit('chatMessage',{Chat:chats})
    })
	}
	else{
		 Chat.find({room:data.room})
			.then(function(chats){
				socket.emit('chatMessage',{Chat:chats})
    })
	}
	});

    // socket.on('new user', function (data ,callback) {
    //     if (data in users){
    //         callback(false);
    //     }
    //     else {
    //         callback(true);
    //         socket.username = data;
    //         users[socket.username] = socket;
    //         updateUsernames();


    //         socket.room = 'room1';
    //         // add the client's username to the global list
    //         // send client to room 1
           
            
    //         // echo to client they've connected
    //         // echo to room 1 that a person has connected to their room
    //         socket.emit('updatechat', 'SERVER', 'you have connected to room1');

    //        // socket.broadcast.to('room1').emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
    //         socket.emit('updaterooms', rooms, 'room1');
    //     }
    //     // send client to room 1

    // })



    function updateUsernames() {
        io.sockets.emit('usernames', Object.keys(users));
    }

    //creating a chat room
    // socket.on('create', function(room) {
    //     rooms.push(room);
    //     socket.emit('updaterooms', rooms, socket.room);
    // });


    socket.on('newMessage', function (data, callback) {
        // var msg = data.trim();
        // if(msg.substr(0,3) === '/w '){
        //     msg = msg.substr(3);
        //     var ind = msg.indexOf(' ');
        //     // if(ind !== -1) {
        //     //     var name = msg.substring(0, ind);
        //     //     var msg  = msg.substring(ind+1);

        //     //     if(name in users){
        //     //         users[name].emit('whisper', {msg: msg ,username: socket.username});
        //     //         console.log('Private Message!');
        //     //     }else {
        //     //         callback('Error! Enter a valid user');
        //     //     }
        //     //     console.log('Whisper');
        //     // }else {
        //     //     callback('Error! Please enter a message for your whisper');
        //     // }
        // }
        // else {
            var newMsg = new Chat({msg: data.message, username: data.username, room: data.room})
            newMsg.save(function (err) {
                if (err) throw err;
                io.sockets.in(data.room).emit('message', {msg: data.message, username: data.username})

             })
      //  }
    })




    socket.on('switchRoom', function(newroom){
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        // sent message to OLD room
     //   socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
        // update socket session room title
        socket.room = newroom;
     //   socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
        socket.emit('updateroom', room, newroom);
    });



    socket.on('disconnect', function (data) {
       if (!socket.username) return;
       delete  users[socket.username];
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
     //   socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);

        updateUsernames();
    });
})
