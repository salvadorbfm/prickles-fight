var Game = (function() {


    var game = [];
    var game_width = 700;
    var game_height = 500;
    var canvas = null;
    var context = null;
    var ui_handler = null;
    var happy_assets = [
                        '/js/content/happy_right.png',
                        '/js/content/happy_left.png'
                       ];
    var evil_assets = [
                       '/js/content/evil_right.png',
                       '/js/content/evil_left.png'
                      ];
    var balloons_assets = [
                           ['/js/content/balloon1.png'],
                           ['/js/content/balloon2.png'],
                           ['/js/content/balloon3.png'],
                           ['/js/content/balloon4.png'],
                           ['/js/content/balloon5.png'],
                           ['/js/content/balloon6.png']
                          ];
    var bomb_assets = ['/js/content/bomb1.png',
                       '/js/content/bomb2.png',
                       '/js/content/bomb_exp.png'];

    var background_assets = ['../js/content/fondo1.png',
                             '../js/content/fondo2.png'];

    var frames_rate = 1000/30;
    var happy_frames_rate = 1000/2;
    var evil_frames_rate = 1000/2;
    var bomb_frame_rate = 1000/2;
    var background_frame_rate = 1000;
    var balloons_frames_rate = 2000;
    var collisions_frame_rate = 500;


    var evil_frame = 0;
    var happy_frame = 0;
    var background_frame = 0;

    var evil = [];
    var happy;
    var balloons= [];                                      // A lot of balloons
    var bomb = [];
    var background;

    var Background = function(config) {
        config = config || {};
        var self = {};

        self.x = config.x || 0;
        self.y = config.y || 0;

        self.frames = [];
        self.assets = config.assets || [];

        self.build_frames = function()
        {
            for (var i = 0; i < self.assets.length; i++) {
              self.frames.push(new Image());
              self.frames[i].src = self.assets[i];
              self.frames[i].onload = self.onImageLoad;
            }
        }
        self.onImageLoad = function(){
            //console.log("IMAGE!!!");
        };

        return self;
    };
    var Sprite = function(config){
        config = config || {};
        var self = {};

        //self.image = loadImage("content/happy_left.png");

        self.x = config.x || 0.0;
        self.y = config.y || 0.0;

        self.width = config.width || 20.0;
        self.height = config.height || 20.0;
        self.speed_x = config.speed_x || 1.0;
        self.speed_y = config.speed_y || 1.0;
        self.boost = 3.0;

        self.direction_x = config.direction_y || 1.0;
        self.direction_y = config.direction_y || 1.0;

        self.RGB = config.RGB || [200,200,200];

        self.drawable = false;

        self.balloons_destroyed = 0;

        self.is_collision = false;
        self.last_collision_with = -1;

        self.assets = config.assets || [];
        self.frames = [];
        self.frame = 0;

        self.init = function() {
            self.drawable = true;
            self.frame = 0;
        };
        self.build_frames = function()
        {
            for (var i = 0; i < self.assets.length; i++) {
              self.frames.push(new Image());
              self.frames[i].src = self.assets[i];
              self.frames[i].onload = self.onImageLoad;
            }
        }

        self.onImageLoad = function(){
            //console.log("IMAGE!!!");
        };


        self.get_center_x = function(){
            return self.x + self.width/2.0;
        };

        self.get_center_y = function(){
            return self.y + self.height/2.0;
        };


        self.invert_position = function(directionArg){
            var direction = directionArg || '0';

            if(direction == 'x'){
                self.direction_x *= -1.0;
            }
            else if(direction == 'y'){
                self.direction_y *= -1.0;
            }
            else{
                //if (Math.random() > 0.5)
                    self.direction_x *= -1.0;
                //if (Math.random() > 0.5)
                    self.direction_y *= -1.0;
            }
        };

        self.calculate_direction = function(axis){
            var max = 0;
            var min = -5;

            if (axis == 'y') {
                max = game_height;
                if ( (self.y + self.direction_y*self.speed_y) > max )
                  return true;
                if ( (self.y + self.direction_y*self.speed_y) < 0)
                  return true;
            }
            else if (axis == 'x') {
                max = game_width;
                if ( (self.x + self.direction_x*self.speed_x) > max )
                  return true;
                if ( (self.x + self.direction_x*self.speed_x) < 0)
                  return true;
            }
            else {
                max = (game_width>game_height)? game_width:game_height;
            }
            return false;

        };

        self.update_position = function(){
            var temp_x = 0;
            var temp_y = 0;
            var energy_boost_x = 0;
            var energy_boost_y = 0;

            var wall_in_x = self.calculate_direction( 'x');
            var wall_in_y = self.calculate_direction( 'y');


            if (self.is_collision == true)
            {
                self.invert_position();
                energy_boost_x = 5.0;
                energy_boost_y = 5.0;
                self.is_collision = false;
            }

            if (wall_in_x == true) {
                self.direction_x *= -1.0;
                energy_boost_x = 10.0;
            }
            if (wall_in_y == true) {
              self.direction_y *= -1.0;
              energy_boost_y = 10.0;
            }
            temp_x = self.x;
            temp_y = self.y;
            self.x += ( (self.direction_x)*(self.speed_x + energy_boost_x) );
            self.y += ( (self.direction_y)*(self.speed_y + energy_boost_y) );
            //if (self.y < 1) debugger;
        };

        return self;
    };

    /*
        Bomb is an extra elemento in the game, this intends to explotes
        and affects as Evil as Happy.
        TODO: Create a timer of 3 seconds

    */
    var Bomb = function(config) {
        config = config || {};
        var self = {};

        self = Sprite(config);
        self.has_exploited = false;

        self.init = function () {
            self.x = util.get_random_int(0,game_width-50);
            self.y = util.get_random_int(0,game_height-50);
            console.log("Bomb has being intialized at: " + self.x + ", " + self.y);
            self.has_exploited = false;
            setTimeout(function(){
                console.log("Bomb has exploited!!");
                self.frame = 2;
                self.has_exploited = true;
            }, 10000);
            self.frame = 0;
            self.drawable = true;
        };

        self.set_release_time = function() {
            setTimeout(function(){
                console.log("Stop drawing the BOMB now!");
                self.drawable = false;
            }, 1000);
        }


        return self;
    };
    var Happy = function(config){
        var self = {};

        self = Sprite(config);

        self.x_mouse = 0;
        self.y_mouse = 0;
        self.down=false;

        self.init = function(){
            $('#game_canvas').mousemove(self.mouse_move_handler);
            $('#game_canvas').mousedown(self.mouse_down_handler);
            $('#game_canvas').mouseup(self.mouse_up_handler);
            $('#game_canvas').mouseout(self.mouse_up_handler);

            //$('body').keypress(self.keypress_handler);
            self.drawable = true;
        };

        self.keypress_handler = function(ev) {
            var key = ev.keyCode || ev.which;
            //console.log("keypress: key:" + key);
            switch (key) {
                case 119: // W
                    self.direction_x = 0;
                    self.direction_y = -1;
                break;
                case 97: // A
                    self.direction_x = -1;
                    self.direction_y = 0;
                break;
                case 115: // S
                    self.direction_x = 0;
                    self.direction_y = 1;
                break;
                case 100: // D
                    self.direction_x = 1;
                    self.direction_y = 0;
                break;
                default:
            }

        };

        self.mouse_move_handler = function(ev){
            var offset = $('#game_canvas').offset();
            self.x_mouse =  ev.pageX - offset.left;
            self.y_mouse = ev.pageY - offset.top;
            if (self.down) {
                self.dragging = true;
                self.go_to_the_point(self.x_mouse, self.y_mouse);
            }
        };

        self.mouse_down_handler = function(ev){
            self.down = true;
            self.downX = self.x_mouse;
            self.downY = self.y_mouse;
            //console.log("SEM: ("+ self.downX + "," + self.downY + ")");

            self.go_to_the_point(self.x_mouse, self.y_mouse);

            ev.originalEvent.preventDefault();
        };

        self.mouse_up_handler = function(ev){
            self.down = false;
            self.dragging = false;

        };

        self.is_a_ball_destroyed = function(sprites){

            for (var i = 0; i < sprites.length; i++) {
                if (sprites[i].drawable == false) continue;
                if (phys.check_collision( self, sprites[i])){
                    sprites[i].drawable = false;
                    self.balloons_destroyed++;
                }
            };
        };

        self.go_to_the_point = function(x,y) {
            var center = {x:self.get_center_x(), y:self.get_center_y()};
            var distance = util.get_distance(
                                            center,
                                            {
                                            x:x,
                                            y:y
                                            }
            );
            var normalized = util.normalize(distance);

            self.direction_x = normalized.x;
            self.direction_y = normalized.y;
        };

        return self;
    };

    var Evil = function(config){
        var self = {};
        var util = Util();

        //debugger;
        self = Sprite(config);

        self.sprite_target = config.sprite_target || -1;


        // search(happy,sprites)
        // This function looks for the closest sprite
        self.search = function(happy, sprites, ally_target){
            var center = {x:self.get_center_x(), y:self.get_center_y()};
            var min = 0;
            var distance = {};
            var magnitude = 0;
            var distance_to_enemy = {};
            var normalized = {};

            min = 99999.0;

            self.sprite_target = -1;
            self.speed_x = util.get_random(4.0,6.0);
            self.speed_y = util.get_random(4.0,6.0);
            for (var i = sprites.length - 1; i >= 0; i--) {
                if(sprites[i].drawable == false) continue;

                magnitude = util.get_magnitude(
                            center,
                            {
                            x:sprites[i].x,
                            y:sprites[i].y
                            }
                            );

                distance = util.get_distance(
                            center,
                            {
                            x:sprites[i].x,
                            y:sprites[i].y
                            }
                            );

                if( magnitude<min && ally_target!=i){
                    min = magnitude;
                    self.sprite_target = i;
                    distance_to_enemy = distance;
                }
            }
            normalized = util.normalize(distance_to_enemy);

            if (self.sprite_target == -1)
            {
                self.direction_x = Math.random();
                self.direction_y = Math.random();
            }else {
                self.direction_x = normalized.x;
                self.direction_y = normalized.y;
            }
            self.update_position();
            return self.sprite_target;
        };

        self.destroy = function(happy, sprites, phys){
            var sprites = sprites || new Array();
            var happy = happy || {};
            var phys = phys || {};

            if(self.sprite_target >= 0) {
                if( phys.check_collision( self, sprites[self.sprite_target]) )
                {
                    sprites[self.sprite_target].drawable = false;
                    self.balloons_destroyed++;
                    self.sprite_target = 0;
                    //debugger;
                }
            }
        };

        return self;
    };

    var Util = function()
    {
        var self = {};
        self.get_filled_array = function (len, val) {
            var filled_array = new Array(len);
            for(var i=0; i<len; i++)
            {
                filled_array[i] = val;
            }
            return filled_array;
        };

        self.get_magnitude = function(p1,p2){
            return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
        };
        self.get_distance = function(p1,p2){
            var distance = {};
            distance.x = p2.x - p1.x;
            distance.y = p2.y - p1.y;
            return distance;
        };

        self.get_magnitude_sa = function(p){
            var magnitude =  Math.sqrt(p.x*p.x + p.y*p.y);
            //debugger;
            if(magnitude < 0.00001)
                return 1.0;
            else
                return magnitude;
        };

        self.normalize = function(p){
            magnitude = self.get_magnitude_sa(p);
            if (magnitude < 0.001)
                return {
                  x : 1.0,
                  y : 1.0
                }
            else
                return {
                    x: p.x/magnitude,
                    y: p.y/magnitude
                }
        }

        self.get_random_int = function(min, max) {
            return Math.floor( Math.random() * (max-min+1) ) + min;
        }

        self.get_random = function(min, max) {
            return  Math.random() * (max-min) + min;
        }



        self.is_unique_position = function(x,y, initial_positions, width, height) {
          // TODO Feb 11
          var ref_x = 0;
          var ref_y = 0;


          for (var i = 0; i < initial_positions.length; i++) {
            ref_x = initial_positions[i].x;
            ref_y = initial_positions[i].y;

            if ( ((x < (ref_x + width/2)) && (x > (ref_x - width/2))) && ((y < (ref_y + height/2)) && (y > (ref_y - height/2))) ) {
                //console.log("SEM: " + x + ":" + y);
                return false;
              }
          }

          return true;
        }
        return self;
    };
    var Phys = function(config){
        config = config || {};

        var self = {};
        var util = Util();

        // Checking collision between two sprites
        self.check_collision = function(spriteA, spriteB){
            var spriteA = spriteA || null;  // Here, I should check the error of having a "null" sprite
            var spriteB = spriteB || null;
            var radA = 0;
            var radB = 0;
            var centerA = {};
            var centerB = {};
            var magnitude = 0;

            if (spriteA == null && spriteB == null) return false;

            radA = (spriteA.width/2.0);
            radB = (spriteB.width/2.0);
            centerA = {x:spriteA.get_center_x(), y:spriteA.get_center_y()};
            centerB = {x:spriteB.get_center_x(), y:spriteB.get_center_y()};

            magnitude = util.get_magnitude(centerA,centerB);

            return self.has_collided(magnitude, radA, radB);
        };
        self.has_collided = function(magnitude, radA, radB){
            if ( (magnitude+10) < (radA + radB))
                return true;
            return false;
        };
        self.check_collision_by_points = function(x, y, width, happy, sprites, evil) {
            var radA;
            var radB;
            var centerA;
            var centerB;
            var magnitude;
            radA = width/2;
            centerA = {x:(x + width/2),
                       y:(y + width/2)
                      };
            // Temporal, I will handle happy as an Array
            // Checking with happy
            radB = happy.width/2;
            centerB = {x:happy.get_center_x(), y:happy.get_center_y()};
            magnitude = util.get_magnitude(centerA,centerB);
            if (self.has_collided(magnitude, radA, radB) == true)
                    return true;

            // Checking with evils
            for (var i=0; i<evil.length; i++) {
                radB = evil[i].width/2;
                centerB = {x:evil[i].get_center_x(), y:evil[i].get_center_y()};
                magnitude = util.get_magnitude(centerA,centerB);
                if (self.has_collided(magnitude, radA, radB) == true)
                    return true;
            }
            // Checking with balloons
            for (var i = 0; i < sprites.length; i++) {
              radB = sprites[i].width/2;
              centerB = {x:sprites[i].get_center_x(), y:sprites[i].get_center_y()};

              magnitude = util.get_magnitude(centerA,centerB);
              if (self.has_collided(magnitude, radA, radB))
                  return true;

            }

            return false;
        };

        // For each balloon, checks if there is a collision.
        self.check_collisions = function(sprites){
            sprites = sprites || new Array();
            var is_changed = util.get_filled_array(sprites.length, false);

            for (var i=0; i<sprites.length; i++){
                if (is_changed[i] == true) continue;
                if (sprites[i].drawable == false) continue;
                if (sprites[i].last_collision_with == j) {
                  //debugger;
                  continue;
                }

                for (var j=0; j<sprites.length; j++){
                    // ************************************************** TODO
                    // ************************* Oopps!
                    // This is not working, I need to save the last state and avoid repeated collisions ...
                    if (is_changed[i] == true || i==j ) continue;
                    if (sprites[j].drawable == false) continue;
                    if (sprites[j].last_collision_with == i) continue;

                    if (self.check_collision(sprites[i],sprites[j])){
                        sprites[i].is_collision = true;
                        sprites[i].last_collision_with = j;
                        sprites[j].is_collision = true;
                        sprites[j].last_collision_with = i;
                        is_changed[j] = true;
                        is_changed[i] = true;
                    }
                }
            }
            for (var i = 0; i < is_changed.length; i++) {
                if (is_changed[i] == false)
                    sprites[i].last_collision_with = -1;
            };
        };

        return self;
    };

    var phys = Phys();
    var util = Util();

    var UIHandler = function(config) {
        config = config || {};
        var self = {};
        var instructions_counter = 0;
        self.init = function() {
            $('#game_start_button').mouseup(self.game_start_handler);
            $('#game_start_instructions').mouseup(self.game_instructions_handler);
            $('#game_start_button').mouseover(self.game_start_over).mouseout(self.game_start_out);
            $('#game_start_instructions').mouseover(self.game_instructions_over).mouseout(self.game_instructions_out);

            $('.game_layer').hide();
            $('#game_start_screen').show();
        };

        self.counter = 3;
        self.timer;

        self.game_start_out = function() {
            $('#game_start_button').css('background-color', '#3E3F12')
        };

        self.game_instructions_out = function() {
            $('#game_start_instructions').css('background-color', '#3E3F12')
        };
            //$('#game_start_instructions').css('background-color', '#3E3F12')
        self.game_start_over = function() {
            $('#game_start_button').css('background-color', '#9E6F2E');
        };

        self.game_instructions_over = function() {
            $('#game_start_instructions').css('background-color', '#9E6F2E');
        };


        self.game_start_handler = function() {
            $('.game_layer').hide();
            $("#game_counter_screen").show();
            $("#game_counter").html(self.counter);

            self.timer = setInterval(function(){
                self.counter--;
                if (self.counter == 0) {
                    $(".game_layer").hide();
                    $('#game_canvas').show();
                    $('#game_score').show();
                    start_game();
                    setInterval(animate, frames_rate);
                    setInterval(update_score, frames_rate);
                    setInterval(update_evil, evil_frames_rate);
                    setInterval(update_bomb, bomb_frame_rate);
                    setInterval(update_happy, happy_frames_rate);
                    setInterval(update_balloons, balloons_frames_rate);
                    setInterval(update_bombs, 20000);                        // Fixing
                    setInterval(update_background, background_frame_rate);
                    clearInterval(self.timer)
                }
                $("#game_counter").html(self.counter);
            },1000);

        };

        self.game_instructions_handler = function() {
            if (instructions_counter == 0)
                $('#game_instructions').show();
            else
                $('#game_instructions').hide();

            instructions_counter = (instructions_counter+1) % 2;
        };
        return self;
    };

    var setup = function() {
        ui_handler = UIHandler();
        ui_handler.init();


        body = document.getElementById('body');
        canvas = document.getElementById('game_canvas');
        canvas.className = "game_layer";
        canvas.width = game_width+50;
        canvas.height = game_height+50;
        context = canvas.getContext('2d');
    };

    var start_game = function() {
        background = Background({
            assets : background_assets
        });
        background.build_frames();

        happy = Happy({
            x : util.get_random_int(0,100),
            y : util.get_random_int(350,500),
            width : 70.0,
            height : 70.0,
            speed_x : util.get_random(8.0,10.0),
            speed_y : util.get_random(8.0,10.0),
            direction_x : util.get_random(-1.0,1.0),
            direction_y : util.get_random(-1.0,1.0),
            assets: happy_assets
        });

        happy.init();
        happy.build_frames();

        add_evils(1);
        add_balloons();
        add_bombs(1);
    }

    var update_background = function(){

        background_frame = (background_frame+1) % 2;

    };

    var update_score = function () {
        var total_destroyed = 0;
        for (var i = 0; i < evil.length; i++) {
            total_destroyed += evil[i].balloons_destroyed;
        };
        $("#evil_results").html( total_destroyed.toString() );
        $("#happy_results").html(happy.balloons_destroyed.toString());
    };

    var animate = function() {
        var last_target = -1;
        context.clearRect(0,0,canvas.width, canvas.height);

        context.drawImage(background.frames[background_frame], 0, 0);

        //********************** Bombs Drawing and Updating ************************
        for (var i=0; i < bomb.length; i++) {
            if (bomb[i].drawable == true) {
                if (bomb[i].frame == 2) {// Explosion
                    context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y, bomb[i].width*1.5, bomb[i].height*1.5);
                }
                else {
                    context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y);
                }
                if (bomb[i].has_exploited == true) {
                    bomb[i].set_release_time();
                }
            }
        };
        //**********************          END               ************************


        //********************** Happy Drawing and Updating ************************
        context.drawImage(happy.frames[happy_frame], happy.x, happy.y);
        happy.is_a_ball_destroyed(balloons);
        happy.update_position();
        //**********************          END               ************************


        //********************** Evil Drawing and Updating ************************
        for (var i = 0; i < evil.length; i++) {
            context.drawImage(evil[i].frames[evil_frame], evil[i].x, evil[i].y);
            last_target = evil[i].search(happy,balloons,last_target);
            evil[i].destroy(happy, balloons, phys);
        }
        //**********************          END               ************************

        //******************* Balloons Drawing and Updating ************************
        for (var i = 0; i < balloons.length; i++) {
          if (balloons[i].drawable == false) continue;
            context.drawImage(balloons[i].frames[0], balloons[i].x, balloons[i].y);
            balloons[i].update_position();
        }
        phys.check_collisions(balloons);
        //**********************          END               ************************

    };


    var update_evil = function() {
        evil_frame = (evil_frame + 1) % evil[0].frames.length;
    };
    var update_happy = function() {
        if (happy.direction_x > 0)
            happy_frame = 0;
        else
            happy_frame = 1;
        //happy_frame = (happy_frame + 1) % happy.frames.length;
    };

    /*  update_bomb is for handling the frame change*/
    var update_bomb = function() {
        for (var i = 0; i < bomb.length; i++) {
            if (bomb[i].drawable == true && bomb[i].has_exploited == false) {
                bomb[i].frame = (bomb[i].frame + 1) % 2;
            }
        }
    };

    /* update_ballons is binded to a setInterval and this function handles the way
     of how balloons are added to the game */
    var update_balloons = function() {
        var new_ballons = util.get_random_int(1,3);
        var max = 0;

        trim_array(balloons);
        if (evil.length > 1)
            max = (evil[0].balloons_destroyed > evil[1].balloons_destroyed)?(evil[0].balloons_destroyed):(evil[1].balloons_destroyed);
        if ((balloons.length) < 25)
            add_balloons(4);
    };

    /* update_bombs is binded to a setInterval and this function handles the way
     of how balloons are added to the game */
    var update_bombs = function() {
        //trim_array(bomb);
        add_bombs(1);
    };
    var add_evils = function(n_evils) {
        n_evils = n_evils || 3;
        var x = 0;
        var y = 0;

        for (var i = 0; i < n_evils; i++) {
            evil.push( Evil({
                            x : util.get_random_int(x,x+200),
                            y : util.get_random_int(y,y+200),
                            width : 70.0,
                            height : 70.0,
                            assets: evil_assets
                            }));
            evil[i].build_frames();
            x += 250;
            y += 150;
        };
    };

    var add_bombs = function(n){
        n = n || 1;
        var x = 0;
        var y = 0;
        var bomb_obj = {};

        for (var i=0; i<n; i++) {
            bomb_obj = Bomb({
                        width : 60,
                        height : 60,
                        assets: bomb_assets
            });
            bomb.push(bomb_obj);
            bomb[i].build_frames();
            bomb[i].init();
        }
    };

    // trim_array releases all elements with drawable == false
    var trim_array = function (_array) {
        for (var i = 0; i < _array.length; i++) {
            if (_array[i].drawable == false)
                _array.splice(i,1);
        };
    }
    var add_balloons = function (n_balloons) {
        var current_index = 0;
        var x;// = util.get_random_int(0, game_width);
        var y;// = util.get_random_int(0, game_height);
        n_balloons = n_balloons || util.get_random_int(5,10);


        current_index = balloons.length;
        for (var i = 0; i < n_balloons; i++) {
            do {
                x = util.get_random_int(0,game_width);
                y = util.get_random_int(0,game_height);
            }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evil) == true);

            balloons.push( Sprite({
              x : x,
              y : y,
              direction_x : (util.get_random_int(0,10) > 5)?1.0:-1.0,
              direction_y : (util.get_random_int(0,10) > 5)?-1.0:1.0,
              speed_x : 7.0,
              speed_y : 4.0,
              width : 50.0,
              height :50.0,
              assets: balloons_assets[util.get_random_int(0,5)]
            }));
            balloons[current_index + i].build_frames();
            balloons[current_index + i].init();
        }
        //console.log("SEM add_balloons: " + " new_ballons:" + n_balloons + " len:"  + balloons.length);
    };

    $(window).load(function() {
        game.setup = setup();
    });


    return game;
})(window);