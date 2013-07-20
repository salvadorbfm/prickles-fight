game.resources = game.resources || 0;
var phys = game.phys || Phys();
var util = game.util || Util();
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
        //console.log("Not defined function!");
    };

    self.update_score = function() {
        //console.log("Not defined function!");
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
        game.resources++;
        console.log("game.resources: " + game.resources);
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

    self.is_moving = false;
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

    self.respawn = function(startX,startY, partX, partY) {
        self.x = game.util.get_random_int(startX, partX);
        self.y = game.util.get_random_int(startY, partY);
        self.init();
    };


    return self;
};

var Wing = function(config) {
    var self = BaseSprite(config);
    config = config || {};
    var happy = config.happy || {};
    var evils = config.evils || {};
    var balloons = config.balloons || {};
    self.drawable = false;
    self.is_available = false;
    self.init = function(){
        self.drawable = true;
        self.is_available = true;
        setTimeout(function(){
            self.drawable = false;
            self.is_available = false;
        },7000);
    };

    self.respawn = function() {
        var x = 0,
            y = 0;
        do {
                x = game.util.get_random_int(0,game_width);
                y = game.util.get_random_int(0,game_height);
        }while ( phys.check_collision_by_points(x, y, 50.0, happy, balloons, evils) == true);
        self.x = x;
        self.y = y;
        self.init();
    };

    self.check_powerup = function(happy) {
        if (happy.was_powered === true)
            return;
        if (phys.check_collision(self, happy) === true) {
            self.drawable = false;
            self.is_available = false;
            happy.trigger({
                type:"speed_powerup"
            });
        }

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
    var old_speed_x = 0,
        old_speed_y = 0;

    var remove_powerup = null;
    self = Sprite(config);

    self.x_mouse = 0;
    self.y_mouse = 0;
    self.down=false;
    self.was_powered = false;

    self.remove_powerup = function() {
        self.was_powered = false;
        if (old_speed_x > 0 && old_speed_y > 0) {
            self.speed_x = old_speed_x;
            self.speed_y = old_speed_y;
        }
    };

    self.init = function(){
        $('#game_canvas').mousemove(self.mouse_move_handler);
        $('#game_canvas').mousedown(self.mouse_down_handler);
        $('#game_canvas').mouseup(self.mouse_up_handler);
        $('#game_canvas').mouseout(self.mouse_up_handler);
        self.bind("speed_powerup", self.speed_powerup);
        //$('body').keypress(self.keypress_handler);
        self.drawable = true;
    };

    self.speed_powerup = function() {
        old_speed_x = self.speed_x;
        old_speed_y = self.speed_y;

        self.speed_x = 15.0;
        self.speed_y = 15.0;
        self.was_powered = true;
        setTimeout(function(){
            self.remove_powerup();
        }, 7000);
    };
    self.respawn = function() {
        self.drawable = true;
        self.lives = [true, true, true];
        self.has_died = false;
        self.balloons_destroyed = 0;
        self.was_attacked = false;
        self.has_died = false;
        remove_powerup();
        self.is_moving = false;
        self.x = 50;
        self.y = 50;
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
        self.is_moving = true;
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
        var distance = game.util.get_distance(
                                        center,
                                        {
                                        x:x,
                                        y:y
                                        }
        );
        var normalized = game.util.normalize(distance);

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

    //debugger;
    self = Sprite(config);

    self.sprite_target = {balloon: -1, enemy: -1};

    self.init = function() {
        self.drawable = true;
        self.on_hold();
    };
    self.on_hold = function() {
        self.is_moving = false;
        setTimeout(function(){
            self.is_moving = true;
        },2000);
    };
    self.respawn = function() {
        self.drawable = true;
        self.lives = [true, true, true];
        self.has_died = false;
        self.balloons_destroyed = 0;
        self.was_attacked = false;
        self.has_died = false;
        self.sprite_target = {balloon: -1, enemy: -1};
        self.x = game_width - 100;
        self.y = game_height - 100;
        self.on_hold();
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
        self.speed_x = game.util.get_random(3.0,5.0);
        self.speed_y = game.util.get_random(3.0,5.0);
        for (var i = sprites.length - 1; i >= 0; i--) {
            if(sprites[i].drawable == false) continue;

            magnitude = game.util.get_magnitude(
                        center,
                        {
                        x:sprites[i].x,
                        y:sprites[i].y
                        }
                        );


            if( magnitude<min && ally_target!=i){
                distance = game.util.get_distance(
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
            magnitude_with_enemy = game.util.get_magnitude(center, center_enemy);
            if (magnitude_with_enemy < min) {   // 0.2 is a workaround
                self.sprite_target.enemy = -2;                                       // For enemies
                distance_to_enemy = game.util.get_distance( center, center_enemy );
            }
        }

        normalized = game.util.normalize(distance_to_enemy);

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
