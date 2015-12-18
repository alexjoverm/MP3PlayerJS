/**
* Created by alejandrojovermorales on 16/03/15.
*/

var player = window.player || {};

(function(ns, window){
"use strict";


// Parent view

var AbstractView = function(model, $element){

    this.model = model;
    this.$element = $element;

};


var PlayerView = function(model, $element, controller){
    AbstractView.apply(this, arguments); // Call parent Constructor with .apply(this,arguments);

    this.canUpdateTimes = true;

    // Set initial state
    $element.find('.volume-slider').data('interface').setValue(this.model.getVolume());
    $element.find('.timeline .track').append('<div class="progress"></div>');

    this.progressBar = $element.find('.timeline .progress');

    // Set events
    $element.find('#btnPlay').on('click', this.model.togglePause.bind(model));
    $element.find('#btnStop').on('click', this.model.stop.bind(model));
    $element.find('#btnNext').on('click', this.model.next.bind(model));
    $element.find('#btnPrev').on('click', this.model.previous.bind(model));
    $element.find('#btnShuffle').on('click', this.model.shuffle.bind(model));

    $element.find('.timeline').on('timelineMousedown', this.timelineMousedownHandler.bind(this));
    $element.find('.timeline').on('timelineMouseup', this.timelineMouseupHandler.bind(this));

    $element.find('.volume-slider').on('change', this.changeVolume.bind(this));

    $(model).on('timeUpdate', this.renderTimes.bind(this));
    $(model).on('play', this.changeButtonPlay.bind(this, true));
    $(model).on('pause', this.changeButtonPlay.bind(this, false));
    $(model).on('playlistChange', this.changeButtonShuffle.bind(this));
    $(model).on('trackChanged', this.handleTrackChange.bind(this));

    $(model).on('loadStart', this.resetProgressBar.bind(this));
    $(model).on('loading', this.setProgressBar.bind(this));
};

// Clone the prototype and change the constructor
PlayerView.prototype = Object.create(AbstractView.prototype);
PlayerView.prototype.constructor = PlayerView;


//***** Timeline handlers
// Disable views time updating
PlayerView.prototype.timelineMousedownHandler = function(){
    this.canUpdateTimes = false;
};

PlayerView.prototype.resetProgressBar = function(){
    this.progressBar.css('width', 0 + '%');
};

PlayerView.prototype.setProgressBar = function(e, percentage){
    this.progressBar.css('width', percentage + '%');
};

PlayerView.prototype.handleTrackChange = function(){
    $(this.model).trigger('timeUpdate', {value: 0, text: '00:00'})
};

// Re-enable views time updating, set and update times
PlayerView.prototype.timelineMouseupHandler = function(){
    this.canUpdateTimes = true;
    var time = this.model.getDuration() * this.$element.find('.timeline').data('interface').getValue();
    this.model.setTime(time);
    this.renderTimes(null, { value: time, text: format(time) });
};

//***** Renders
PlayerView.prototype.changeVolume = function(){
    this.model.setVolume(this.$element.find('.volume-slider').data('interface').getValue());
};

PlayerView.prototype.renderTimes = function(e, currentTime){
    if(this.canUpdateTimes) {
        this.$element.find('.timeline').data('interface').setValue(currentTime.value / this.model.getDuration());
        this.$element.find('.current-time').html(currentTime.text);
        this.$element.find('.total-time').html(format(this.model.getDuration()));
    }
};

PlayerView.prototype.changeButtonPlay = function(play){
    if(play)
        this.$element.find('#btnPlay').html('<i class="icon-pause"></i>Pause');
    else
        this.$element.find('#btnPlay').html('<i class="icon-play"></i>Play');
};

PlayerView.prototype.changeButtonShuffle = function() {
    if (this.model.isShuffleActive() == true)
        $('#btnShuffle').addClass('active');
    else
        $('#btnShuffle').removeClass('active');
};








var PlaylistView = function(model, $element, $template){
    AbstractView.apply(this, arguments); // Call parent Constructor with .apply(this,arguments);
    this.source = $template.html();
    this.template = Handlebars.compile(this.source);


    // Draggable elements
    this.dropIndex = 0;
    this.dragging, this.placeholders = $();


    // Events
    $(model).on('playlistChange', this.render.bind(this));
    $(model).on('trackChanged', this.changeTrackActive.bind(this));

    var that = this;
    this.$element.on('dblclick','li', function(){   that.selectSong($(this).index()); });

};

// Clone the prototype and change the constructor
PlaylistView.prototype = Object.create(AbstractView.prototype);
PlaylistView.prototype.constructor = PlaylistView;

PlaylistView.prototype.render = function(e, isShuffleActive){
    var data = this.model.getPlaylist();
    var compiled_data = this.template(data);
    this.$element.html(compiled_data);

    this.setDraggableItems();
    this.setDroppableFile();
    this.changeTrackActive();
};

PlaylistView.prototype.selectSong = function(index){
    this.model.playSongAt(index);
};

PlaylistView.prototype.changeTrackActive = function(){
    this.$element.find('li').removeClass('active').eq(this.model.getCurrentSong()).addClass('active');
};


// ** Drag 'n Drop

PlaylistView.prototype.setDroppableFile = function(){
    var loadContainer = this.$element.find('#drop-load');

    loadContainer.on('dragenter.h5s',function(e){
        loadContainer.addClass('enabled hovered');
        e.preventDefault();
    }).on('dragover.h5s', function(e){
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
    }).on('dragleave.h5s',function(e){
        loadContainer.removeClass('enabled hovered');
    }).on('drop.h5s',function(e){
        e.preventDefault();
        e.stopPropagation();
        loadContainer.removeClass('enabled hovered');

        var file = e.originalEvent.dataTransfer.files[0];
        var fr = new FileReader();

        fr.onload = function(e){
            console.log(e.target.result)
        };

        fr.readAsDataURL(file);
    });

};

PlaylistView.prototype.setDraggableItems = function(){

    var draggableSelector = '#playlist-ul';
    var draggableContainer = this.$element.find(draggableSelector);
    var deleteContainer = this.$element.find('#drop-delete');


    var listItems = this.$element.find('li');
    var placeholder = $('<li class="placeholder">');
    this.placeholders = this.placeholders.add(placeholder);

    var self = this;
    var toDelete = false;


    // *** Dragstart: save index and set sortable datatransfer

    listItems.attr('draggable', 'true').on('dragstart.h5s', function(e) {
        var dt = e.originalEvent.dataTransfer;
        dt.effectAllowed = 'move';
        dt.setData('Text', 'dummy');
        self.dragIndex = (self.dragging = $(this)).addClass('dragging').index();
        deleteContainer.addClass('enabled');
        toDelete = false;



    // *** Dragend: Remove elements and change positions

    }).on('dragend.h5s', function(e) {
        if (!self.dragging)
            return;

        // Remove classes and placeholders
        self.dragging.removeClass('dragging').show();
        self.placeholders.detach();

        // If timer is not null, it's outside
        if(toDelete){
            self.model.removeSong(self.dragIndex);
            return false;
        }

        // Change model songs order
        if (self.dragIndex != self.dragging.index())
            self.model.changeSongPosition(self.dragIndex, self.dragging.index());

        deleteContainer.removeClass('enabled');
        self.dragging = null;


    // *** Selectstart: We want to prevent the text elements from being selected

    }).not('a[href], img').on('selectstart.h5s', function() {
        this.dragDrop && this.dragDrop();
        return false;



    // *** Dragenter && Dragover: to the container and placeholder, set placeholders and so on

    }).end().add([draggableContainer[0], placeholder[0]]).on('dragover.h5s dragenter.h5s drop.h5s', function(e) {

        // If dragging is not one of the element, exit without preventingDefault
        if (!listItems.is(self.dragging)){
            return true;
        }

        toDelete = false;

        // When drop, remove placeholder, call dragend and stop execution
        if(e.type == 'drop'){
            e.stopPropagation();
            self.placeholders.filter(':visible').after(self.dragging);
            self.dragging.trigger('dragend.h5s');
            return false;
        }

        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'move';

        // Set placeholder and hide the original view
        if (listItems.is(this)) {
            placeholder.height(self.dragging.outerHeight());
            self.dragging.hide();
            $(this)[placeholder.index() < $(this).index() ? 'after' : 'before'](placeholder);
            self.placeholders.not(placeholder).detach();

        } else if (!self.placeholders.is(this)) {
            self.placeholders.detach();
            $(this).append(placeholder);
        }

        return false;
    });

    deleteContainer.on('dragenter.h5s', function(e){
        if (!listItems.is(self.dragging)){
            return true;
        }
        deleteContainer.addClass('hovered');
        self.placeholders.detach();
        toDelete = true;
    }).on('dragleave.h5s', function(e){
        if (!listItems.is(self.dragging)){
            return true;
        }
        deleteContainer.removeClass('hovered');
    });

    placeholder.on('dragleave.h5s', function(e){
        self.placeholders.detach();
        return false;
    });

};







var DetailView = function(model, $element, $template){
    AbstractView.apply(this, arguments); // Call parent Constructor with .apply(this,arguments);
    this.source = $template.html();
    this.template = Handlebars.compile(this.source);

    $(model).on('loadedData', model.loadCurrentSongMetadata.bind(model));
    $(model).on('metadataChanged', this.render.bind(this));
};

// Clone the prototype and change the constructor
DetailView.prototype = Object.create(AbstractView.prototype);
DetailView.prototype.constructor = DetailView;

DetailView.prototype.render = function(){
    var data = this.model.getCurrentSongMetadata();
    var compiled_data = this.template(data);
    this.$element.html(compiled_data);
};







var SpectrumView = function(model, $element){
    AbstractView.apply(this, arguments); // Call parent Constructor with .apply(this,arguments);

    this.animationId = null;

    this.canvas = $('#canvas')[0];
    this.cWidth = this.canvas.width;
    this.cHeight = this.canvas.height - 2;
    this.meterWidth = 10; //width of the meters in the spectrum
    this.gap = 2, //gap between meters
    this.capHeight = 2;
    this.capColor = '#444';
    this.meterNum = this.cWidth / (this.meterWidth + this.gap); //count of the meters

    this.capPreviousYPosition = []; //store "y position" of the caps of the previous frame

    this.canvasContext = canvas.getContext('2d')
    this.gradient = this.canvasContext.createLinearGradient(0, 0, 0, this.cHeight);
    this.gradient.addColorStop(1, '#fd0');
    this.gradient.addColorStop(0, '#f00');

    this.analyser = this.model.getAnalyser();

    $(model).on('play', this.render.bind(this));
    $(model).on('pause', this.pause.bind(this));
    $(model).on('trackChanged', this.pause.bind(this));
    $(model).on('playSongAt', function(){
        cancelAnimationFrame(this.animationId);
    }.bind(this));
};

// Clone the prototype and change the constructor
SpectrumView.prototype = Object.create(AbstractView.prototype);
SpectrumView.prototype.constructor = SpectrumView;

SpectrumView.prototype.render = function(){
    this.animationId = requestAnimationFrame(this.drawMeter.bind(this));
};

SpectrumView.prototype.pause = function(){
    console.log('clear')
    cancelAnimationFrame(this.animationId);
    this.canvasContext.clearRect(0, 0, this.cWidth, this.cHeight + this.capHeight);
    this.render();
};

SpectrumView.prototype.drawMeter = function(){
    var frecArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frecArray);

    if (!this.model.isPlaying()) {
        // assure that the value of a Paused song is 0
        for (var i = 0; i < frecArray.length; i++)
            frecArray[i] = 0;


        cancelAnimationFrame(this.animationId); //cancel animation
        return;

    }

    var step = Math.round(frecArray.length * 0.85 / this.meterNum); // make a sample of the full frequency array
    this.canvasContext.clearRect(0, 0, this.cWidth, this.cHeight);

    for (var i = 0; i < this.meterNum; i++) {
        var value = frecArray[i * step] * this.cHeight / 256;

        if (this.capPreviousYPosition.length < Math.round(this.meterNum)) {
            this.capPreviousYPosition.push(value);
        }
        this.canvasContext.fillStyle = this.capColor;

        //draw the cap, with transition effect
        if (value < this.capPreviousYPosition[i]) {
            this.canvasContext.fillRect(i * (this.meterWidth + this.gap), this.cHeight - (--this.capPreviousYPosition[i]), this.meterWidth, this.capHeight);
        } else {
            this.canvasContext.fillRect(i * (this.meterWidth + this.gap), this.cHeight - value, this.meterWidth, this.capHeight);
            this.capPreviousYPosition[i] = value;
        }
        this.canvasContext.fillStyle = this.gradient; //set the filllStyle to gradient for a better look
        this.canvasContext.fillRect(i * (this.meterWidth + this.gap), this.cHeight - value + this.capHeight, this.meterWidth, this.cHeight); //the meter
    }
    this.animationId = requestAnimationFrame(this.drawMeter.bind(this));
};



ns.PlayerView = PlayerView;
ns.PlaylistView = PlaylistView;
ns.DetailView = DetailView;
ns.SpectrumView = SpectrumView;

})(player, window);
