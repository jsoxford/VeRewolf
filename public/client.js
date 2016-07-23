(function(window) {
    'use strict';

    window.positionPlayers = function(players) {
        var radius = 200;
        var angle = 0;
        var step = (2 * Math.PI) / players.length;

        var width = 10;
        var height = 10;

        players.forEach(function() {
            var x = Math.round(width / 2 + radius * Math.cos(angle) - 1 / 2);
            var y = Math.round(height / 2 + radius * Math.sin(angle) - 1 / 2);

            console.log(x, y);

            angle += step;
        });
    };
}(window));
