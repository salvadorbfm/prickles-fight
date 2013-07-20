window.game = window.game || {};
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
                //console.log("");
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

window.game.phys = Phys();