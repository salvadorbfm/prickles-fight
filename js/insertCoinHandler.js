// InsertCoinHandler
// This class will handle async calls
var InsertCoinHandler = function( config ) {
    var self = config || {};
    var data = {};
    var url = config.url || "";
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
        $.post( data.url, data.json_object )
          .done( done_handler )
          .fail( fail_handler );
    };

    self.load = function(){
        var dfd = $.getJSON( url );

        return dfd;
    };

    /*
        {
            "json_object":{},
            "url": <post url>
        }
    */
    var build_object = function( config ){
        url = url || "www.example.com";
        //data = JSON.stringify(config);
        var json_object = JSON.stringify( config.json_data )|| default_json;
        var post_url = config.url || default_url;

        return {json_object: json_object, url: post_url};

    };

    var done_handler = function(){
        console.log(" InsertCoinHandler Success!");
    };

    var fail_handler = function(){
        console.log(" InsertCoinHandler Fail! =(");
    };

    return self;
};