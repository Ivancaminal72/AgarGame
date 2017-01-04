//Game
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'agar_game', { preload: preload, create: create, update: update, render: render });
var playerStartRadius = 20;
var foodRadius=8;
var velocityPlayer = 200;
var player;
var cursors;
var food;
var score = 0;
var enemies;
var oldOverlaps = {food:{x:-1, y:-1}, enemies:{x:-1, y:-1}};
//Player
function Player(start_x, start_y, radio, color) {
    this.radio = radio;
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
    this.bola.body.setCircle(radio);
    this.bola.body.collideWorldBounds = true;
    this.index = -1;
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
socket.on('initFood', function (initFood) {
    game.state.pause();
    createFood(initFood); //Create the actual food that arrives from the server
});
socket.on('initPlayers', function (initPlayers){
    game.state.pause();
    createEnemies(initPlayers);
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

    player = new Player(game.world.randomX,game.world.randomY,playerStartRadius,'#ff9999');
    socket.on('index', function (index) {
        console.log("new player index: " + index);
        player.index=index;
    });
    socket.emit('new_player',player.bola.x,player.bola.y,player.radio);
    cursors = game.input.keyboard.createCursorKeys();

    //  Notice that the sprite doesn't have any momentum at all,
    //  it's all just set by the camera follow type.
    //  0.1 is the amount of linear interpolation to use.
    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
    game.camera.follow(player.bola, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    game.world.bringToTop(food);
    game.world.bringToTop(enemies);

    socket.on('update_particle', function(foodIndex, new_food){
        console.log('particle killed');
        var particle = food.getChildAt(foodIndex);
        particle.x = new_food.x;
        particle.y = new_food.y;
    });
    socket.on('update_player_size', function(playerIndex, radio){
        if(playerIndex == player.index){
            console.log("Update Player size: " + radio);
            player.setRadius(radio);

            //Update player score
            score = (radio-20) * 10;

        }
        else{
            var enemyIndex;
            if(playerIndex > player.index){enemyIndex=playerIndex-1;}
            else{enemyIndex=playerIndex;}
            console.log("Update Enemie " + enemyIndex + " radio");
            var enemy = enemies.getChildAt(enemyIndex);
            if(!enemy.exists){enemy.revive()}
            var color = enemy.key.ctx.fillStyle;
            enemy.key.clear();
            enemy.key.resize(2*radio,2*radio);
            enemy.key.ctx.fillStyle = color;
            enemy.key.ctx.beginPath();
            enemy.key.ctx.arc(radio,radio,radio,0,2*Math.PI);
            enemy.key.ctx.closePath();
            enemy.key.ctx.fill();
            enemy.body.setCircle(radio);
            enemy.width = 2*radio;
            enemy.height = 2*radio;
            enemy.key.update();
        }
    });
    socket.on('delete_enemy', function(playerIndex){
        var enemyIndex;
        if(playerIndex > player.index){enemyIndex=playerIndex-1;}
        else{enemyIndex=playerIndex;}
        var enemy = enemies.getChildAt(enemyIndex);
        enemy.kill();
    });

    socket.on('new_enemy', function (playerIndex, new_enemy) {
        console.log('new_enemy');
        var enemyIndex;
        if(playerIndex > player.index){enemyIndex=playerIndex-1;}
        else{enemyIndex=playerIndex;}
        console.log('enemy index: '+enemyIndex);
        console.log('enemy x: '+ new_enemy.position.x +' y: '+ new_enemy.position.y+ ' radio: '+new_enemy.radio);
        var bmpEnemy = createBitmap(new_enemy.radio, '#' + Math.floor(Math.random() * 16777215).toString(16));
        var enemy = enemies.create(new_enemy.position.x, new_enemy.position.y, bmpEnemy, null, true, enemyIndex);
        enemy.body.setCircle(new_enemy.radio);
    });

    socket.on('update_player_position', function(playerIndex, new_x, new_y){
        console.log('position changed');
        var enemyIndex;
        if(playerIndex > player.index){enemyIndex=playerIndex-1;}
        else{enemyIndex=playerIndex;}
        var enemy = enemies.getChildAt(enemyIndex);
        enemy.x = new_x;
        enemy.y = new_y;
    });
}

function update() {
    if(game.time.now - actionTime > 1000) { //Check this code every 1 second
        if (player.oldPosition.x != player.bola.x || player.oldPosition.y != player.bola.y) {
            actionTime = game.time.now;
            player.oldPosition.x = player.bola.x;
            player.oldPosition.y = player.bola.y;
            socket.emit('new_position', player.bola.x, player.bola.y, player.index);
        }
        game.physics.arcade.overlap(player.bola, food, overlapFood, null, this);
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
    game.debug.text("Score: "+ score.toString() , 32, 32, 'black');
    if(score > 100){
        game.debug.text("Loading Level 2" , 400, 300, 'black');
    }

}


function overlapFood (oldplayer, deadparticle) {
    if(oldOverlaps.food.x != deadparticle.x || oldOverlaps.food.y != deadparticle.y) { //Check if the message is already sent
        socket.emit('overlap_food', player.index, food.getIndex(deadparticle), deadparticle.x, deadparticle.y);
        player.oldPosition.x = deadparticle.x;
        player.oldPosition.y = deadparticle.y;
    }
}

function createFood(initFood) {
    // Food
    console.log('creando food');
    var bmpParticle = createBitmap(foodRadius, '#fff242');
    food = game.add.group();
    food.enableBody=true;
    food.physicsBodyType = Phaser.Physics.ARCADE;
    for(var i=0; i<initFood.length; i++){
        var particle = food.create(initFood[i].x, initFood[i].y, bmpParticle, null, true, i);
        particle.body.setCircle(foodRadius);
    }
    game.state.resume();
}

function createEnemies(initPlayers){
    // Enemies
    console.log('creando players');
    enemies = game.add.group();
    enemies.enableBody=true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    for(var j=0; j<initPlayers.length; j++) {
        if (initPlayers[j].radio >= 20) {
            console.log('player x: '+ initPlayers[j].position.x +' y: '+ initPlayers[j].position.y+ ' radio: '+initPlayers[j].radio);
            var bmpEnemy = createBitmap(initPlayers[j].radio, '#' + Math.floor(Math.random() * 16777215).toString(16));
            var enemy = enemies.create(initPlayers[j].position.x, initPlayers[j].position.y, bmpEnemy, null, true, j);
            enemy.body.setCircle(initPlayers[j].radio);
        }
    }
    game.state.resume();
}

function createBitmap(radio, color) {
    var bmp = game.add.bitmapData(2 * radio, 2 * radio);
    bmp.ctx.fillStyle = color;
    bmp.ctx.beginPath();
    bmp.ctx.arc(radio, radio, radio, 0, 2 * Math.PI);
    bmp.ctx.closePath();
    bmp.ctx.fill();
    return bmp;
}