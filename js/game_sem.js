var Game = (function() {


    var Game = [];
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

        self.direction_x = 1.0;
        self.direction_y = 1.0;
        //Math.floor(self.speed_y/Math.abs(self.speed_y));

        self.RGB = config.RGB || [200,200,200];

        self.drawable = true;

        self.is_collision = false;

        self.get_center_x = function(){
            return self.x + self.width/2.0;
        };

        self.get_center_y = function(){
            return self.y + self.height/2.0;
        };

        self.calculate_direction = function(val){
            if(val>585 || val <2){
                return -1.0;
            }else{
                return 1.0;
            }
        };

        self.invert_speed = function(directionArg){
            var direction = directionArg || '0';

            if(direction == 'x'){
                self.speed_x *= -1.0;
            }
            else if(direction == 'y'){
                self.speed_y *= -1.0;
            }
            else{
                self.speed_x *= -1.0;
            }
        };


        self.update_position = function(){

            self.speed_x *= self.calculate_direction(self.x);
            self.speed_y *= self.calculate_direction(self.y);

            self.x += self.speed_x;
            self.y += self.speed_y;

            if(self.is_collision == true)
            {
                self.is_collision = false;
            }
            //console.log("//"+self.x+":"+self.y);
        };

        return self;
    };

    var Happy = function(config){
        var self = {};

        self = Sprite(config);

        //self.image = loadImage("content/happy_left.png");

        //console.log(self.image);
        // User Input sprite

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
        self.search = function(happy, sprites){
            var center = {x:self.get_center_x(), y:self.get_center_y()};
            var min = 0;
            var distance = {};
            var magnitude = 0;
            var distance_to_enemy = {};
            var normalized = {};

            min = 99999.0;

            self.speed_x = 3.0;
            self.speed_y = 3.0;
            for (var i = sprites.length - 1; i >= 0; i--) {
                if(sprites[i].drawable == false) continue;

                debugger;
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

                if( magnitude<min ){
                    min = magnitude;
                    self.sprite_target = i;
                    distance_to_enemy = distance;
                }
            }
            normalized = util.normalize(distance_to_enemy);
            self.speed_x *= normalized.x;
            self.speed_y *= normalized.y;
            self.update_position();
        };

        self.destroy = function(happy, sprites, phys){
            var sprites = sprites || new Array();
            var happy = happy || {};
            var phys = phys || {};

            if(self.sprite_target >= 0) {
                if( phys.check_collision( self, sprites[self.sprite_target]) )
                {
                    sprites[self.sprite_target].drawable = false;
                    self.sprite_target = 0;
                    debugger;
                }
            }
        };

        return self;
    };

    var Util = function()
    {
        var self = {};
        self.get_filled_array = function (len, val) {
            var filledArray = new Array(len);
            for(var i=0; i<len; i++)
            {
                filledArray[i] = val;
            }
            return filledArray;
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
            return {
                x: p.x/magnitude,
                y: p.y/magnitude
            }
        }
        return self;
    };
    var Phys = function(config){
        config = config || {};

        var self = {};
        var util = Util();

        // Checking collision between two sprites
        self.check_collision = function(spriteA, spriteB){
            var spriteA = spriteA || {};  // Here, I should check the error of having a "null" sprite
            var spriteB = spriteB || {};
            var radA = 0;
            var radB = 0;
            var centerA = {};
            var centerB = {};
            var magnitude = 0;

            radA = (spriteA.width/2.0);
            radB = (spriteB.width/2.0);
            centerA = {x:spriteA.get_center_x(), y:spriteA.get_center_y()};
            centerB = {x:spriteB.get_center_x(), y:spriteB.get_center_y()};

            magnitude = util.get_magnitude(centerA,centerB);
            //return false;

            //debugger;
            if ((magnitude) < (radA + radB))
            {
                return true;
            }else{
                return false;
            }
        };

        // Checking collision among all the balloons
        self.check_collisions = function(sprites){
            sprites = sprites || new Array();
            var auxArray = util.get_filled_array(sprites.length, false);

            //console.log("SEM check_collisions");
            for(var i=0; i<sprites.length; i++){
                if(auxArray[i] == true) continue;
                if(sprites[i].drawable == false) continue;
                for(var j=0; j<sprites.length; j++){
                    if(auxArray[j] == true || i==j )
                        continue;
                    if(sprites[j].drawable == false) continue;

                    if(self.check_collision(sprites[i],sprites[j])){
                        auxArray[i] = true;
                        auxArray[j] = true;
                        sprites[i].invert_speed();
                        sprites[j].invert_speed();
                        sprites[j].is_collision = true;
                    }else{
                        //console.log("Not collision yet");
                    }

                }
            }
        };

        return self;
    };

    Game.sketch = function(processing){
        processing.noFill();
        var RGB1 = new Array();
        var RGB2 = new Array();
        var sprites = new Array();
        var phys = Phys();
        var temp_sprite;
        RGB1[0] = 128;
        RGB1[1] = 250;
        RGB1[2] = 50;

        var happy = Sprite({
            x : (Math.random()*100),
            y : (Math.random()*100),
            width : 20.0,
            height : 20.0,
            speed_x : (Math.random()*5),
            speed_y : (Math.random()*5),
            RGB: RGB1
        });

        RGB2[0] = 250;
        RGB2[1] = 100;
        RGB2[2] = 50;

        // antes Sprite()
        var evil = Evil({
            x : (Math.random()*300),
            y : (Math.random()*200),
            width : 20.0,
            height : 20.0,
            speed_x : (Math.random()*10),
            speed_y : (Math.random()*10),
            RGB: RGB2
        });
        //console.log(self.x+":"+self.y);

        for(var i=0; i<20; i++){
            temp_sprite = Sprite({
                        x : (Math.random()*300),
                        y : (Math.random()*200),
                        width : 20.0,
                        height : 20.0,
                        speed_x : (Math.random()*5)+1.0,
                        speed_y : (Math.random()*5)+1.0
            });
            sprites.push( temp_sprite );
        }
        // Processing Stuff
        processing.noStroke();
        processing.fill(255, 0, 0);

        processing.size(600,600);

        processing.draw = function(){
            processing.background(0, 0, 0);

            processing.fill(happy.RGB[0], happy.RGB[1], happy.RGB[2]);
            processing.ellipse(happy.x, happy.y, happy.width, happy.height);
            //image(happy.image, happy.x, happy.y);
            processing.fill(evil.RGB[0], evil.RGB[1], evil.RGB[2]);
            //debugger;
            processing.ellipse(evil.x, evil.y, evil.width, evil.height);

            for(var i=0; i<sprites.length; i++){
                if(sprites[i].drawable == false) continue;
                processing.fill(sprites[i].RGB[0],sprites[i].RGB[1],sprites[i].RGB[2]);
                processing.ellipse(sprites[i].x,sprites[i].y,sprites[i].width,sprites[i].height);
            }

            phys.check_collisions(sprites);

            //TODO Better logic
            evil.search(happy, sprites);
            evil.destroy(happy, sprites, phys);

            happy.update_position();

            for(var i=0; i<sprites.length; i++){
                if(sprites[i].drawable == false) continue;
                sprites[i].update_position();
            }
        };
    };

    return Game;
})(window);

