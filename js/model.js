
function format(time){
    var min = Math.round(time / 60);
    var sec = Math.round(time % 60);

    if(min < 10) min = '0' + min;
    if(sec < 10) sec = '0' + sec;

    return min + ':' + sec;
}

var player = window.player || {};


(function (ns, window) {
    "use strict";

    var PlayerModel = function(){
        this._audio = new Audio();
        this._audioPlaylist = [];
        this._oldAudioPlaylist = [];
        this._currentSongMetadata = {};

        this._currentSong = localStorage['currentSong'] || 0;
        this._isPlaying = false;
        this._isShuffleActive = false;

        if(localStorage['isShuffleActive'])
            this._isShuffleActive = JSON.parse(localStorage['isShuffleActive']);

        this._audio.volume = localStorage['volume'] || 1;
        this._audio.autoplay = false;
        this._audio.controls = false;
        this._audio.preload = 'metadata';

        window.document.body.appendChild(this._audio);


        // Audio API for spectrum visualizer
        this._context = new AudioContext();
        this._analyser = this._context.createAnalyser();
        this._source = this._context.createMediaElementSource(this._audio);

        this._source.connect(this._analyser);
        this._analyser.connect(this._context.destination);





        this._audio.addEventListener('loadstart', function(e) {
            $(this).trigger('loadStart');
        }.bind(this));

        this._audio.addEventListener('loadedmetadata', function(e) {
            $(this).trigger('loadedData');
        }.bind(this));

        //loadeddata: now we can set currenttime = playhead position
        this._audio.addEventListener('loadeddata', function(e) {

            //audio.currentTime = 200;
        }.bind(this));

        this._audio.addEventListener('durationchange', function(e) {
            $(this).trigger('trackChanged');
        }.bind(this));

        this._audio.addEventListener('volumechange', function(e) {
            console.log('volumechange: ' + this._audio.volume);
        }.bind(this));

        this._audio.addEventListener('timeupdate', function(e) {
            $(this).trigger('timeUpdate', {value: this._audio.currentTime, text: format(this._audio.currentTime)})
        }.bind(this));

        this._audio.addEventListener('ended', function(e) {
            this.next();
        }.bind(this));

        this._audio.addEventListener('progress', function(e) {
         if(this._audio.buffered.length > 0) {

             var percentage = this._audio.buffered.end(0) * 100 / this._audio.duration;

             console.log('progress, buffer end: ' +
             this._audio.buffered.end(this._audio.buffered.length-1) +
             ", length: " + this._audio.buffered.length);
             console.log('percentage' + percentage)

             $(this).trigger('loading', percentage);
         } else {
             console.log('no progress');
         }
        }.bind(this));

        this._audio.addEventListener('play', function(e) {
            $(this).trigger('play');
            this._isPlaying = true;
        }.bind(this));

        this._audio.addEventListener('pause', function(e) {
            console.log('pause')
            $(this).trigger('pause');
            this._isPlaying = false;
        }.bind(this));

        this._audio.addEventListener('canplay', function(e) {
            console.log('canplay'); //initial: audio now can be played
        }.bind(this));

        this._audio.addEventListener('canplaythrough', function(e) {
            console.log('canplaythrough'); //now audio can play fully through

            //$(this).trigger('canPlayThrough', {value: this._audio.currentTime, text: format(this._audio.currentTime)})

            //some more info
           /* if(this._isFirstTimeCreateMediaSource) {
                this._isFirstTimeCreateMediaSource = false;
                source = context.createMediaElementSource(audio);
                //example of gain node, we could also use filter to e.g. emphasize some frequence spectrum
                gainNode = context.createGain();
                source.connect(gainNode);
                gainNode.connect(context.destination);

                gainNode.gain.value = 0.1;
            }


            var analyser = context.createAnalyser();
            source.connect(analyser);
            analyser.connect(context.destination);

            window.setInterval(function(){
                array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                console.log(array);
            }, 1000);*/
        }.bind(this));
    };

    PlayerModel.prototype = {

        init: function(){
            this._audio.src = this._audioPlaylist[this._currentSong].url;
        },
        play: function(){
            this._audio.play();
        },
        pause: function(){
            this._audio.pause();
        },
        stop: function(){
            this._audio.pause();
            this._audio.currentTime = 0;
        },
        next: function(){
            this.playSongAt((this._currentSong + 1) % this._audioPlaylist.length);
        },
        previous: function(){
            this.playSongAt((this._currentSong + this._audioPlaylist.length - 1) % this._audioPlaylist.length);
        },
        togglePause: function(){
            if (this._isPlaying)
                this._audio.pause();
            else
                this._audio.play();
        },
        playSongAt: function(pos){
            this._currentSong = pos;
            this._audio.src = this._audioPlaylist[pos].url;
            this._audio.play();
            window.localStorage['currentSong'] = pos;
            $(this).trigger('playSontAt');
        },

        getAnalyser: function(){
            return this._analyser;
        },

        getDuration: function(){
            return this._audio.duration;
        },
        getVolume: function(){
            return this._audio.volume;
        },
        getPlaylist: function(){
            return this._audioPlaylist;
        },
        getCurrentSong: function(){
            return this._currentSong;
        },
        isShuffleActive: function(){
            return this._isShuffleActive;
        },
        isPlaying: function(){
            return this._isPlaying;
        },

        setVolume: function(value){
            this._audio.volume = Math.max(Math.min(value, 1), 0); //Ensure is between 0 and 1;
            localStorage['volume'] = this._audio.volume;
        },
        setTime: function(value){
            this._audio.currentTime = value;
        },

        loadCurrentSongMetadata: function(){
            console.log('loadedData')
            var that = this;

            ID3.loadTags(this._audioPlaylist[that._currentSong].url, function() {
                var tags = ID3.getAllTags(that._audioPlaylist[that._currentSong].url);

                that._currentSongMetadata = {
                    title: tags.title,
                    artist: tags.artist,
                    album: tags.album,
                    genre: tags.genre,
                    year: tags.year
                }
                $(that).trigger('metadataChanged');
            });
        },

        getCurrentSongMetadata: function(){
            return this._currentSongMetadata;
        },





        // Playlist functions
        addToPlaylist: function(song){
            this._audioPlaylist.push(song);
        },
        loadPlaylist: function(songArray){
            this._audioPlaylist = songArray.tracks;
            for(var i = 0; i < this._audioPlaylist.length; i++)
                this._audioPlaylist[i].id = i;

            $(this).trigger('playlistChange');
        },

        orderBy: function(key){
            this._audioPlaylist = _.sortBy(this._audioPlaylist, 'id');
            $(this).trigger('playlistChange');
        },

        shuffle: function(){

            var currId = this._audioPlaylist[this._currentSong].id;

            // Suffle or return to the previous order
            if(!this._isShuffleActive){
                this._oldAudioPlaylist = this._audioPlaylist.slice();
                this._audioPlaylist = _.shuffle(this._audioPlaylist);
                this._isShuffleActive = true;
            }
            else{
                if(this._oldAudioPlaylist && this._oldAudioPlaylist.length)
                    this._audioPlaylist = this._oldAudioPlaylist.slice();

                this._isShuffleActive = false;
            }

            localStorage['isShuffleActive'] = this._isShuffleActive;

            this._currentSong = _.findIndex(this._audioPlaylist, function(obj){ return  obj.id == currId});
            $(this).trigger('playlistChange', this._isShuffleActive);
        },
        changeSongPosition: function(posFrom, posTo){
            var oldCurrentId = this._audioPlaylist[this._currentSong].id;
            var songAux = this._audioPlaylist.splice(posFrom, 1)[0];
            this._audioPlaylist.splice(posTo, 0, songAux);
            this._currentSong = _.findIndex(this._audioPlaylist, function(obj){ return  obj.id == oldCurrentId});
            this._isShuffleActive = false;
            $(this).trigger('playlistChange');
        },
        removeSong: function(pos){
            console.log(pos + ' - ' + this._currentSong);
            if(pos == this._currentSong)
                this.next();
            if(pos <= this._currentSong && this._currentSong > 0)
                this._currentSong--;

            this._audioPlaylist.splice(pos, 1);
            $(this).trigger('playlistChange');
        }

    };

    ns.PlayerModel = PlayerModel; //Add the model to the clock namespace

})(player, window);