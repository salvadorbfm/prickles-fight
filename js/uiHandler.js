var game = game || {};
var UIHandler = function(config) {
    config = config || {};
    var self = {};
    var instructions_counter = 0;
    var timer = TimeHandler();
    self.init = function() {
        $('#game_start_button').mouseup(self.game_start_handler);
        $('#game_start_instructions').mouseup(self.game_instructions_handler);
        $('#game_start_button').mouseover(self.start_over).mouseout(self.start_out);
        $('#game_start_instructions').mouseover(self.start_over).mouseout(self.start_out);

        $('body').keypress(self.restart_handler);
        $('.game_layer').hide();
        $('#game_start_screen').show();
    };

    self.counter = 3;
    self.xTriggered = 0;

    self.restart_handler = function(event) {
        switch (event.which) {
            case 32:
                if ( game_state === state.happy_wins || game_state === state.evil_wins) {
                    restart_game();
                }
            break;
            case 13:
             event.preventDefault();
            break;
        }
    };
    self.start_out = function() {
        $(this).addClass("green-background");
        $(this).removeClass("brown-background");
    };


    self.start_over = function() {
        $(this).removeClass("green-background");
        $(this).addClass("brown-background");
    };


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
                game_state = state.playing;
                load_intervals();
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
        if (instructions_counter == 0)
            $('#game_instructions').show();
        else
            $('#game_instructions').hide();

        instructions_counter = (instructions_counter+1) % 2;
    };
    return self;
};

game.ui_handler = UIHandler();