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

        //var playerControls = new ns.ClockControls(model, $('#clockControls'), clockController);


        /*var audio = new Audio();
         audio.src = 'sound.mp3';
         audio.autoplay = false;
         audio.controls = false; //use default controls for demo
         audio.preload = 'metadata'; //auto, metadata, none
         window.document.body.appendChild(audio);
         audio.style.width = '1000px'; //only debug
         audio.play();

         var isFirstTimeCreateMediaSource = true;

         var context = new AudioContext();

         //audio.playbackRate

         //check if can play audio
         console.log(audio.canPlayType('audio/mp3'));



//Demo Click Handlers
        /*$('#btnPlay').on('click', function(e) {
         audio.play();
         e.preventDefault();
         });

         $('#btnPause').on('click', function(e) {
         audio.pause();
         e.preventDefault();
         });

         $('#btnVolumeUp').on('click', function(e) {
         audio.volume = Math.min(audio.volume + 0.1, 1);
         e.preventDefault();
         });

         $('#btnVolumeDown').on('click', function(e) {
         audio.volume = Math.max(audio.volume - 0.1, 0)
         e.preventDefault();
         });

         $('#btnChangeAudio').on('click', function(e) {
         e.preventDefault();
         if(audio.src.indexOf('sound2.mp3') != -1) {
         audio.src = 'sound.mp3';
         } else {
         audio.src = 'sound2.mp3';
         }
         });
         */
    })(player, window);


});