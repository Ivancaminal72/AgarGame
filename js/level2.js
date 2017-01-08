/**
 * Created by Carles on 25/12/2016.
 */

var level2 = {

    init: function(player,enemies,food){
    },

    create: function(){

        game.add.tileSprite(0, 0, 1600, 1200, 'background_black');
        score = 0;
        winner = false;
        loser = false;

        wall1 = new Wall(200,200);
        wall2 = new Wall(1000,200);
        wall3 = new Wall(600,600);

        cursors = game.input.keyboard.createCursorKeys();

        game.camera.follow(player.bola, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        game.world.bringToTop(player.bola);
        game.world.bringToTop(food);
        game.world.bringToTop(enemies);

        socket.on('update_particle', function(foodIndex, new_food){
            console.log('particle killed');
            var particle = food.getChildAt(foodIndex);
            particle.x = new_food.x;
            particle.y = new_food.y;
        });

        socket.on('update_player_size', function(playerIndex, radius){
            if(playerIndex == player.index){
                console.log("Update Player size: " + radius);
                player.setRadius(radius);

                //Update player score
                score = (radius-20) * 10;

            }
            else{
                var enemyIndex = getEnemyIndex(playerIndex);
                console.log("Update Enemie " + enemyIndex + " radius");
                var enemy = enemies.getChildAt(enemyIndex);
                if(!enemy.exists){enemy.revive()}
                var color = enemy.key.ctx.fillStyle;
                enemy.key.clear();
                enemy.key.resize(2*radius,2*radius);
                enemy.key.ctx.fillStyle = color;
                enemy.key.ctx.beginPath();
                enemy.key.ctx.arc(radius,radius,radius,0,2*Math.PI);
                enemy.key.ctx.closePath();
                enemy.key.ctx.fill();
                enemy.body.setCircle(radius);
                enemy.width = 2*radius;
                enemy.height = 2*radius;
                enemy.key.update();
            }
        });

        socket.on('delete_enemy', function(playerIndex){
            var enemyIndex = getEnemyIndex(playerIndex);
            var enemy = enemies.getChildAt(enemyIndex);
            enemy.kill();
        });

        socket.on('new_enemy', function (playerIndex, new_enemy) {
            console.log('new_enemy');
            var enemyIndex = getEnemyIndex(playerIndex);
            console.log('enemy index: '+enemyIndex);
            console.log('enemy x: '+ new_enemy.position.x +' y: '+ new_enemy.position.y+ ' radius: '+new_enemy.radius);
            var bmpEnemy = createBitmap(new_enemy.radius, '#' + Math.floor(Math.random() * 16777215).toString(16));
            var enemy = enemies.create(new_enemy.position.x, new_enemy.position.y, bmpEnemy, null, true, enemyIndex);
            enemy.body.setCircle(new_enemy.radius);
        });

        socket.on('update_player_position', function(playerIndex, new_x, new_y){
            console.log('position changed');
            var enemyIndex =getEnemyIndex(playerIndex);
            var enemy = enemies.getChildAt(enemyIndex);
            enemy.x = new_x;
            enemy.y = new_y;
        });

        socket.on('player_killed', function () {
            console.log('player_killed');
            player.bola.x=game.world.randomX;
            player.bola.y=game.world.randomY;
            player.setRadius(playerStartRadius);
            //Update player score
            score = (player.radius-20) * 10;
            socket.emit('new_radius', player.index, player.radius);
        });

        socket.on('winner',function(){
            winner = true;
        });

        socket.on('loser',function(){
            loser = true;
        });


    },

    update: function() {

        if(game.time.now - actionTime > 1000) { //Check this code every 1 second
            if (player.oldPosition.x != player.bola.x || player.oldPosition.y != player.bola.y) {
                actionTime = game.time.now;
                player.oldPosition.x = player.bola.x;
                player.oldPosition.y = player.bola.y;
                socket.emit('new_position', player.bola.x, player.bola.y, player.index);
            }
            game.physics.arcade.overlap(player.bola, food, overlapFood, null, this);
            game.physics.arcade.overlap(player.bola, enemies, overlapEnemies, null, this);
        }

        if (game.physics.arcade.collide(player.bola, wall1.sprite) || game.physics.arcade.collide(player.bola, wall2.sprite) || game.physics.arcade.collide(player.bola, wall3.sprite)){
            loser = true;
            socket.emit('game_over', false);
        }

        player.setVelocityX(0);
        player.setVelocityY(0);

        if (cursors.up.isDown) {
            player.setVelocityY(-velocityPlayer+score/5);
        } else if (cursors.down.isDown) {
            player.setVelocityY(velocityPlayer-score/5);
        }

        if (cursors.left.isDown)
        {
            player.setVelocityX(-velocityPlayer+score/5);
        } else if (cursors.right.isDown) {
            player.setVelocityX(velocityPlayer-score/5);
        }

        if (score >= 600){
            winner = true;
            socket.emit('game_over', true);
        }

    },

    render: function() {

        // Score
        game.debug.text("Score: "+ score.toString() , 32, 32, 'white');

        if(winner){
            game.debug.text("GAME OVER! Well done!" , 300, 300, 'white');
        }
        else if(loser){
            game.debug.text("GAME OVER! You loser!" , 300, 300, 'white');
        }

    },

    overlapFood: function(oldplayer, deadparticle){
        if(oldOverlaps.food.x != deadparticle.x || oldOverlaps.food.y != deadparticle.y) { //Check if the message is already sent
            socket.emit('overlap_food', player.index, food.getIndex(deadparticle), deadparticle.x, deadparticle.y);
            oldOverlaps.food.x = deadparticle.x;
            oldOverlaps.food.y = deadparticle.y;
        }
    },

    overlapEnemies: function(oldplayer, oldenemy){
        if(oldOverlaps.enemies.x != oldenemy.x || oldOverlaps.enemies.y != oldenemy.y) { //Check if the message is already sent
            var enemyIndex=enemies.getIndex(oldenemy);
            var playerIndex;
            if(enemyIndex >= player.index){playerIndex = enemyIndex+1;}
            else{playerIndex = enemyIndex;}
            socket.emit('overlap_enemies', player.index, playerIndex);
            oldOverlaps.enemies.x = oldenemy.x;
            oldOverlaps.enemies.y = oldenemy.y;
        }
    },

    createBitmap: function(radius, color) {
        var bmp = game.add.bitmapData(2*radius,2*radius);
        bmp.ctx.fillStyle = color;
        bmp.ctx.beginPath();
        bmp.ctx.arc(radius,radius,radius,0,2*Math.PI);
        bmp.ctx.closePath();
        bmp.ctx.fill();
        return bmp;
    },

    getEnemyIndex: function(playerIndex) {
        if(playerIndex > player.index){return playerIndex-1;}
        else{return playerIndex;}
    },

    getPlayerIndex: function(enemyIndex) {
        if(enemyIndex >= player.index){return enemyIndex+1;}
        else{return enemyIndex;}
    }

};