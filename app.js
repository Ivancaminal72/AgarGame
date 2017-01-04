var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function Player(socketId){
    this.socketId=socketId;
    this.position={x:0 ,y:0};
    this.radius=0;
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var listFood=[];
for(var i=0; i<30; i++){
    listFood.push({x:getRandomArbitrary(0,1600), y:getRandomArbitrary(0,1200)});
}

var players=[];

var socketIds = [];

function findPlayerIndex(socketId){
    for(var n=0; n<players.length; n++){
        if(socketId==players[n].socketId){
            return n;
        }
    }
}
function searchEmptyPosition() {
    for(var n=0; n<players.length; n++){
        if(players[n].socketId==null){
            return n;
        }
    }
    return -1;
}

//Our js files
app.use("/js", express.static('js'));
app.use("/img", express.static('images'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    var emptyPosition = searchEmptyPosition(); //Search if an empty position is available in de players list
    if(emptyPosition == -1){players.push(new Player(socket.id));}
    else{players[emptyPosition].socketId = socket.id}
    socket.emit('initFood', listFood);
    socket.emit('initPlayers', players);
    socket.on('new_player', function (x,y,radius) {
        console.log('new player');
        var playerIndex = findPlayerIndex(socket.id);
        console.log('index: '+playerIndex);
        players[playerIndex].position.x=x;
        players[playerIndex].position.y=y;
        players[playerIndex].radius=radius;
        console.log('x: '+ players[playerIndex].position.x + ' y: '+ players[playerIndex].position.y);
        console.log('radius: '+players[playerIndex].radius);

        socket.emit('index', playerIndex);
        socket.broadcast.emit('new_enemy', playerIndex, players[playerIndex]);

    });

    socket.on('overlap_food', function(playerIndex, foodIndex, x, y){
        console.log('overlap_food');
        if(listFood[foodIndex].x == x && listFood[foodIndex].y == y){ //Correct overlap
            listFood[foodIndex].x = getRandomArbitrary(0,1600);
            listFood[foodIndex].y = getRandomArbitrary(0,1200);
            console.log('player index: '+playerIndex);
            console.log('player radius: '+players[playerIndex].radius);
            players[playerIndex].radius += 1;
            io.emit('update_particle', foodIndex, listFood[foodIndex]);
            io.emit('update_player_size', playerIndex, players[playerIndex].radius);
        }
    });
    socket.on('new_position',function(new_x,new_y,playerIndex){
        socket.broadcast.emit('update_position', playerIndex, new_x, new_y);
        players[playerIndex].position.x = new_x;
        players[playerIndex].position.y = new_y;
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        var playerIndex = findPlayerIndex(socket.id);
        players[playerIndex].radius = 10; //Radius not possible (wont be displayed as enemy on the client side)
        players[playerIndex].socketId=null;
        socket.broadcast.emit('delete_enemy', playerIndex);
    });
});


setTimeout(function() {
    io.emit('players', players);
}, 1000);//Phaser default frame rate 60fps = 16.6ms


// Server start
http.listen(3000, function(){
    console.log('listening on *:3000');
});


