window.game = window.game || {};
var UIHandler = function(config) {
    config = config || {};
    var self = {};
    var instructions_counter = 0;
    var timer = TimeHandler();
    // callbacks
    var load_game = config.load_game;
    var animate = config.animate;
    var load_intervals = config.load_intervals;
    var restart_game = config.restart_game;
    var state = config.state;

    self.init = function() {
        $('#game_start_button').mouseup(self.game_start_handler);
        $('#game_start_instructions').mouseup(self.game_instructions_handler);

        $('.game_layer').hide();
        $('#game_start_screen').show();
    };

    self.counter = 3;
    self.xTriggered = 0;


    self.game_start_handler = function() {
        $('.game_layer').hide();
        $("#game_counter_screen").show();

        $("#happy_img").hide();
        $("#happy_img").slideDown("slow", function(){
            $("#game_counter div").hide();
            self.print_loading();
            $("#game_counter div").fadeIn();

        });
        load_game();

        timer.safe_interval(function(){
            if (game.resources > 52) {
                $(".game_layer").hide();
                $('#game_canvas').show();
                $('#game_score').show();
                load_intervals();
                animate();
                timer.kill_interval("game_start_handler");
            }
        }, 1000, "game_start_handler");


    };

    self.print_loading = function() {
        var view = {
            instructions: "You are playing as happy, just click on the screen in order to move and collide with the balloons."
        };
        var output = "<br/><br/><div>{{instructions}}</div>";
        var html = Mustache.to_html(output, view);
        $('#game_counter').append(html);
    };
    self.game_instructions_handler = function() {
        var view = {
            content: "The main task is to get the maximum of the balloons. Just click at the point you desire to go and Happy Prickle will do his best. You can keep the mouse down in order to go to the desired direction."
        };
        var output = "<p>{{content}}</p>";

        var html = Mustache.to_html(output, view);
        $('#game_useful_info').html(html);

        $('#game_useful_info').toggleClass("hidden");
    };
    return self;
};