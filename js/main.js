$(function () {
//
// Audio Element Quick Demo
// Todo: include sound.mp3 and sound2.mp3 in root direcotry
//
// to test streaming e.g. use node http-server
//
//------------
// Docu Audio Element: 
// http://www.w3.org/wiki/HTML/Elements/audio
// http://www.whatwg.org/specs/web-apps/current-work/#the-audio-element
//
// Docu Web Audio API:
// http://webaudio.github.io/web-audio-api/
//
    var player = window.player || {};


    (function (ns, window) {

        // Init slider

        $('.slider').each(function () {

            var $slider = $(this);

            $.fn.slider.DEFAULT_CONFIG = {
                isAutoClosing: true,
                min          : $slider.data('min'),
                max          : $slider.data('max'),
                value        : parseFloat($slider.attr('data-value'))
            };

            var slider = $(this).slider({
                view : $slider,
                label: $slider.prev()
            });
        });


        var playerModel = new ns.PlayerModel();
        var playerController = new ns.PlayerController(playerModel);


        var playerView = new ns.PlayerView(playerModel, $('#playerView'), playerController);
        var playlistView = new ns.PlaylistView(playerModel, $('#playlistView'), $('#playlist-template'));
        var detailView = new ns.DetailView(playerModel, $('#detailView'), $('#detail-template'));
        var spectrumView = new ns.SpectrumView(playerModel, $('#spectrumView'));

        playerController.loadSongsData('data/_tracklist.json');


    })(player, window);


});