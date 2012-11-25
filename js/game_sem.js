var Game = (function() {


    var Game = [];
    var Sprite = function(config){
        config = config || {};
        var self = {};

        self.x = config.x || 0;
        self.y = config.y || 0;

        self.width = config.width || 20;
        self.height = config.height || 20;
        self.speed_x = config.speed_x || 1;
        self.speed_y = config.speed_y || 1;

        self.boost  = config.boost || 0;

        self.direction_x = 1;
        self.direction_y = 1;
        //Math.floor(self.speed_y/Math.abs(self.speed_y));

        self.RGB = config.RGB || [200,200,200];

        self.drawable = true;

        self.getCenterX = function(){
            return self.x + self.width/2;
        };

        self.getCenterY = function(){
            return self.y + self.height/2;
        };

        self.calculate_direction = function(val){
            if(val>600 || val <0){
                return -1;
            }else{
                return 1;
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

        self.update_position = function(){
            self.x = self.x + self.speed_x + self.boost;
            self.y = self.y + self.speed_y + self.boost;
            self.boost = 0;
        };

        self.update_speed = function(){
            self.direction_x = self.calculate_direction(self.x);
            self.direction_y = self.calculate_direction(self.y);
            self.speed_x = self.speed_x * self.direction_x;
            self.speed_y = self.speed_y * self.direction_y;
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
            var center = {x:self.getCenterX(), y:self.getCenterY()};
            var min = 0;
            var distance = 0;

            min = sprites[sprites.length - 1];
            for (var i = sprites.length - 1; i >= 0; i--) {
                if(sprites.drawable == false) continue;

                distance = util.get_distance(
                            center,
                            {
                            x:sprites[i].getCenterX(),
                            y:sprites[i].getCenterY()
                            }
                            );

                if( distance<min ){
                    min = distance;
                    self.sprite_target = i;
                    self.direction_x = sprites[i].direction_x;
                    self.direction_y = sprites[i].direction_y;
                }
            }
        };

        self.destroy = function(happy, sprites, phys){
            sprites = sprites || new Array();
            happy = happy || {};
            phys = phys || {};

            if(self.sprite_target >= 0) {
                if( phys.check_collision( self, sprites[self.sprite_target]) ){
                    sprites[self.sprite_target].drawable = false;
                }
            }
        };

        self.update_speed = function(){
            if(self.calculate_direction(self.x) < 0)
                self.direction_x = -1;

            if(self.calculate_direction(self.y) < 0)
                self.direction_y = -1;

            self.speed_x = self.speed_x * self.direction_x;
            self.speed_y = self.speed_y * self.direction_y;
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
            return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
        };
        return self;
    };
    var Phys = function(config){
        // Colisiones entre N Objetos circulares
        config = config || {};

        var self = {};
        var util = Util();

        // Checking collision between two sprites
        self.check_collision = function(spriteA, spriteB){
            spriteA = spriteA || {};  // Here, I should check the error of having a "null" sprite
            spriteB = spriteB || {};
            var radA = 0;
            var radB = 0;
            var centerA = {};
            var centerB = {};
            var distance = 0;

            radA = Math.floor(spriteA.width/2);
            radB = Math.floor(spriteB.width/2);
            centerA = {x:spriteA.getCenterX(), y:spriteA.getCenterY()};
            centerB = {x:spriteB.getCenterX(), y:spriteB.getCenterY()};

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
            processing.ellipse(evil.x, evil.y, evil.width, evil.height);

            for(var i=0; i<10; i++){
                if(sprites[i].drawable == false) continue;
                processing.fill(sprites[i].RGB[0],sprites[i].RGB[1],sprites[i].RGB[2]);
                processing.ellipse(sprites[i].x,sprites[i].y,sprites[i].width,sprites[i].height);
            }

            phys.check_collisions(sprites);

            happy.update_speed();
            evil.search(happy, sprites);
            evil.destroy(happy, sprites, phys);
            evil.update_speed();

            happy.update_position();
            evil.update_position();



            for(var i=0; i<10; i++){
                if(sprites[i].drawable == false) continue;
                sprites[i].update_position();
                sprites[i].update_speed();
            }
        };
    };

    return Game;
})(window);

