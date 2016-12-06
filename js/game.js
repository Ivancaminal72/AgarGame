/**
 * Created by Ivan on 29/11/2016.
 */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'agar_game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('background_white','img/white.png');
    //game.load.image('player','assets/sprites/phaser-dude.png');

}

var player;
var cursors;
var food;

function create() {

    game.add.tileSprite(0, 0, 800, 600, 'background_white');

    game.world.setBounds(0, 0, 800, 600);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Player
    var bitmapdata = game.add.bitmapData(40,40);
    bitmapdata.ctx.fillStyle = '#ff9999';
    bitmapdata.ctx.beginPath();
    bitmapdata.ctx.arc(20,20,20,0,2*Math.PI);
    bitmapdata.ctx.closePath();
    bitmapdata.ctx.fill();
    player = game.add.sprite(game.world.centerX, game.world.centerY, bitmapdata);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    // Food
    var bmp = game.add.bitmapData(20,20);
    bmp.ctx.fillStyle = '#fff242';
    bmp.ctx.beginPath();
    bmp.ctx.arc(10,10,10,0,2*Math.PI);
    bmp.ctx.closePath();
    bmp.ctx.fill();
    food = game.add.group();
    food.enableBody = true;
    //food.physicsBodyType = 3;
    for(i=0; i<15; i++){
        var particle = food.create(game.world.randomX, game.world.randomY, bmp);
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
        player.body.velocity.y = -300;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 300;
    }

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -300;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 300;
    }
    else
    {
        player.animations.stop();
    }

}

function render() {

    game.debug.text("Arrows to move.", 32, 32);

}

function eatFood (player, particle) {
    // Removes the particle from the screen
    particle.kill();
}