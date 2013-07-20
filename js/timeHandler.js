/* TimeHandler is a class that handles the safe_interval function.
       Work around for clearInterval:
            Since we have a "safe interval" we need a way to clear this safe interval,
            for this purpose, we need to call like:
                time_handler.safe_interval( myfunc, time, "myfunc")
            and clear the interval with:
                time_handler.running_functions["myfunc"] = false
                time_handler.running_functions["myfunc"] = false
*/
var game = game || {};
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
        //console.log("kill_all_intervals!!");
        for (var obj in self.running_functions){
            self.running_functions[obj] = false;
        }
    }
    self.kill_interval = function(_name) {
        self.running_functions[_name] = false;
    };
    return self;
};

game.time_handler = TimeHandler();