/*

    __ _      ____  _______ __       ___  _____      ______ __ __   ___      ____  ____  ____   __ __  _ _       ___ _____
   /  | |    /    |/ ___|  |  |     /   \|     |    |      |  |  | /  _]    |    \|    \|    | /  |  |/ | |     /  _/ ___/
  /  /| |   |  o  (   \_|  |  |    |     |   __|    |      |  |  |/  [_     |  o  |  D  )|  | /  /|  ' /| |    /  [(   \_
 /  / | |___|     |\__  |  _  |    |  O  |  |_      |_|  |_|  _  |    _]    |   _/|    / |  |/  / |    \| |___|    _\__  |
/   \_|     |  _  |/  \ |  |  |    |     |   _]       |  | |  |  |   [_     |  |  |    \ |  /   \_|     |     |   [_/  \ |
\     |     |  |  |\    |  |  |    |     |  |         |  | |  |  |     |    |  |  |  .  \|  \     |  .  |     |     \    |
 \____|_____|__|__| \___|__|__|     \___/|__|         |__| |__|__|_____|    |__|  |__|\_|____\____|__|\_|_____|_____|\___|

           Code by Salvador Elizarraras Montenegro
                   @SalvadorBFM
           Art  by Arturo Elizarraras Montenegro
                   @sagitarioaem

           2013
*/
(function(undefined) {


    var game = [];
        game_width = 700,
        game_height = 500,
        canvas = null,
        context = null,
        ui_handler = null,
        timer_handler = null;

    var happy_assets = [
                        '/js/content/happy_right.png',
                        '/js/content/happy_right_attacked.png',
                        '/js/content/happy_left.png',
                        '/js/content/happy_left_attacked.png'
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

        background_assets = ['../js/content/fondo1.png',
                             '../js/content/fondo2.png'],

        winner_assets = ['../js/content/win_happy.png',
                         '../js/content/win_evil.png'];

    var frames_rate = 1000/30,
        update_rate = 1000/30,
        happy_frames_rate = 1000/2,
        evil_frames_rate = 1000/2,
        bomb_frame_rate = 1000/2,
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



    var game_state = state.onhold;

    var BaseSprite = function(config) {
        config = config || {};
        var self = {};
        $.extend(self, EventEmitter());   // Necessary for event handling with EventEmmiter.js

        self.assets = config.assets || [];
        self.frames = [];
        self.frame = 0;
        self.type = config.type || "";
        self.x = config.x || 0.0;
        self.y = config.y || 0.0;
        self.width = config.width || 20.0;
        self.height = config.height || 20.0;
        self.is_collision = false;
        self.last_collision_with = -1;

        self.RGB = config.RGB || [200,200,200];
        self.drawable = false;

        self.update_function = function() {
            console.log("Not defined function!");
        };

        self.update_score = function() {
            console.log("Not defined function!");
        };

        self.get_center_x = function(){
            return self.x + self.width/2.0;
        };

        self.get_center_y = function(){
            return self.y + self.height/2.0;
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



        return self;
    };

    var Background = function(config) {
        config = config || {};
        var self = BaseSprite(config);
        return self;
    };

    var Sprite = function(config){
        config = config || {};
        var self = BaseSprite(config);

        self.speed_x = config.speed_x || 1.0;
        self.speed_y = config.speed_y || 1.0;
        self.boost = 3.0;

        self.direction_x = config.direction_y || 1.0;
        self.direction_y = config.direction_y || 1.0;

        self.balloons_destroyed = 0;
        self.invulnerability = false;

        self.was_attacked = false;                   // For main characters
        self.has_died = false;                       // For main characters
        self.lives = [true, true, true];             // For main characters

        self.update_function = config.update_lives || self.update_function;
        self.update_score = config.update_score || self.update_score;
        self.bind("update_score", self.update_score);
        self.bind("update_lives", self.update_function);

        self.init = function(update_score_func) {
            self.drawable = true;
            self.was_attacked = false;
            self.frame = 0;
        };

        self.decrease_live = function() {
            self.lives.pop();
            self.trigger({
                type: "update_lives"
            });
            self.set_invulnerability();
        };
        self.set_invulnerability = function() {
            self.invulnerability = true;
            setTimeout(function(){
                if (self.was_attacked === true)
                    self.was_attacked = false;

                self.invulnerability = false;
            }, 1300);
        };

        self.respawn = function() {
            self.drawable = true;
            self.was_attacked = false;
            self.frame = 0;
            self.balloons_destroyed = 0;
            self.has_died = false;
            self.set_invulnerability();
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
        Bomb is an extra elemento in the game that explodes and affects both happy and evils.
    */
    var Bomb = function(config) {
        config = config || {};
        var self = {};

        self = BaseSprite(config);
        self.about_to_explote = false;
        self.has_exploited = false;
        self.release_time_started = false;
        self.time = config.time || 10000;


        self.init = function (func) {
            //console.log("Bomb has being intialized at: " + self.x + ", " + self.y);
            self.has_exploited = false;
            self.about_to_explote = false;
            self.update_function = func || self.update_function;
            self.bind("update_lives", self.update_function);
            setTimeout(function(){
                //console.log("Bomb has exploited!!");
                self.about_to_explote = true;

                setTimeout(function(){
                    self.has_exploited = true;
                    self.about_to_explote = false;
                }, 1000);

            }, self.time);
            self.frame = 0;
            self.drawable = true;
            self.release_time_started = false;
        };

        self.set_release_time = function() {
            self.release_time_started = true;
            setTimeout(function(){
                //console.log("Stop drawing the BOMB now!");
                self.drawable = false;
            }, 1000);
        };

        self.destroy_when_explosion = function(_array) {
            _array = _array || null;
            if (self.has_exploited == false || _array == null) return;

            for (var i = 0; i < _array.length; i++) {
                if (phys.check_collision(self, _array[i]) == true) {
                    _array[i].was_attacked = true;
                    if (_array[i].type === "balloon") {
                        _array[i].drawable = false;
                    }
                    else {
                        if (_array[i].invulnerability === false)
                            _array[i].decrease_live();
                    }
                }
            }
        };

        self.respawn = function() {
            self.x = util.get_random_int(0, game_width);
            self.y = util.get_random_int(0, game_height);
            self.init();
        };


        return self;
    };

    // ********************** Main Characters *************************************
    // TODO: Have a generic template for a user controlled character
    // TODO: Think in one especial power for both of them.
    /*
        Happy is one of the main characters in the game.
    */
    var Happy = function(config){
        var self = {};

        self = Sprite(config);

        self.x_mouse = 0;
        self.y_mouse = 0;
        self.down=false;


        self.init = function(update_score_func, update_lives_func){
            $('#game_canvas').mousemove(self.mouse_move_handler);
            $('#game_canvas').mousedown(self.mouse_down_handler);
            $('#game_canvas').mouseup(self.mouse_up_handler);
            $('#game_canvas').mouseout(self.mouse_up_handler);

            //$('body').keypress(self.keypress_handler);
            self.drawable = true;
        };

        self.respawn = function() {
            self.drawable = true;
            self.lives = [true, true, true];
            self.has_died = false;
            self.balloons_destroyed = 0;
            self.was_attacked = false;
            self.has_died = false;
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
                if (phys.check_collision( self, sprites[i]) ){
                    sprites[i].drawable = false;
                    self.balloons_destroyed++;
                    self.trigger({
                        id:"#happy_results",
                        type:"update_score",
                        points:self.balloons_destroyed
                    });
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

    /*
        Evil is one of the main characters in the game, this guy is a badass.
    */
    var Evil = function(config){
        var self = {};
        var util = Util();

        //debugger;
        self = Sprite(config);

        self.sprite_target = {balloon: -1, enemy: -1};

        self.init = function() {
            self.drawable = true;
        };

        self.respawn = function() {
            self.drawable = true;
            self.lives = [true, true, true];
            self.has_died = false;
            self.balloons_destroyed = 0;
            self.was_attacked = false;
            self.has_died = false;
            self.sprite_target = {balloon: -1, enemy: -1};
        };
        // search(happy,sprites)
        // This function looks for the closest sprite
        self.search = function(happy, sprites, ally_target){
            var center = {x:self.get_center_x(), y:self.get_center_y()};
            var center_enemy = {x:happy.get_center_x(), y:happy.get_center_y()};
            var min = 0;
            var distance = {};
            var magnitude = 0;
            var magnitude_with_enemy = 0;
            var distance_to_enemy = {};
            var normalized = {};

            min = 99999.0;

            self.sprite_target = {balloon: -1, enemy: -1};
            self.speed_x = util.get_random(5.0,7.0);
            self.speed_y = util.get_random(5.0,7.0);
            for (var i = sprites.length - 1; i >= 0; i--) {
                if(sprites[i].drawable == false) continue;

                magnitude = util.get_magnitude(
                            center,
                            {
                            x:sprites[i].x,
                            y:sprites[i].y
                            }
                            );


                if( magnitude<min && ally_target!=i){
                    distance = util.get_distance(
                                center,
                                {
                                x:sprites[i].x,
                                y:sprites[i].y
                                }
                                );
                    min = magnitude;
                    self.sprite_target.balloon = i;
                    distance_to_enemy = distance;
                }
            }
            if (happy.invulnerability === false) {
                // Checking magnitude with enemy, if this is less we must grab it
                magnitude_with_enemy = util.get_magnitude(center, center_enemy);
                if (magnitude_with_enemy + 0.2 < magnitude) {   // 0.2 is a workaround
                    self.sprite_target.enemy = -2;                                       // For enemies
                    distance_to_enemy = util.get_distance( center, center_enemy );
                }
            }

            normalized = util.normalize(distance_to_enemy);

            if (self.sprite_target.balloon === -1 && self.sprite_target.enemy === -1)
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
            var idx = self.sprite_target.balloon;
            phys = phys || {};
            sprites = sprites || new Array();
            happy = happy || {};

            if(idx >= 0) {
                if( phys.check_collision( self, sprites[idx] ) ) {
                    sprites[idx].drawable = false;
                    self.balloons_destroyed++;
                    self.trigger({
                        id:"#evil_results",
                        type:"update_score",
                        points:self.balloons_destroyed
                    });
                }
            }

            if(self.sprite_target.enemy === -2) {
                if( phys.check_collision( self, happy) ) {
                    happy.was_attacked = true;
                    happy.decrease_live();
                }
            }
        };

        return self;
    };
    // ********************** End of Main Characters *******************************


    /* Util Class
       This class stores a collection of useful math functions. */
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
        };

        self.get_random_int = function(min, max) {
            return Math.floor( Math.random() * (max-min+1) ) + min;
        };

        self.get_random = function(min, max) {
            return  Math.random() * (max-min) + min;
        };



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
        };

        self.get_drawables = function (_array) {
            var n = 0;
            for (var i = 0; i < _array.length; i++) {
                if (_array[i].drawable === true) {
                    n += 1;
                }
            };
            return n;
        };

        return self;
    };


    var Phys = function(config){
        config = config || {};

        var self = {};
        var util = Util();

        self.check_collision_with_array = function(a, _array) {
            a = a || null;
            _array = _array || null;
            if ( (_array instanceof Array) == false ) {
                return false;
            }
            if (a == null || spritesB == null) return false;
            var radA = 0,
                radB = 0,
                centerA = {},
                centerB = {},
                magnitude = 0;

            for (var i = 0; i < _array.length; i++) {
                if (self.check_collision(a, _array[i]) == true) {
                    console.log("");
                }
            }

            return false;
        };
        // Checking collision between two sprites or between a sprite and an Array of Sprites
        self.check_collision = function(spriteA, spriteB) {
            spriteA = spriteA || null;
            spriteB = spriteB || null;
            if (spriteA == null || spriteB == null) return false;
            var radA = 0,
                radB = 0,
                centerA = {},
                centerB = {},
                magnitude = 0;

            radA = (spriteA.width/2.0);
            centerA = {x:spriteA.get_center_x(), y:spriteA.get_center_y()};
            radB = (spriteB.width/2.0);
            centerB = {x:spriteB.get_center_x(), y:spriteB.get_center_y()};
            magnitude = util.get_magnitude(centerA,centerB);

            return self.has_collided(magnitude, radA, radB);
        };

        self.has_collided = function(magnitude, radA, radB){
            if ( (magnitude+10) < (radA + radB) )
                return true;
            return false;
        };

        self.check_collision_by_points = function(x, y, width, happy, sprites, evils) {
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
            for (var i=0; i<evils.length; i++) {
                radB = evils[i].width/2;
                centerB = {x:evils[i].get_center_x(), y:evils[i].get_center_y()};
                magnitude = util.get_magnitude(centerA,centerB);
                if (self.has_collided(magnitude, radA, radB) == true)
                    return true;
            }
            // Checking with balloons
            for (var i = 0; i < sprites.length; i++) {
              if (sprites[i].x < 0 && sprites[i].y <  0)
                    continue;
              radB = sprites[i].width/2;
              centerB = {x:sprites[i].get_center_x(), y:sprites[i].get_center_y()};

              magnitude = util.get_magnitude(centerA,centerB);
              if (self.has_collided(magnitude, radA, radB))
                  return true;
            }

            return false;
        };

        // For each balloon, checks if there is a collision.
        self.check_collisions = function(sprites) {
            sprites = sprites || new Array();
            var is_changed = util.get_filled_array(sprites.length, false);

            for (var i=0; i<sprites.length; i++) {
                if (is_changed[i] == true) continue;
                if (sprites[i].drawable == false) continue;
                if (sprites[i].last_collision_with == j) continue;

                for (var j=0; j<sprites.length; j++) {
                    if (is_changed[i] == true || i==j ) continue;
                    if (sprites[j].drawable == false) continue;
                    if (sprites[j].last_collision_with == i) continue;

                    if ( self.check_collision(sprites[i], sprites[j]) ) {
                        sprites[i].is_collision = true;
                        sprites[j].is_collision = true;
                        sprites[i].last_collision_with = j;
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

            $('body').keypress(self.restart_handler);
            $('.game_layer').hide();
            $('#game_start_screen').show();
        };

        self.counter = 3;
        self.timer;
        self.xTriggered = 0;

        self.restart_handler = function(event) {
            switch (event.which) {
                case 32:
                    if ( game_state === state.happy_wins || game_state === state.evil_wins) {
                        restart_game();
                    }
                break;
                case 13:
                 event.preventDefault();
                break;
            }
        };
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


            load_game();
            self.timer = timer_handler.safe_interval(function(){
                self.counter--;
                if (self.counter == 0) {
                    $(".game_layer").hide();
                    $('#game_canvas').show();
                    $('#game_score').show();
                    game_state = state.playing;
                    load_intervals();
                }
                $("#game_counter").html(self.counter);
            }, 1000);

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

    /* TimeHandler is a class that handles the safe_interval function.
       Work around for clearInterval:
            Since we have a "safe interval" we need a way to clear this safe interval,
            for this purpose, we need to call like:
                time_handler.safe_interval( myfunc, time, "myfunc")
            and clear the interval with:
                time_handler.running_functions["myfunc"] = false
    */
    var TimeHandler = function(config) {
        config = config || {};
        var self = {};

        self.running_functions = {};

        self.safe_interval  = function ( _funct, _time, _name){
            if (typeof(_funct) != "function")
                return ;
            if (_time <= 0)
                return ;

            self.running_functions[_name] = true;
            (function interval(){
                if ( self.running_functions[_name] === false )
                    return;
                _funct();
                setTimeout(interval, _time);
            })();
        };
        self.kill_all_intervals = function() {
            //for (var obj)
            console.log("kill_all_intervals!!");
            for (var obj in self.running_functions){
                self.running_functions[obj] = false;
            }
        }
        return self;
    };

    var setup = function() {
        ui_handler = UIHandler();
        ui_handler.init();

        timer_handler = TimeHandler();


        body = document.getElementById('body');
        canvas = document.getElementById('game_canvas');
        canvas.className = "game_layer";
        canvas.width = game_width+50;
        canvas.height = game_height+50;
        context = canvas.getContext('2d');
    };

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
            speed_x : util.get_random(9.0,11.0),
            speed_y : util.get_random(9.0,11.0),
            direction_x : util.get_random(-1.0,1.0),
            direction_y : util.get_random(-1.0,1.0),
            assets: happy_assets,
            update_lives : update_lives,
            update_score : update_score_c
        });

        happy.init();
        happy.build_frames();

        add_evils(1);
        balloons.limit = 200;
        add_balloons(25);
        add_bombs(2);
        update_lives();
    };
    var load_intervals = function() {
        //timer_handler.safe_interval(update_game, update_rate, "update_game");
        timer_handler.safe_interval(animate, frames_rate, "animate");
        timer_handler.safe_interval(update_evil, evil_frames_rate, "update_evil");
        timer_handler.safe_interval(update_bomb, bomb_frame_rate, "update_bomb");
        timer_handler.safe_interval(update_happy, happy_frames_rate, "update_happy");
        timer_handler.safe_interval(update_balloons, balloons_frames_rate, "update_balloons");
        timer_handler.safe_interval(update_bombs, 12000, "update_bombs");                        // Fixing
        timer_handler.safe_interval(update_background, background_frame_rate, "update_background");
    };

    var restart_game = function() {
        happy.respawn();
        evils[0].respawn();    // Need support for multiplayer
        //add_balloons(25);
        update_lives();
        balloons.limit = 200;
        respawn_all_balloons();
        game_state = state.playing;
        load_intervals();
    };

    var animate = function() {
        var last_target = -1;
        var scale = 0.0;
        var idx = 0;
        context.clearRect(0,0,canvas.width, canvas.height);

        context.drawImage(background.frames[background_frame], 0, 0);

        // ************************** Check end of game  ****************************
        check_happy_lives();
        check_evil_lives();
        check_end_of_game();

        if (game_state === state.happy_wins || game_state === state.evil_wins) {
            idx = (game_state === state.happy_wins ) ? (0):(1);
            context.drawImage(winner.frames[idx], 140, 20);
            timer_handler.kill_all_intervals();
            context.font = '14pt Arial';
            context.lineWidth = 3;
            context.fillStyle = 'black';
            context.fillText('Press Space to play again!', 270, 540);
            return;
        }

        // ***************************       END            ************************

        //********************** Bombs Drawing and Updating ************************
        for (var i=0; i < bomb.length; i++) {
            if (bomb[i].drawable === true) {
                /*
                if (bomb[i].frame === 4) {// Explosion
                    scale = 1.5;
                }else if (bomb[i].frame === 3) {
                    scale = 0.8;
                }
                else {
                    scale = 0.0;
                }
                if (scale > 0.0)
                    context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y, bomb[i].width*scale, bomb[i].height*scale);
                else
                    context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y);
                */
                context.drawImage(bomb[i].frames[bomb[i].frame], bomb[i].x, bomb[i].y);

                if (bomb[i].has_exploited == true && bomb[i].release_time_started === false) {
                    bomb[i].destroy_when_explosion(balloons);
                    bomb[i].destroy_when_explosion([happy,evils[0]]); // This will need support for multiplayer
                    bomb[i].set_release_time();
                }
            }
        };
        //**********************          END               ************************
        //******************* Balloons Drawing and Updating ************************
        for (var i = 0; i < balloons.length; i++) {
          if (balloons[i].drawable === false) continue;
            context.drawImage(balloons[i].frames[0], balloons[i].x, balloons[i].y);
            balloons[i].update_position();
        }
        phys.check_collisions(balloons);
        //**********************          END               ************************


        //********************** Happy Drawing and Updating ************************
        context.drawImage(happy.frames[happy_frame], happy.x, happy.y);
        happy.is_a_ball_destroyed(balloons);
        happy.update_position();
        //**********************          END               ************************

        //********************** Evil Drawing and Updating ************************
        for (var i = 0; i < evils.length; i++) {
            context.drawImage(evils[i].frames[evil_frame], evils[i].x, evils[i].y);
            last_target = evils[i].search(happy,balloons,last_target);
            evils[i].destroy(happy, balloons, phys);
        }
        //**********************          END               ************************
    };

    balloons.update_limit = function(n_balloons) {
        balloons.limit -= n_balloons;
        balloons.trigger({
            type:"update_score",
            id: "#balloon_results",
            points:balloons.limit
        });
    };

    var check_happy_lives = function() {
        if (happy.lives.length === 0) {
            happy.has_died = true;
            console.log("Happy has died! =(");
        }
    };

    var check_evil_lives = function() {
        for (var i = 0; i < evils.length; i++) {
            if (evils[i].lives.length === 0) {
                evils[i].has_died = true;
                console.log("Evil has died! =(");
            }
        };
    };

    /* check_end_of_game() Decides if the has ended and trigger the end events */
    var check_end_of_game = function() {

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

    };

    var update_background = function(){

        background_frame = (background_frame+1) % 2;

    };

    var update_score_c = function (e) {
        /*
        var total_destroyed = 0;
        for (var i = 0; i < evils.length; i++) {
            total_destroyed += evils[i].balloons_destroyed;
        };
        */
        $(e.id.toString()).html( e.points.toString() );
    };
    var update_lives = function(e) {
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

    var update_evil = function() {
        //evil_frame = (evil_frame + 1) % evils[0].frames.length;
        var offset = 0;
        for (var i = 0; i < evils.length; i++) {
            if (evils[i].was_attacked === true) {
                offset = 1;
                evils[i].was_attacked = false;
            }
            if (evils[i].direction_x > 0)
                evil_frame = 0 + offset;
            else
                evil_frame = 2 + offset;
        };
    };
    var update_happy = function() {
        var offset = 0;
        if (happy.was_attacked === true) {
            offset = 1;
            //happy.was_attacked = false;
        }
        if (happy.direction_x > 0)
            happy_frame = 0 + offset;
        else
            happy_frame = 2 + offset;

        //happy_frame = (happy_frame + 1) % happy.frames.length;
    };

    /*  update_bomb is for handling the frame change*/
    var update_bomb = function() {
        var offset = 0;
        for (var i = 0; i < bomb.length; i++) {
            if (bomb[i].drawable == true) {
                if (bomb[i].about_to_explote === true) {
                    bomb[i].frame = 3;
                    continue;
                } else if (bomb[i].has_exploited == true) {
                    bomb[i].frame = 4;
                    continue;
                }
                bomb[i].frame = ((bomb[i].frame + 1) % 2) + offset;
            }
        }
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
            console.log("Limit has been reached, time to see who is the champ! ");
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
                    x = util.get_random_int(0,game_width);
                    y = util.get_random_int(0,game_height);
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
        //trim_array(bomb);
        for (var i = 0; i < bomb.length; i++) {
            if (bomb[i].has_exploited == true && bomb[i].drawable == false) {
                bomb[i].respawn();
            }
        };
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
            partX = game_width / n,
            partY = game_height / n;

        for (var i=0; i<n; i++) {
            bomb.push( Bomb({
                        //x : util.get_random_int(startX, partX),
                        x : util.get_random_int(0, game_width),
                        //y : util.get_random_int(startY, partY),
                        y : util.get_random_int(0, game_height),
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
            partX *= 2;
            partY *= 2;
        }
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
                x = util.get_random_int(0,game_width);
                y = util.get_random_int(0,game_height);
            }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);
            balloons[i].x = x;
            balloons[i].y = y;

        }
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
                x = util.get_random_int(0,game_width);
                y = util.get_random_int(0,game_height);
            }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);

            balloons.push( Sprite({
              type: "balloon",
              x : x,
              y : y,
              direction_x : (util.get_random_int(0,10) > 5) ?  1.0 : -1.0,
              direction_y : (util.get_random_int(0,10) > 5) ? -1.0 :  1.0,
              speed_x : 7.0,
              speed_y : 4.0,
              width : 50.0,
              height :50.0,
              assets: balloons_assets[util.get_random_int(0,5)]
            }));
            balloons[current_index + i].build_frames();
            balloons[current_index + i].init();
        }
    };

    $(window).load(function() {
        game.setup = setup();
    });


    return game;
})();