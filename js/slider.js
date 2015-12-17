(function($) {  //pass jQuery to our plugin to ensure $ is jQuery
	"use strict";

	$.fn.slider = function(config) {
		//this = jQuery object

		function Slider(config) {
			var _$view = config.view;

			_$view.append('<div class="track"></div><div class="thumb"></div>');

			var _$track = _$view.find('.track');
			var _$thumb = _$view.find('.thumb');

			//check config
			var _value = (isNaN(config.value) ? 0 : config.value);
			var _minValue = (isNaN(config.min) ? 0 : config.min);
			var _maxValue = (isNaN(config.max) ? 100 : config.max);

			_$view.on('mousedown', this.onMouseDownHandler.bind(this));

			//temporarily api
			_$view.data('interface', {
				setValue: this.setValue.bind(this),
				getValue: this.getValue.bind(this)
			});

			this.getView = function(){return _$view;};
			this.getThumb = function(){return _$thumb;};
			this.getValue = function(){return _value;};
			this.getMinValue = function(){return _minValue;};
			this.getMaxValue = function(){return _maxValue;};
			this.getTrackWidth = function(){return _$track.width();};
			this.getThumbWidth = function(){return _$thumb.width();};
			this.getTrackLeft = function(){return _$track.offset().left;};
			this.getPosition = function(){ return _position;};
			this.setPosition = function(position){ _position = position;};


			// Init
			var _position = this.valueToPosition(_value);
			//_$view.prev().html(_value);
			this.setValue(_value);
			this.getThumb().addClass( "translate");

		}

		Slider.prototype.setValue = function setValue(newValue) {
			this.getThumb().css('left', this.valueToPosition(newValue));
			this.setPosition(this.valueToPosition(newValue));
			this.getView().trigger('change');
		};

		Slider.prototype.onMouseDownHandler = function onMouseDownHandler(e) {
			this.getView().addClass('active');
            this.getView().trigger('timelineMousedown');
			var dragOffsetX = 0;
			if(e.target == this.getThumb()[0]) {
				//thumb
				dragOffsetX = e.pageX - this.getThumb().offset().left;
			} else {
				//track
				dragOffsetX = this.getThumbWidth()/2;
				this.setValueByPageX(e.pageX, dragOffsetX);
			}

			var that = this; //now we save this instead of bind
			$(window).on('mousemove', function(e) {
				that.setValueByPageX(e.pageX, dragOffsetX);
				e.preventDefault();
			});

			$(window).on('mouseup', function(e) {
				$(window).off('mousemove').off('mouseup');
				that.getView().removeClass('active');
                that.getView().trigger('timelineMouseup');
				e.preventDefault();
			});
			e.preventDefault(); //otherwise text cursor
		};

		Slider.prototype.getValue = function getValue() {
			return this.positionToValue(this.getPosition());
		};

		Slider.prototype.valueToPosition = function valueToPosition(value) {
			return (value - this.getMinValue())/(this.getMaxValue() - this.getMinValue()) * (this.getTrackWidth() - this.getThumbWidth())
		};

		Slider.prototype.positionToValue = function positionToValue(position) {
			return position / (this.getTrackWidth() - this.getThumbWidth()) * (this.getMaxValue() - this.getMinValue()) + this.getMinValue();
		};

		Slider.prototype.setValueByPageX = function setValueByPageX(pageX, dragOffsetX) {
			var position = Math.max(0, Math.min(pageX - this.getTrackLeft() - dragOffsetX, this.getTrackWidth() - this.getThumbWidth()));
			this.setValue(this.positionToValue(position));
		};

		this.each(function() {
			//this == dom element
			var newConfig = $.extend({}, $.fn.slider.DEFAULT_CONFIG, config)
			$(this).data('slider', new Slider(newConfig));

		});
		return this; //allow chaining
	}

	$.fn.slider.DEFAULT_CONFIG = {isAutoClosing: true};

})(jQuery);