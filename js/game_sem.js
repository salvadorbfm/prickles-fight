var Game = (function() {

	var Game = [];
	var Sprite = function(config){
		config = config || {};
		var self = {};

		self.x = config.x || 0;
		self.y = config.y || 0;

		self.width = config.width || 20;
		self.height = config.height || 20;
		self.speedX = config.speedX || 1;
		self.speedY = config.speedY || 1;

		self.boost  = config.boost || 0;

		self.directionX = 1;
		self.directionY = 1;
		//Math.floor(self.speedY/Math.abs(self.speedY));

		self.RGB = config.RGB || [200,200,200];

		self.drawable = true;

		self.getCenterX = function(){
			return self.x + self.width/2;
		};

		self.getCenterY = function(){
			return self.y + self.height/2;
		};
	
		self.calculateDirection = function(val){
			if(val>600 || val <0){
				return -1;
			}else
			{
				return 1;
			}
		};

		self.invertDirection = function(directionArg){
			var direction = directionArg || '0';
			
			if(direction == 'x'){
				self.directionX = -1;
				self.speedX = self.speedX * self.directionX;
			}
			else if(direction == 'y'){
				self.directionY = -1;
				self.speedY = self.speedY * self.directionY;
			}
			else{
				self.directionX = -1;
				self.directionY = -1;
				self.speedX = self.speedX * self.directionX;
				self.speedY = self.speedY * self.directionY;
			}
		};

		self.updatePosition = function(){
			self.x = self.x + self.speedX + self.boost;
			self.y = self.y + self.speedY + self.boost;
			self.boost = 0;
		};

		self.updateSpeed = function(){
			self.directionX = self.calculateDirection(self.x);
			self.directionY = self.calculateDirection(self.y);
			self.speedX = self.speedX * self.directionX;
			self.speedY = self.speedY * self.directionY;
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

		debugger;
		self = Sprite(config);

		self.spriteTarget = config.spriteTarget || -1;
		self.search = function(happy, sprites){
			var center = {x:self.getCenterX(), y:self.getCenterY()};
			var min = 9999;
			var distance = 0;
			
			for (var i = sprites.length - 1; i >= 0; i--) {
				if(sprites.drawable == false) continue;

				distance = util.getDistance(
							center,
							{
								x:sprites[i].getCenterX(),
								y:sprites[i].getCenterY()
							}
							);

				if( distance<min ){
					min = distance;
					self.spriteTarget = i;
					self.directionX = sprites[i].directionX;
					self.directionY = sprites[i].directionY;
				}
			}
		};

		self.destroy = function(happy, sprites, phys){
			sprites = sprites || new Array();
			happy = happy || {};
			phys = phys || {};

			if(self.spriteTarget >= 0) {
				if( phys.checkCollision( self, sprites[self.spriteTarget]) ){
					sprites[self.spriteTarget].drawable = false;
				}
			}
		};

		self.updateSpeed = function(){
			if(self.calculateDirection(self.x) < 0)
				self.directionX = -1;

			if(self.calculateDirection(self.y) < 0)
				self.directionY = -1;

			self.speedX = self.speedX * self.directionX;
			self.speedY = self.speedY * self.directionY;
		};
		return self;
	};

	var Util = function()
	{
		var self = {};
		self.getFilledArray = function (len, val) {
			var filledArray = new Array(len);
			for(var i=0; i<len; i++) 
			{
			    filledArray[i] = val;
			}
			return filledArray;
		};

		self.getDistance = function(p1,p2){
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
		self.checkCollision = function(spriteA, spriteB){
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

			distance = util.getDistance(centerA,centerB);

			if (distance < (radA + radB)) 
			{
				return true;
			}else{
				return false;
			}
		};

		// Checking collision among all the balloons
		self.checkCollisions = function(sprites){
			sprites = sprites || new Array();
			var auxArray = util.getFilledArray(sprites.length, false);

			for(var i=0; i<sprites.length; i++){
				if(auxArray[i] == true) continue;
				if(sprites[i].drawable == false) continue;
				for(var j=0; j<sprites.length; j++){
					if(auxArray[j] == true || i==j )
						 continue;
					if(sprites[j].drawable == false) continue;
					
					//console.log("i:",i,"j:",j);
					if(self.checkCollision(sprites[i],sprites[j])){
						//console.log("Sprites have collided!");
						auxArray[i] = true;
						auxArray[j] = true;
						sprites[i].invertDirection();
						sprites[j].invertDirection();
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
		var tempSprite;
		RGB1[0] = 128;
		RGB1[1] = 250;
		RGB1[2] = 50;

		var happy = Sprite({
			x : Math.floor((Math.random()*100)+1),
			y : Math.floor((Math.random()*100)+1),
			width : 20,
			height : 20,
			speedX : Math.floor((Math.random()*5)+1),
			speedY : Math.floor((Math.random()*5)+1),
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
			speedX : Math.floor((Math.random()*10)+1),
			speedY : Math.floor((Math.random()*10)+1),
			RGB: RGB2
		});

		for(var i=0; i<10; i++){
			tempSprite = Sprite({
						x : Math.floor((Math.random()*300)+1),
						y : Math.floor((Math.random()*200)+1),
						width : 20,
						height : 20,
						speedX : Math.floor((Math.random()*5)+1),
						speedY : Math.floor((Math.random()*5)+1)
					});
			sprites.push( tempSprite );
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

			phys.checkCollisions(sprites);

			happy.updateSpeed();
			evil.search(happy, sprites);
			evil.destroy(happy, sprites, phys);
			evil.updateSpeed();
			
			happy.updatePosition();
			evil.updatePosition();



		    for(var i=0; i<10; i++){
		    	if(sprites[i].drawable == false) continue;
		    	sprites[i].updatePosition();
		    	sprites[i].updateSpeed();
			}
		};
	};

	return Game;
})(window);
