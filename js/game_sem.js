(function(undefined) {

    // requestAnim shim layer by Paul Irish
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    window.game = window.game || {};
    window.game.resources = 0;
    window.game.game_width = 750;
    window.game.game_height = 550;

    var host = "http://172.17.245.145:3000";
    var routeGET = "/gamestates/show";
    var routeAndParams = "/gamestates/show/?user_id=1&game_id=1";
    var routePOST = "/gamestates/";
    var insertCoinHandler = InsertCoinHandler( {url: host+routeAndParams} );
    var canvas = null,
      context = null;

    var frames_rate = 16,
        update_rate = 1000/30,
        happy_frames_rate = 1000/2,
        evil_frames_rate = 1000/2,
        bomb_frame_rate = 1000/2,
        wing_frame_rate = 1000/3,
        wing_update_rate = 20000,
        background_frame_rate = 1000,
        balloons_frames_rate = 1000,
        collisions_frame_rate = 500;

    var evil_frame = 0,
        happy_frame = 0,
        background_frame = 0;

    var evils = [],
        happy,
        balloons= [],                                      // A lot of balloons
        bomb = [],
        wing,
        winner,
        background;
    var state = {
                        "on_hold":0,
                        "playing":1,
                        "draw" : 2,
                        "limit_reached":3,
                        "happy_wins": 4,
                        "evil_wins" : 5
    };

    window.game.game_state = state.on_hold;

    var util = window.game.util || Util(),
        phys = window.game.phys || Phys(),
        ui_handler = {},
        timer_handler = window.game.time_handler || TimeHandler();

    var toggle;
    var happy_assets = [
                        '/js/content/happy_right.png',
                        '/js/content/happy_left.png',
                        '/js/content/happy_right_attacked.png',
                        '/js/content/happy_left_attacked.png',
                        '/js/content/happy_right_wings.png',
                        '/js/content/happy_left_wings.png'
                       ],

        evil_assets = ['/js/content/evil_right.png',
                        '/js/content/evil_right_attacked.png',
                       '/js/content/evil_left.png',
                       '/js/content/evil_left_attacked.png'],

        balloons_assets = [['/js/content/balloon1.png'],
                           ['/js/content/balloon2.png'],
                           ['/js/content/balloon3.png'],
                           ['/js/content/balloon4.png'],
                           ['/js/content/balloon5.png'],
                           ['/js/content/balloon6.png']],

        bomb_assets = ['/js/content/bomb1_right.png',
                       '/js/content/bomb1_left.png',
                       '/js/content/bomb2_right.png',
                       '/js/content/bomb2_left.png',
                       '/js/content/bomb_exp.png'],

        wing_assets = [ '/js/content/wing1.png',
                        '/js/content/wing2.png',
                        '/js/content/wing3.png',
                        '/js/content/wing4.png'],
        background_assets = ['../js/content/fondo1.png',
                             '../js/content/fondo2.png'],

        winner_assets = ['../js/content/win_happy.png',
                         '../js/content/win_evil.png'];


    var load_game = function() {
        background = Background({
            assets : background_assets
        });
        background.build_frames();

        winner = BaseSprite({
            assets : winner_assets
                });
        winner.build_frames();

        happy = Happy({
            x : util.get_random_int(0,100),
            y : util.get_random_int(350,500),
            width : 70.0,
            height : 70.0,
            speed_x : 9.0, //util.get_random(9.0,11.0),
            speed_y : 9.0, //util.get_random(9.0,11.0),
            direction_x : util.get_random(-1.0,1.0),
            direction_y : util.get_random(-1.0,1.0),
            assets: happy_assets,
            update_lives : update_lives,
            update_score : update_score_c
        });

        happy.init();
        happy.build_frames();
        add_evils(1);

        wing = Wing({
            x: util.get_random_int(10, window.game.game_width-20),
            y: util.get_random_int(10, window.game.game_height-20),
            width: 73,
            height: 73,
            assets: wing_assets,
            happy: happy,
            evils: evils,
            balloons: balloons
        });
        wing.build_frames();
        balloons.limit = 150;
        add_balloons(25);
        add_bombs(2);
        update_lives();
    };
    var init = function() {
      ui_handler = UIHandler({
        load_game : load_game,
        load_intervals : load_intervals,
        animate : animate,
        state : state,
        restart_game: restart_game,
        callbacks : {
            load_from_insertcoin : load_from_insertcoin
        }
      });
      ui_handler.init();
      canvas = document.getElementById( 'game_canvas' );
      canvas.width = window.game.game_width;
      canvas.height = window.game.game_height;
      context = canvas.getContext( '2d' );

      $('body').keypress(main_key_handler);
    }

    var animate = function() {
        requestAnimFrame( animate );
        draw();

    }

    var draw = function() {
      canvasDemo = false;
      var last_target = 0;
      if ( canvasDemo === true ){
        var time = new Date().getTime() * 0.002;
        var x = Math.sin( time ) * 192 + 256;
        var y = Math.cos( time * 0.9 ) * 192 + 256;
        toggle = !toggle;

        context.fillStyle = toggle ? 'rgb(200,200,20)' :  'rgb(20,20,200)';
        context.beginPath();
        context.arc( x, y, 10, 0, Math.PI * 2, true );
        context.closePath();
        context.fill();
      }
      else{
        //context.clearRect(0,0,canvas.width, canvas.height);
        context.drawImage(background.frames[background_frame], 0, 0);
        window.game.game_state = state.playing;
        // ************************** Check end of game  ****************************
        check_happy_lives();
        check_evil_lives();
        check_end_of_game();
        if (window.game.game_state === state.happy_wins || window.game.game_state === state.evil_wins) {
            idx = (window.game.game_state === state.happy_wins ) ? (0):(1);
            context.drawImage(winner.frames[idx], 140, 20);
            timer_handler.kill_all_intervals();
            context.font = '14pt Arial';
            context.lineWidth = 3;
            context.fillStyle = 'black';
            context.fillText('Press Space to play again!', 270, 540);
            return;
        }
        // ***************************       END
        //********************** Happy Drawing and Updating ************************
        update_happy();
        context.drawImage(happy.frames[happy_frame], happy.x, happy.y);
        if (happy.is_moving === true) {
            happy.is_a_ball_destroyed(balloons);
            happy.update_position();
        }
        //**********************          END               ************************
        // ********************** Wing Drawing and Updating ************************
        if (wing.drawable === true && wing.is_available === true){
            context.drawImage(wing.frames[wing.frame], wing.x, wing.y);
            wing.check_powerup(happy);
        }
        // ***************************       END            ************************
        //******************* Balloons Drawing and Updating ************************
        for (var i = 0; i < balloons.length; i++) {
          if (balloons[i].drawable === false) continue;
            context.drawImage(balloons[i].frames[0], balloons[i].x, balloons[i].y);
            balloons[i].update_position();
        }
        phys.check_collisions(balloons);
        //**********************          END               ************************
        //********************** Bombs Drawing and Updating ************************
        for (var i=0; i < bomb.length; i++) {
            if (bomb[i].drawable === true) {
                context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y);
                if (bomb[i].has_exploited == true && bomb[i].release_time_started === false) {
                    bomb[i].destroy_when_explosion(balloons);
                    bomb[i].destroy_when_explosion([happy,evils[0]]); // This will need support for multiplayer
                    bomb[i].set_release_time();
                }
            }
        };
        //**********************          END               ************************
        //********************** Evil Drawing and Updating ************************
        for (var i = 0; i < evils.length; i++) {
            update_evil(i);
            context.drawImage(evils[i].frames[evil_frame], evils[i].x, evils[i].y);
            if (evils[i].is_moving === true) {
                last_target = evils[i].search(happy,balloons,last_target);
                evils[i].destroy(happy, balloons, phys);
            }
        }
        //**********************          END               ************************
      }
    };

    var main_key_handler = function(event) {
        var callback = "&callback=?";
        var myJSONData = { happy: happy, evils : evils, balloons:balloons };
        console.log("event wich key: " + event.which);
        switch (event.which) {
            case 32:
                if ( window.game.game_state === state.happy_wins || window.game.game_state === state.evil_wins) {
                    restart_game();
                }
            break;
            case 115:
                // TODO: Build Saved State Game
                console.log("Saving game");
                insertCoinHandler.save({
                    url: host + routePOST,
                    gamestate: { gamestate : {
                                "user_id" : 1,
                                "game_id" : 1,
                                "platform_id" : 5,
                                "data": JSON.stringify( myJSONData)
                        }
                    }
                });
                //insertCoinHandler.load( host + routeAndParams  + "&callback=?");
            break;
            case 13:
             event.preventDefault();
            break;
        }
    };
    var load_from_insertcoin = function(){
        insertCoinHandler.load( host + routeAndParams  + "&callback=?");
    };
    var load_intervals = function() {
        timer_handler.safe_interval(update_balloons, balloons_frames_rate, "update_balloons");
        //timer_handler.safe_interval(update_evil, evil_frames_rate, "update_evil");
        timer_handler.safe_interval(update_bomb, bomb_frame_rate, "update_bomb");
        timer_handler.safe_interval(update_wing, wing_frame_rate, "update_wing");
        var delay_wings = setTimeout(function() {
            timer_handler.safe_interval(add_wing, wing_update_rate, "add_wing");
            clearInterval(delay_wings);
        }, wing_update_rate);

        /*
        */

    };
    var update_lives = function() {
        var view = {
            lives: happy.lives
        };
        var output = "{{#lives}} <div class='heart'></div> {{/lives}}";
        var html = Mustache.to_html(output, view);
        $('#happy_lives').html(html);
        view = {
            lives: evils[0].lives        // Need support
        };
        output = "{{#lives}} <div class='heart'></div> {{/lives}}";
        html = Mustache.to_html(output, view);
        $('#evil_lives').html(html);
    };
    var update_score_c = function(e) {
        $(e.id.toString()).html( e.points.toString() );
    };
    balloons.update_limit = function(n_balloons) {
        balloons.limit -= n_balloons;
        balloons.trigger({
            type:"update_score",
            id: "#balloon_results",
            points:balloons.limit
        });
    };
    var add_evils = function(n_evils) {
        n_evils = n_evils || 3;
        var x = 0,
            y = 0;
        for (var i = 0; i < n_evils; i++) {
            evils.push( Evil({
                            x : util.get_random_int(x,x+200),
                            y : util.get_random_int(y,y+200),
                            width : 70.0,
                            height : 70.0,
                            assets: evil_assets,
                            update_lives : update_lives,
                            update_score : update_score_c
                            }));
            evils[i].init();
            evils[i].build_frames();
            x += 250;
            y += 150;
        };
    };

    var add_bombs = function(n){
        n = n || 1;
        var x = 0,
            y = 0,
            startX = 0,
            startY = 0,
            partX = window.game.game_width / n,
            partY = window.game.game_height / n;

        for (var i=0; i<n; i++) {
            bomb.push( Bomb({
                        x : util.get_random_int(startX, partX),
                        //x : util.get_random_int(0, game_width),
                        y : util.get_random_int(startY, partY),
                        //y : util.get_random_int(0, game_height),
                        width : 80,
                        height : 80,
                        time : util.get_random_int(5000, 8000),
                        assets: bomb_assets
                        })
                    );
            bomb[i].build_frames();
            bomb[i].init(update_lives);
            startX = partX;
            startY = partY;
            partX += window.game.game_width / n;
            partY += window.game.game_height / n;
        }
    };

    var add_wing = function() {
        wing.respawn();
    };
    // trim_array releases all elements with drawable == false
    var trim_array = function (_array) {
        for (var i = 0; i < _array.length; i++) {
            if (_array[i].drawable == false)
                _array.splice(i,1);
        };
    }
    var respawn_all_balloons = function() {
        var x,
            y;
        balloons.update_limit(balloons.length);
        for (var i = 0; i < balloons.length; i++) {
            balloons[i].drawable = true;
            balloons[i].x = -1;
            balloons[i].y = -1;
        }
        for (var i = 0; i < balloons.length; i++) {
            do {
                x = util.get_random_int(0, window.game.game_width);
                y = util.get_random_int(0, window.game.game_height);
            }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);
            balloons[i].x = x;
            balloons[i].y = y;

        }
    };
    var update_evil = function(i) {
        //evil_frame = (evil_frame + 1) % evils[0].frames.length;
        i = i || 0;
        var offset = 0;
        if (evils[i].was_attacked === true) {
            offset = 1;
            evils[i].was_attacked = false;
        }
        if (evils[i].direction_x > 0)
            evil_frame = 0 + offset;
        else
            evil_frame = 2 + offset;
    };
    var update_happy = function() {
        var offset = 0;
        if (happy.was_attacked === true) {
            offset = 2;
        }else if (happy.was_powered === true){
            offset = 4
        }
        if (happy.direction_x > 0)
            happy_frame = 0 + offset;
        else
            happy_frame = 1 + offset;
    };

    /*  update_bomb is for handling the frame change*/
    var update_bomb = function() {
        var offset = 0;
        for (var i = 0; i < bomb.length; i++) {
            if (bomb[i].drawable === true) {
                if (bomb[i].about_to_explote === true) {
                    bomb[i].frame = 3;
                    continue;
                } else if (bomb[i].has_exploited === true) {
                    bomb[i].frame = 4;
                    continue;
                }
                bomb[i].frame = ((bomb[i].frame + 1) % 2) + offset;
            }
        }
    };

    var update_wing = function() {
        wing.frame = (wing.frame+1) % wing.frames.length;
    };
    /* update_ballons is binded to a safe_interval and this function handles the way
     of how balloons are added to the game */
    var update_balloons = function() {
        var new_balloons = util.get_random_int(1,3),
            max = 0,
            x = 0,
            y = 0;

        // Balloons balloons.limit has been reached, time to see who wins!
        if (balloons.limit === 0) {
            //console.log("Limit has been reached, time to see who is the champ! ");
            return ;
        }
        // We need to get just the necessary balloons
        if (new_balloons > balloons.limit) {
            new_balloons = util.get_random_int(1, balloons.limit);
        }

        // update limit
        balloons.update_limit(new_balloons);

        for (var i=0; i<balloons.length ; i++) {
            if (balloons[i].drawable === false) {
                balloons[i].drawable = true;
                new_balloons -= 1;
                do {
                    x = util.get_random_int(0, window.game.game_width);
                    y = util.get_random_int(0, window.game.game_height);
                }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);
                balloons[i].x = x;
                balloons[i].y = y;
            }
            if (new_balloons === 0) {
                break;
            }
        }

    };

    /* update_bombs is binded to a safe_interval and handles the way
     of how balloons are added to the game */
    var update_bombs = function() {
        var startX = 0,
            startY = 0,
            partX = window.game.game_width / bomb.length;
            partY = window.game.game_height / bomb.length;
        for (var i = 0; i < bomb.length; i++) {
            if (bomb[i].has_exploited == true && bomb[i].drawable == false) {
                bomb[i].respawn(startX, startY, partX, partY);
                startX = partX;
                startY = partY;
                partX += window.game.game_width / bomb.length;
                partY += window.game.game_height / bomb.length;
            }
        };
    };
    var add_balloons = function (n_balloons) {
        var current_index = 0,
            x,
            y;
        n_balloons = n_balloons || util.get_random_int(5,10);

        $.extend(balloons, EventEmitter());
        balloons.bind("update_score", update_score_c);
        balloons.update_limit(n_balloons);
        // Add new balloons
        current_index = balloons.length;
        for (var i = 0; i < n_balloons; i++) {
            do {
                x = util.get_random_int(0, window.game.game_width);
                y = util.get_random_int(0, window.game.game_height);
            }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);

            balloons.push( Sprite({
              type: "balloon",
              x : x,
              y : y,
              direction_x : (util.get_random_int(0,10) > 5) ?  1.0 : -1.0,
              direction_y : (util.get_random_int(0,10) > 5) ? -1.0 :  1.0,
              speed_x : 3.0,
              speed_y : 2.0,
              width : 50.0,
              height :50.0,
              assets: balloons_assets[util.get_random_int(0,5)]
            }));
            balloons[current_index + i].build_frames();
            balloons[current_index + i].init();
        }
    };

    var check_happy_lives = function() {
        if (happy.lives.length === 0) {
            happy.has_died = true;
            //console.log("Happy has died! =(");
        }
    };

    var check_evil_lives = function() {
        for (var i = 0; i < evils.length; i++) {
            if (evils[i].lives.length === 0) {
                evils[i].has_died = true;
                //console.log("Evil has died! =(");
            }
        };
    };

    /* check_end_of_game() Decides if the has ended and trigger the end events */
    var check_end_of_game = function() {
        var game_state;
        if (happy.has_died == true && evils[0].has_died == true) { // Needs support
            game_state = state.draw;
        }else if (happy.has_died == true) {
            game_state = state.evil_wins;
        }else if (evils[0].has_died == true) {                     // Needs support
            game_state = state.happy_wins;
        }else if (balloons.limit <= 0 && util.get_drawables(balloons) === 0) {                     // Needs support
            game_state = (happy.balloons_destroyed > evils[0].balloons_destroyed) ? (state.happy_wins):(state.evil_wins);
        }else {
            return ;
        }
        window.game.game_state = game_state;

    };

    var restart_game = function() {
        happy.respawn();
        evils[0].respawn();    // Need support for multiplayer
        //add_balloons(25);
        update_lives();
        balloons.limit = 150;
        respawn_all_balloons();
        game_state = state.playing;
        load_intervals();
    };
    $(document).ready(function() {
        init();
        //load_game();
        //load_intervals();
        //animate();
    });
})();