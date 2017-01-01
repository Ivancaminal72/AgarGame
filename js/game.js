//Game
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'agar_game', { preload: preload, create: create, update: update, render: render });
var playerStartRadius = 20;
var foodRadius=8;
var velocityPlayer = 200;
var player;
var cursors;
var food;
var listFood =[];
var bmpFood;
var score = 0;
var enemies;
//Player
function Player(start_x, start_y, color) {
    this.radio = playerStartRadius;
    this.color = color;
    this.oldPosition = {x:start_x, y:start_y};
    this.bmpPlayer = game.add.bitmapData(2*this.radio,2*this.radio);
    this.bmpPlayer.ctx.fillStyle = this.color;
    this.bmpPlayer.ctx.beginPath();
    this.bmpPlayer.ctx.arc(this.radio,this.radio,this.radio,0,2*Math.PI);
    this.bmpPlayer.ctx.closePath();
    this.bmpPlayer.ctx.fill();
    this.bola = game.add.sprite(start_x, start_y, this.bmpPlayer);
    game.physics.arcade.enable(this.bola);
    this.bola.body.setCircle(playerStartRadius);
    this.bola.body.collideWorldBounds = true;
    this.id = 0;
}

Player.prototype.setVelocityX =  function(x){
    this.bola.body.velocity.x = x;
};

Player.prototype.setVelocityY =  function(y){
    this.bola.body.velocity.y = y;
};

Player.prototype.setRadius = function(radius){
    this.radio = radius;
    this.bola.key.clear();
    this.bola.key.resize(2*this.radio,2*this.radio);
    this.bola.key.ctx.fillStyle = this.color;
    this.bola.key.ctx.beginPath();
    this.bola.key.ctx.arc(this.radio,this.radio,this.radio,0,2*Math.PI);
    this.bola.key.ctx.closePath();
    this.bola.key.ctx.fill();
    this.bola.body.setCircle(this.radio);
    this.bola.width = 2*this.radio;
    this.bola.height = 2*this.radio;
    this.bola.key.update();
};

//Communication socket io
var socket = io();
var actionTime = 0;
var clientIndex;
socket.on('index', function (id) {
    console.log("socket new index: " + id.clientIndex);
    clientIndex=id.clientIndex;
});
socket.on('initFood', function (list) {
    game.state.pause();
    console.log(list[0]);
    listFood=list;
    createFood(); //Create the actual food that arrives from the server
});

function preload() {
    game.load.image('background_white','img/white.png');
    game.load.image('background_black','img/black.png');
}

function create() {
    game.add.tileSprite(0, 0, 1600, 1200, 'background_white');
    game.world.setBounds(0, 0, 1600, 1200);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    /*
     var Barrera = function(pos_x, pos_y){
     this.color_barrera = "#336699";
     this.position = {x:pos_x, y:pos_y};
     this.size = {w:20, h:20};
     var bmpBarrera = game.add.bitmapData(2*this.size.w,2*this.size.h);
     bmpBarrera.ctx.fillStyle = this.color_barrera;
     bmpBarrera.ctx.fillRect(   this.position.x,
     this.position.y,
     this.size.w,
     this.size.h);
     this.barrera = game.add.sprite(game.world.centerX, game.world.centerY, bmpBarrera);
     game.physics.arcade.enable(this.barrera);
     this.barrera.body.collideWorldBounds = true;
     };
     var barrera = new Barrera(80/2,60/2);
     barrera.barrera;*/

    player = new Player(game.world.randomX,game.world.randomY,'#ff9999');
    player.id = clientIndex;
    socket.emit('player',player.bola.x,player.bola.y,player.radio);
    socket.on('players', function (list_players) {
        console.log('creando players');
        for(var j=0; j<list_players.length; j++) {
            if (j != player.id) {
                var enemie = new Player(list_players[j].position.x, list_players[j].position.y, '000000');
                var players = enemies.create(list_players[j].position.x, list_players[j].position.y, enemie.bmpPlayer);
                players.body.setCircle(list_players[j].radio);
            }
        }
    });
    cursors = game.input.keyboard.createCursorKeys();

    //  Notice that the sprite doesn't have any momentum at all,
    //  it's all just set by the camera follow type.
    //  0.1 is the amount of linear interpolation to use.
    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
    game.camera.follow(player.bola, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    game.world.bringToTop(food);
    enemies = game.add.group();
    enemies.enableBody=true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
}

function update() {
    if(game.time.now - actionTime > 1000) { //Check if position has changed every 1 second
        if (player.oldPosition.x != player.bola.x || player.oldPosition.y != player.bola.y) {
            console.log('position changed');
            //socket.emit('position',{x:player.bola.x, y:player.bola.y, radio:player.radio, id:player.id});
            actionTime = game.time.now;
            player.oldPosition.x = player.bola.x;
            player.oldPosition.y = player.bola.y;
        }
    }

    if(score > 100){
        game.state.add('level2', level2);
        game.paused = true;
        setTimeout(function() {
            game.paused = false;
            game.state.start('level2');
        }, 2000);
    }

    //player.body.setZeroVelocity();
    game.physics.arcade.overlap(player.bola, food, eatFood, null, this);
    socket.on('new_food', function(new_food,old_x,old_y){
        food.forEach(function(particle){
            if(particle.x == old_x && particle.y == old_y){
                particle.x = new_food.x;
                particle.y = new_food.y;
            }
        });
    });

    socket.on('new_player', function (enemy) {
        console.log('creando players');
        if (enemy.socketId != player.id) {
            var enemie = new Player(enemy.position.x, enemy.position.y, '000000');
            var players = enemies.create(enemy.position.x, enemy.position.y, enemie.bmpPlayer);
            players.body.setCircle(enemy.radio);
        }
    });

    player.setVelocityX(0);
    player.setVelocityY(0);

    if (cursors.up.isDown) {
        player.setVelocityY(-velocityPlayer);
    } else if (cursors.down.isDown) {
        player.setVelocityY(velocityPlayer);
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-velocityPlayer);
    } else if (cursors.right.isDown) {
        player.setVelocityX(velocityPlayer);
    }

}

function render() {

    // Score
    game.debug.text("Score: "+score.toString() , 32, 32, 'black');
    if(score > 100){
        game.debug.text("Loading Level 2" , 400, 300, 'black');
    }

}
var radio = playerStartRadius;
function eatFood (oldplayer, deadparticle) {

    // Removes the particle
    deadparticle.kill();

    socket.emit('update_food', deadparticle.x, deadparticle.y);

    radio+=1;
    console.log("NewScale: " + radio);
    player.setRadius(radio);

    //  Add and update the score
    score = (radio-20) * 10;

}

function createFood() {
    // Food
    console.log('creando food')
    bmpFood = game.add.bitmapData(2*foodRadius,2*foodRadius);
    bmpFood.ctx.fillStyle = '#fff242';
    bmpFood.ctx.beginPath();
    bmpFood.ctx.arc(foodRadius,foodRadius,foodRadius,0,2*Math.PI);
    bmpFood.ctx.closePath();
    bmpFood.ctx.fill();
    //listFood = game.add.group(World,"listFood",false,true,Phaser.Physics.ARCADE);
    food = game.add.group();
    food.enableBody=true;
    food.physicsBodyType = Phaser.Physics.ARCADE;
    for(var i=0; i<listFood.length; i++){
        var particle = food.create(listFood[i].x, listFood[i].y, bmpFood);
        particle.body.setCircle(foodRadius);
    }
    game.state.resume();
}
