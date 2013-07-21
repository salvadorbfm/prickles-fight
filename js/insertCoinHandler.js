// InsertCoinHandler
// This class will handle async calls
var InsertCoinHandler = function( config ) {
    var self = config || {};
    var data = {};
    var default_json = "{status: 'Could not found the json file'}";

    self.save = function(config){
        data = build_object(config);
        /*
            {
                "gamestate":{
                    "user_id" : 1,
                    "game_id" : 1,
                    "platform_id" : 5,
                    "data" : "<object>"
                }
            }
        */
        $.ajax({
            url: data.url,
            type: "POST",
            crossDomain: true,
            data: data.gamestate,
            dataType: "json",
            success: done_handler,
            error: fail_handler
        });
    };

    self.load = function( get_url ){
        // TODO Should return a dfd that will be handled outside
        $.getJSON( get_url )
        .done( function(data){
            console.log("GET Success");
            console.log(data);
        })
        .fail( function(data){
            console.log("GET Fail");
            console.log(data);
        });

    };

    /*
        {
            "json_object":{},
            "url": <post url>
        }
    */
    var build_object = function( config ){
        //data = JSON.stringify(config);
        debugger;
        var json_object = config.gamestate || default_json;
        var post_url = config.url || default_url;

        return {gamestate: json_object, url: post_url};

    };

    var done_handler = function(data){
        console.log(" InsertCoinHandler Success!");
        console.log("data: ");
        console.log(data);
    };

    var fail_handler = function(data){
        console.log(" InsertCoinHandler Fail! =(");
        console.log("data: ");
        console.log(data);
    };

    return self;
};