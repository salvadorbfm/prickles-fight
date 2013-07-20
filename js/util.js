var game = game || {};
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

game.util = Util();