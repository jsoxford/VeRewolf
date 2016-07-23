(function(window) {
    'use strict';

    window.positionPlayers = function(players) {
        var radius = 200;
        var angle = 0;
        var step = (2 * Math.PI) / players.length;

        var width = 15 + players.length;
        var height = 15 + players.length;

        players.forEach(function(player) {
            var x = Math.round(width / 2 + radius * Math.cos(angle) - 1) / 100;
            var z = Math.round(height / 2 + radius * Math.sin(angle) - 1) / 100;

            var position = x + ' 0 ' + z;
            var camera = document.querySelector('#camera');

            player.setAttribute('position', position);
            player.setAttribute('look-at', '0 0 0');

            if (player.hasAttribute('data-current')) {
              camera.setAttribute('position', position)
              camera.setAttribute('look-at', '0 0 0');
            }


            angle += step;
        });
    };
    console.log('loaded');
    positionPlayers(document.querySelectorAll('[data-player]'));
}(window));
