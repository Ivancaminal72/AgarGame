/**
 * Created by Ivan on 29/11/2016.
 */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'agar_game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('background_white','img/white.png');
    //game.load.image('player','assets/sprites/phaser-dude.png');

}
var playerStartRadius = 20;
var playerScale = 1.0;
var foodRadius = 8;
var velocityPlayer = 200;
var player;
var cursors;
var food;
var bmpFood;

function create() {

    game.add.tileSprite(0, 0, 800, 600, 'background_white');

    game.world.setBounds(0, 0, 800, 600);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Player
    function Player(start_x, start_y, color) {
        this.radio = playerStartRadius;
        this.position = {x: start_x, y: start_y};
        this.color = color;
        this.bmpPlayer = game.add.bitmapData(2*this.radio,2*this.radio);
        this.bmpPlayer.ctx.fillStyle = this.color;
        this.bmpPlayer.ctx.beginPath();
        this.bmpPlayer.ctx.arc(this.radio,this.radio,this.radio,0,2*Math.PI);
        this.bmpPlayer.ctx.closePath();
        this.bmpPlayer.ctx.fill();
        this.bola = game.add.sprite(this.position.x, this.position.y, this.bmpPlayer);
        game.physics.arcade.enable(this.bola);
        this.bola.body.setCircle(playerStartRadius);
        this.bola.body.collideWorldBounds = true;
    };

    Player.prototype.setVelocityX =  function(x){
      this.bola.body.velocity.x = x;
    };

    Player.prototype.setVelocityY =  function(y){
        this.bola.body.velocity.y = y;
    };

    Player.prototype.setRadius = function(radius){
        this.radio = radius;
        //this.bola.resizeFrame(this.bola.key,2*this.radio,2*this.radio);
        this.bola.key.clear();
        this.bola.key.width = 2*this.radio;
        this.bola.key.height = 2*this.radio;
        this.bola.key.ctx.fillStyle = this.color;
        this.bola.key.ctx.beginPath();
        this.bola.key.ctx.arc(this.radio,this.radio,this.radio,0,2*Math.PI);
        this.bola.key.ctx.closePath();
        this.bola.key.ctx.fill();
        this.bola.body.setCircle(this.radio);
        this.bola.width = 2*this.radio;
        this.bola.height = 2*this.radio;
    };

    player = new Player(game.world.centerX,game.world.centerY,'#ff9999');
    // Food
    bmpFood = game.add.bitmapData(2*foodRadius,2*foodRadius);
    bmpFood.ctx.fillStyle = '#fff242';
    bmpFood.ctx.beginPath();
    bmpFood.ctx.arc(foodRadius,foodRadius,foodRadius,0,2*Math.PI);
    bmpFood.ctx.closePath();
    bmpFood.ctx.fill();
    //food = game.add.group(World,"food",false,true,Phaser.Physics.ARCADE);
    food = game.add.group();
    food.enableBody=true;
    food.physicsBodyType = Phaser.Physics.ARCADE;
    for(i=0; i<30; i++){
        var particle = food.create(game.world.randomX, game.world.randomY, bmpFood);
        particle.body.setCircle(foodRadius);
    }

    cursors = game.input.keyboard.createCursorKeys();

    //  Notice that the sprite doesn't have any momentum at all,
    //  it's all just set by the camera follow type.
    //  0.1 is the amount of linear interpolation to use.
    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
    game.camera.follow(player.bola, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

}

function update() {

    //player.body.setZeroVelocity();
    game.physics.arcade.overlap(player.bola, food, eatFood, null, this);

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
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(velocityPlayer);
    }
    else
    {
        //player.animations.stop();
    }

}

function render() {
    //game.debug.text("Arrows to move.", 32, 32);
}
var radio = playerStartRadius+1;
function eatFood (oldplayer, deadparticle) {
    console.log("NewScale: " + playerStartRadius);

    // Removes the particle
    deadparticle.kill();

    // Add random food particle
    var particle = food.create(game.world.randomX, game.world.randomY, bmpFood);
    particle.body.setCircle(foodRadius);

    playerScale += 0.1;
    /*bmpPlayer.ctx.beginPath();
    bmpPlayer.ctx.arc(playerStartRadius,playerStartRadius,playerStartRadius,0,2*Math.PI);
    bmpPlayer.ctx.closePath();
    bmpPlayer.ctx.fill();*/
    radio+=1;
    player.setRadius(radio);
    /*var bmpNewPlayer = game.add.bitmapData(2*playerStartRadius,2*playerStartRadius);
    bmpNewPlayer.ctx.fillStyle = '#ff9999';
    bmpNewPlayer.ctx.beginPath();
    bmpNewPlayer.ctx.arc(playerStartRadius,playerStartRadius,playerStartRadius,0,2*Math.PI);
    bmpNewPlayer.ctx.closePath();
    bmpNewPlayer.ctx.fill();
    var x = oldplayer.x;
    var y = oldplayer.y;
    oldplayer.kill();
    var newplayer = game.add.sprite(x, y, bmpNewPlayer);
    game.physics.arcade.enable(newplayer);
    newplayer.body.setCircle(playerStartRadius);
    newplayer.body.collideWorldBounds = true;
    player = newplayer;*/
}