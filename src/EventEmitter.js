
    var EventEmitter = function(){
        var listeners = {},
            self = {};

        self.bind = function(type, listener){
            if (typeof listeners[type] == "undefined"){
                listeners[type] = [];
            }

            listeners[type].push(listener);
        }

        self.trigger = function(event){
            if (typeof event == "string"){
                event = { type: event };
            }
            if (!event.target){
                event.target = this;
            }

            if (!event.type){  //falsy
                throw new Error("Event object missing 'type' property.");
            }

            if (listeners[event.type] instanceof Array){
                var currentListeners = listeners[event.type];
                for (var i=0, len=currentListeners.length; i < len; i++){
                    currentListeners[i].call(this, event);
                }
            }
        }

        self.unbind = function(type, listener){
            if (listeners[type] instanceof Array){
                var currentListeners = listeners[type];
                for (var i=0, len=currentListeners.length; i < len; i++){
                    if (currentListeners[i] === listener){
                        currentListeners.splice(i, 1);
                        break;
                    }
                }
            }
        }

        return self;
    }
