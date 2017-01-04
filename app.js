var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function Player(){
    this.position={x:0 ,y:0};
    this.radio=20;
    this.id=0;
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

function findIndex(socketId){
    for(var n=0; n<socketIds.length; n++){
        if(socketId==socketIds[n]){
            return n;
        }
    }
}

//Our js files
app.use("/js", express.static('js'));
app.use("/img", express.static('images'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    var i = socketIds.push(socket.id)-1;
    players.push(new Player()); //falta arreglar si un client es desconecta i un altre es conecta no faci push
    players[i].id = i;
    console.log('user index: ' + i);
    socket.emit('index',{clientIndex: i});
    socket.emit('initFood', listFood);
    socket.on('player', function (x,y,radio) {
        var i = findIndex(socket.id);
        players[i].position.x=x;
        players[i].position.y=y;
        players[i].radio=radio;
        console.log('x: '+ players[i].position.x + ' y: '+ players[i].position.y);
        socket.broadcast.emit('new_player', players[i]);
        socket.emit('players', players);
    });

    socket.on('update_food', function(x,y,player_id){
        for (var i=0; i<listFood.length; i++){
            if (listFood[i].x == x && listFood[i].y == y){
                listFood[i].x = getRandomArbitrary(0,1600);
                listFood[i].y = getRandomArbitrary(0,1200);
                players[player_id].radio += 1;
            }
            socket.broadcast.emit('new_food', listFood[i],x,y);
            socket.broadcast.emit('update_size', players[player_id].position.x,players[player_id].position.y, players[player_id].radio);
        }
    });
    socket.on('new_position',function(new_x,new_y,id){
        socket.broadcast.emit('update_position', new_x,new_y,players[id].position.x,players[id].position.y);
        players[id].position.x = new_x;
        players[id].position.y = new_y;
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


setTimeout(function() {
    io.emit('players', players);
}, 1000);//Phaser default frame rate 60fps = 16.6ms


// Server start
http.listen(3000, function(){
    console.log('listening on *:3000');
});


