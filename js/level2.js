/**
 * Created by Carles on 25/12/2016.
 */

var level2 = {
    create: function(){

        game.add.tileSprite(0, 0, 1600, 1200, 'background_black');
        radio = 20;
        score = 0;
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

    },

    update: function() {

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

    },

    render: function() {

        // Score
        game.debug.text("Score: "+score.toString() , 32, 32, 'white');

    },

    eatFood: function(oldplayer, deadparticle) {

        // Removes the particle
        deadparticle.kill();

        // Add random food particle
        var particle = food.create(game.world.randomX, game.world.randomY, bmpFood);
        particle.body.setCircle(foodRadius);
        radio+=1;
        console.log("NewScale: " + radio);
        player.setRadius(radio);

        //  Add and update the score
        score += 10;
    }
};