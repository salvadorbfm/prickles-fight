var Game = (function() {


    var Game = [];
    var Sprite = function(config){
        config = config || {};
        var self = {};

        self.x = config.x || 0;
        self.y = config.y || 0;

        self.width = config.width || 20;
        self.height = config.height || 20;
        self.speed_x = config.speed_x || 1.0;
        self.speed_y = config.speed_y || 1.0;

        self.boost  = config.boost || 0;

        self.direction_x = 1.0;
        self.direction_y = 1.0;
        //Math.floor(self.speed_y/Math.abs(self.speed_y));

        self.RGB = config.RGB || [200,200,200];

        self.drawable = true;

        self.get_center_x = function(){
            return self.x + self.width/2;
        };

        self.get_center_y = function(){
            return self.y + self.height/2;
        };

        self.calculate_direction = function(val){
            if(val>600 || val <0){
                return -1.0;
            }else{
                return 1.0;
            }
        };

        self.invert_direction = function(directionArg){
            var direction = directionArg || '0';

            if(direction == 'x'){
                self.direction_x = -1;
                self.speed_x = self.speed_x * self.direction_x;
            }
            else if(direction == 'y'){
                self.direction_y = -1;
                self.speed_y = self.speed_y * self.direction_y;
            }
            else{
                self.direction_x = -1;
                self.direction_y = -1;
                self.speed_x = self.speed_x * self.direction_x;
                self.speed_y = self.speed_y * self.direction_y;
            }
        };


        self.update_speed = function(){
            self.direction_x = self.calculate_direction(self.x);
            self.direction_y = self.calculate_direction(self.y);


            self.speed_x = self.speed_x * self.direction_x;
            self.speed_y = self.speed_y * self.direction_y;
        };

        self.check_boundary = function(){

        };
        self.update_position = function(){

            self.direction_x *= self.calculate_direction(self.x);
            self.direction_y *= self.calculate_direction(self.y);

            self.speed_x *= self.direction_x;
            self.speed_y *= self.direction_y;

            self.x += self.speed_x + self.boost;
            self.y += self.speed_y + self.boost;
            console.log("//"+self.x+":"+self.y);
            self.boost = 0;
        };

        return self;
    };

    var Happy = function(config){
        var self = {};

        self = Sprite(config);

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
            for (var i = sprites.length - 1; i >= 0; i--) {
                if(sprites.drawable == false) continue;

                distance = util.get_distance(
                            center,
                            {
                            x:sprites[i].x,
                            y:sprites[i].y
                            }
                            );

                magnitude = util.get_magnitude(distance);
                if( magnitude<min ){
                    min = magnitude;
                    self.sprite_target = i;
                    //console.log("Evil  search()... mag:"+magnitude+" min:"+min);
                    console.log(self.x+":"+self.y);
                    distance_to_enemy = distance;
                }
            }
            normalized = util.normalize(distance_to_enemy);
            self.direction_x = normalized.x;
            self.direction_y = normalized.y;
            self.update_position();
        };

        self.destroy = function(happy, sprites, phys){
            var sprites = sprites || new Array();
            var happy = happy || {};
            var phys = phys || {};

            if(self.sprite_target >= 0) {
                if( phys.check_collision( self, sprites[self.sprite_target]) ){
                    sprites[self.sprite_target].drawable = false;
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

        self.get_distance = function(p1,p2){
            //return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
            var distance = {};
            distance.x = p2.x - p1.x;
            distance.y = p2.y - p1.y;
            return distance;
        };

        self.get_magnitude = function(p){
            var magnitude =  Math.sqrt(p.x*p.x + p.y*p.y);

            if(magnitude < 0.00001)
                return 1;
            else
                return magnitude;
        };

        self.normalize = function(p){
            magnitude = self.get_magnitude(p);
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
            var distance = 0;

            radA = Math.floor(spriteA.width/2);
            radB = Math.floor(spriteB.width/2);
            centerA = {x:spriteA.get_center_x(), y:spriteA.get_center_y()};
            centerB = {x:spriteB.get_center_x(), y:spriteB.get_center_y()};

            distance = util.get_distance(centerA,centerB);

            if (distance < (radA + radB))
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

            for(var i=0; i<sprites.length; i++){
                if(auxArray[i] == true) continue;
                if(sprites[i].drawable == false) continue;
                for(var j=0; j<sprites.length; j++){
                    if(auxArray[j] == true || i==j )
                        continue;
                    if(sprites[j].drawable == false) continue;

                    //console.log("i:",i,"j:",j);
                    if(self.check_collision(sprites[i],sprites[j])){
                        //console.log("Sprites have collided!");
                        auxArray[i] = true;
                        auxArray[j] = true;
                        sprites[i].invert_direction();
                        sprites[j].invert_direction();
                        sprites[i].boost = 3;

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
            x : Math.floor((Math.random()*100)+1),
            y : Math.floor((Math.random()*100)+1),
            width : 20,
            height : 20,
            speed_x : Math.floor((Math.random()*5)+1),
            speed_y : Math.floor((Math.random()*5)+1),
            RGB: RGB1
        });

        RGB2[0] = 250;
        RGB2[1] = 100;
        RGB2[2] = 50;

        // antes Sprite()
        var evil = Evil({
            x : Math.floor((Math.random()*300)+1),
            y : Math.floor((Math.random()*200)+1),
            width : 20,
            height : 20,
            speed_x : Math.floor((Math.random()*10)+1),
            speed_y : Math.floor((Math.random()*10)+1),
            RGB: RGB2
        });

        for(var i=0; i<10; i++){
            temp_sprite = Sprite({
                        x : Math.floor((Math.random()*300)+1),
                        y : Math.floor((Math.random()*200)+1),
                        width : 20,
                        height : 20,
                        speed_x : Math.floor((Math.random()*5)+1),
                        speed_y : Math.floor((Math.random()*5)+1)
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
            processing.fill(evil.RGB[0], evil.RGB[1], evil.RGB[2]);
            //debugger;
            processing.ellipse(evil.x, evil.y, evil.width, evil.height);

            for(var i=0; i<10; i++){
                if(sprites[i].drawable == false) continue;
                processing.fill(sprites[i].RGB[0],sprites[i].RGB[1],sprites[i].RGB[2]);
                processing.ellipse(sprites[i].x,sprites[i].y,sprites[i].width,sprites[i].height);
            }

            phys.check_collisions(sprites);

            evil.search(happy, sprites);
            //debugger;
            //evil.update_position();
            //evil.destroy(happy, sprites, phys);

            happy.update_position();



            for(var i=0; i<10; i++){
                if(sprites[i].drawable == false) continue;
                sprites[i].update_position();
            }
        };
    };

    return Game;
})(window);

