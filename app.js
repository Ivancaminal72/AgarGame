/**
 * Created by Ivan on 16/11/2016.
 */
var express = require('express');
var app = express();

//Our js files
app.use("/js", express.static('js'));
app.use("/img", express.static('images'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/game.html');
});

// Server start
app.listen(3000, function(){
    console.log('listening on *:3000');
});


