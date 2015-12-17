/**
 * Created by alejandrojovermorales on 16/03/15.
 */

var player = window.player || {};


(function (ns, window) {
    "use strict";

    var PlayerController = function(model){
        this._model = model;

    };


    PlayerController.prototype = {
        loadSongsData: function(url)
        {
            var that = this;

            $.get(url, function (playlist) {
                that._model.loadPlaylist(playlist);
                that._model.init();
            });
        }
    }


    ns.PlayerController = PlayerController;

})(player, window);