/**
 * Created by Ivan on 29/11/2016.
 */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'agar_game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('background_white','img/white.png');
    //game.load.image('player','assets/sprites/phaser-dude.png');

}
var playerRadious = 20;
var foodRadious = 8;
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
    var bmpPlayer = game.add.bitmapData(2*playerRadious,2*playerRadious);
    bmpPlayer.ctx.fillStyle = '#ff9999';
    bmpPlayer.ctx.beginPath();
    bmpPlayer.ctx.arc(playerRadious,playerRadious,playerRadious,0,2*Math.PI);
    bmpPlayer.ctx.closePath();
    bmpPlayer.ctx.fill();
    player = game.add.sprite(game.world.centerX, game.world.centerY, bmpPlayer);
    game.physics.arcade.enable(player);
    player.body.setCircle(playerRadious);
    player.body.collideWorldBounds = true;

    // Food
    bmpFood = game.add.bitmapData(2*foodRadious,2*foodRadious);
    bmpFood.ctx.fillStyle = '#fff242';
    bmpFood.ctx.beginPath();
    bmpFood.ctx.arc(foodRadious,foodRadious,foodRadious,0,2*Math.PI);
    bmpFood.ctx.closePath();
    bmpFood.ctx.fill();
    //food = game.add.group(World,"food",false,true,Phaser.Physics.ARCADE);
    food = game.add.group();
    food.enableBody=true;
    food.physicsBodyType = Phaser.Physics.ARCADE;
    for(i=0; i<30; i++){
        var particle = food.create(game.world.randomX, game.world.randomY, bmpFood);
        particle.body.setCircle(foodRadious);
    }

    cursors = game.input.keyboard.createCursorKeys();

    //  Notice that the sprite doesn't have any momentum at all,
    //  it's all just set by the camera follow type.
    //  0.1 is the amount of linear interpolation to use.
    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

}

function update() {

    //player.body.setZeroVelocity();
    game.physics.arcade.overlap(player, food, eatFood, null, this);

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.up.isDown)
    {
        player.body.velocity.y = -velocityPlayer;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = velocityPlayer;
    }

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -velocityPlayer;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = velocityPlayer;
    }
    else
    {
        player.animations.stop();
    }

}

function render() {
    //game.debug.text("Arrows to move.", 32, 32);
}

function eatFood (oldplayer, deadparticle) {
    // Removes the particle
    deadparticle.kill();

    // Add random food particle
    var particle = food.create(game.world.randomX, game.world.randomY, bmpFood);
    particle.body.setCircle(foodRadious);

    playerRadious += 1;

    var bmpNewPlayer = game.add.bitmapData(2*playerRadious,2*playerRadious);
    bmpNewPlayer.ctx.fillStyle = '#ff9999';
    bmpNewPlayer.ctx.beginPath();
    bmpNewPlayer.ctx.arc(playerRadious,playerRadious,playerRadious,0,2*Math.PI);
    bmpNewPlayer.ctx.closePath();
    bmpNewPlayer.ctx.fill();
    var x = oldplayer.x;
    var y = oldplayer.y;
    oldplayer.kill();
    var newplayer = game.add.sprite(x, y, bmpNewPlayer);
    game.physics.arcade.enable(newplayer);
    newplayer.body.setCircle(playerRadious);
    newplayer.body.collideWorldBounds = true;
    player = newplayer;
}