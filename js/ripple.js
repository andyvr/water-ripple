/**
 * Water ripple effect.
 * Original code (Java) by Neil Wallis
 * Code snipplet adapted to Javascript by Sergey Chikuyonok
 * Code re-written as jQuery plugin by Andrei Varabyou
 */
;(function ( $, window, document, undefined ) {
    var scope = {};
	var pluginName = "waterripple",
        defaults = {
            delay		: 30,		//delay before re-drawing the next frame
			riprad		: 3,		//single ripple radius
			line_width	: 20,
			arbitrary	: 1000,		//generate a new random ripple every n-mseconds, false - turns off random ripples
			onclick		: false,	//generate a new ripple on mouse click
			onmove		: false,	//generate a new ripple on mouse move
        };
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
		var that = this;
		var imgSrc;
		if(element.tagName == "IMG") imgSrc = $(element).attr("src");
		else {
			var backgroundImage = $(element).css('background-image');
			if(backgroundImage != "none"){
				var pattern = /url\("{0,1}([^"]*)"{0,1}\)/;                
				imgSrc = pattern.exec(backgroundImage)[1];                
			}
		}
		if(imgSrc) {
			that.image = $("<img/>") // Make in memory copy of image to avoid css issues
			.attr("src", imgSrc)
			.load(function() {
				that.init();
			});
		}
    }
    Plugin.prototype = {
        init: function() {
            scope.canvas		= document.createElement('canvas');
			$(this.element).after(scope.canvas);
			scope.ctx			= scope.canvas.getContext('2d');
			scope.width			= $(this.element).width();
			scope.height		= $(this.element).height();
			scope.delay			= this.options.delay;
			scope.riprad		= this.options.riprad;
			scope.line_width	= this.options.line_width;
			scope.half_width	= scope.width >> 1;
			scope.half_height	= scope.height >> 1;
			scope.size			= scope.width * (scope.height + 2) * 2;
			scope.oldind		= scope.width;
			scope.newind		= scope.width * (scope.height + 3);
			scope.mapind;
			scope.ripplemap		= [];
			scope.last_map		= [];
			scope.step			= scope.line_width * 2;
			scope.count			= scope.height / scope.line_width;
			scope.canvas.width	= scope.width;
			scope.canvas.height	= scope.height;
			if(this.element.tagName == "IMG") scope.ctx.drawImage(this.element, 0, 0);
			else scope.ctx.drawImage(this.image[0], 0, 0);
			$(this.element).hide();
			scope.texture		= scope.ctx.getImageData(0, 0, scope.width, scope.height);
			scope.ripple		= scope.ctx.getImageData(0, 0, scope.width, scope.height);
			for (var i = 0; i < scope.size; i++) {
				scope.last_map[i] = scope.ripplemap[i] = 0;
			}
			//run main loop
			setInterval(run, scope.delay);
			// generate random ripples
			if(this.options.arbitrary && this.options.arbitrary != 0) {
				var rnd = Math.random;
				disturb(rnd() * scope.width, rnd() * scope.height);
				setInterval(function() {
					disturb(rnd() * scope.width, rnd() * scope.height);
				}, this.options.arbitrary);
			}
			if(this.options.onclick) {
				scope.canvas.onclick = function(evt) {
					disturb(evt.offsetX || evt.layerX, evt.offsetY || evt.layerY);
				};
			}
			if(this.options.onmove) {
				scope.canvas.onmousemove = function(evt) {
					disturb(evt.offsetX || evt.layerX, evt.offsetY || evt.layerY);
				};
			}
        },
    };
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };
	/**
	 * Main loop
	 */
	function run() {
		newframe();
		scope.ctx.putImageData(scope.ripple, 0, 0);
	}
	/**
	 * Disturb water at specified point
	 */
	function disturb(dx, dy) {
		dx <<= 0;
		dy <<= 0;
		for (var j = dy - scope.riprad; j < dy + scope.riprad; j++) {
			for (var k = dx - scope.riprad; k < dx + scope.riprad; k++) {
				scope.ripplemap[scope.oldind + (j * scope.width) + k] += 512;
			}
		}
	}
	/**
	 * Generates new ripples
	 */
	function newframe() {
		var i, a, b, data, cur_pixel, new_pixel, old_data;
		i = scope.oldind;
		scope.oldind = scope.newind;
		scope.newind = i;
		i = 0;
		scope.mapind = scope.oldind;
		// create local copies of variables to decrease
		// scope lookup time in Firefox
		var _width = scope.width,
			_height = scope.height,
			_ripplemap = scope.ripplemap,
			_mapind = scope.mapind,
			_newind = scope.newind,
			_last_map = scope.last_map,
			_rd = scope.ripple.data,
			_td = scope.texture.data,
			_half_width = scope.half_width,
			_half_height = scope.half_height;
		for (var y = 0; y < _height; y++) {
			for (var x = 0; x < _width; x++) {
				data = (
					_ripplemap[_mapind - _width] + 
					_ripplemap[_mapind + _width] + 
					_ripplemap[_mapind - 1] + 
					_ripplemap[_mapind + 1]) >> 1;
				data -= _ripplemap[_newind + i];
				data -= data >> 5;
				_ripplemap[_newind + i] = data;
				//where data=0 then still, where data>0 then wave
				data = 1024 - data;
				old_data = _last_map[i];
				_last_map[i] = data;
				if (old_data != data) {
					//offsets
					a = (((x - _half_width) * data / 1024) << 0) + _half_width;
					b = (((y - _half_height) * data / 1024) << 0) + _half_height;
					//bounds check
					if (a >= _width) a = _width - 1;
					if (a < 0) a = 0;
					if (b >= _height) b = _height - 1;
					if (b < 0) b = 0;
					new_pixel = (a + (b * _width)) * 4;
					cur_pixel = i * 4;
					_rd[cur_pixel] = _td[new_pixel];
					_rd[cur_pixel + 1] = _td[new_pixel + 1];
					_rd[cur_pixel + 2] = _td[new_pixel + 2];
				}
				++_mapind;
				++i;
			}
		}
		scope.mapind = _mapind;
	}
})( jQuery, window, document );