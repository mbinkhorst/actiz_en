(function() {
	'use strict';

	function Positioner($target) {
	
		// Store target
		this.$target = $target;

		Chick.Actiz.Positioner.instance = this;


	}
	Chick.register('Actiz.Positioner', Chick.Core.TriggerClass, Positioner);


	// jQuery plugin
	$.fn.position = function(css) {

		return this.each(function() {

			var $el = $(this);
			if (css === undefined) css = { };
			TweenLite.set($el, css);
			$el.show();

			// Position it.
			Chick.Actiz.Positioner.instance.apply($el.parent());

		});

	};




	/**
	 * Public methods
	 */

	Positioner.prototype.setTarget = function($target) {

		this.$target = $target;
		return this;

	};


	Positioner.prototype.apply = function($target) {

		// Target given?
		if ($target === undefined) $target = this.$target;		

		// Target invisible?
		if (!$target.is(':visible')) return;

		// Look for size options
		var self = this;
		$target.find('[data-size]').each(function(index, el) {

			// Get the info
			var $el = $(el);
			if (!$el.is(':visible')) return;

			// Apply
			var	options = self.__parseSizeOptions($el.data('size'));
			if (options !== false) self.__applyElementSize($el, options);

		});


		// Look for scale options
		$target.find('[data-scale]').each(function(index, el) {

			// Get the info
			var $el = $(el);
			if (!$el.is(':visible')) return;
			
			// Apply item
			var options = self.__parseScaleOptions($el.data('scale'));
			if (options !== false) self.__applyElementScale($el, options);


		});
		

		// Look for positioning clues.
		$target.find('[data-position]').each(function(index, el) {

			// Get the info
			var $el = $(el);
			if (!$el.is(':visible')) return;			

			// Apply item
			var options = self.__parsePositionOptions($el.data('position'));
			if (options !== false) self.__applyElementPosition($el, options);


		});



	};


	/**
	 * "Private" methods
	 */

	Positioner.prototype.__applyElementScale = function($el, options) {

		// Do we know the size of the element?
		var elSize = $el.data('original-size');
		if (elSize === undefined) {
			elSize = { width: $el.outerWidth(), height: $el.outerHeight() };
			$el.data('original-size', elSize);
		}

		// Get offset size
		var $parent = $el.offsetParent(),
			parentSize = { width: $parent.outerWidth(), height: $parent.outerHeight() },

		// Width?
		scale = false,
		perc;
		if (options.width !== undefined) {

			// Percentage of width
			perc = parseFloat(options.width) / 100;
			scale = (perc * parentSize.width) / elSize.width;			

		} else if (options.height !== undefined) {

			// Percentage of height
			perc = parseFloat(options.height) / 100;
			scale = (perc * parentSize.height) / elSize.height;


		}

		// Found it?
		if (scale === false) return;
		scale = Math.max(Math.min(scale,options.max), options.min);
		
		// Apply
		TweenLite.set($el, {
			scale: scale
		});		

		// Store scale on element
		$el.data('current-scale', scale);
	};
	

	Positioner.prototype.__applyElementSize = function($el, options) {

		// Do we know the size of the element?
		var elSize = $el.data('original-size');
		if (elSize === undefined) {
			elSize = { width: $el.outerWidth(), height: $el.outerHeight() };
			$el.data('original-size', elSize);
		}
	
		// Get offset size
		var $parent = $el.offsetParent(),
			parentSize = { width: $parent.outerWidth(), height: $parent.outerHeight() };

		// Always cover?
		if (options === 'cover') {

			// Check if element is wider than the container
			if (elSize.width / elSize.height > parentSize.width / parentSize.height) {

				// Match height, and then width
				$el.css({
					height: parentSize.height,
					width: parentSize.height * (elSize.width / elSize.height)
				});

			} else {

				// Match width, and then height
				$el.css({
					width: parentSize.width,
					height: parentSize.width * (elSize.height / elSize.width)
				});

			}

		} else if (typeof options === 'object') {

			// Prepare styles
			var css = {};

			// Width?
			if (options.width !== undefined) {

				// Parse it.
				if (options.width.substr(-1, 1) === '%') {
					var percentualWidth = parseFloat(options.width);
					css.width = parentSize.width * (percentualWidth / 100);
				}

			}

			// Height as well?
			if (options.height !== undefined) {

				// Parse it.
				if (options.height.substr(-1, 1) === '%') {
					var percentualHeight = parseFloat(options.height);
					css.height = parentSize.height * (percentualHeight / 100);
				}

			}

			// Apply it.
			$el.css(css);

		}



	};




	Positioner.prototype.__applyElementPosition = function($el, options) {

		// Scale.
		var scale = $el.data('current-scale');
		if (scale === undefined) scale = 1.00;
		var elSize = { 
			width: $el.outerWidth() * scale, 
			height: $el.outerHeight() * scale
		};

		// Convert anchor to pix
		var anchor = { x: options.anchor[0], y: options.anchor[1] };
		if (anchor.x === 'left') {
			anchor.x = 0;
		} else if (anchor.x === 'right') {
			anchor.x = elSize.width;
		} else if (anchor.x === 'center') {
			anchor.x = elSize.width / 2;
		} else if (anchor.substr(-1, 1) === '%') {
			anchor.x = elSize.width * parseFloat(anchor.x) / 100;
		}

		if (anchor.y === 'top') { 
			anchor.y = 0;
		} else if (anchor.y === 'bottom') {
			anchor.y = elSize.height;
		} else if (anchor.y === 'center') {
			anchor.y = elSize.height / 2;
		} else if (anchor.y.substr(-1, 1) === '%') {
			anchor.y = elSize.height * parseFloat(anchor.y) / 100;
		}


		// Check horizontal positioning?
		var position = { position: 'absolute' },
			perc;
		if (options.horizontal !== undefined) {

			// Left / right / center?
			if (options.horizontal === 'left') {
				position.left = 0 - anchor.x;
			} else if (options.horizontal === 'center') {
				position.left = ($el.offsetParent().outerWidth() * 0.5) - anchor.x;
			}

			// Must be % then.
			else if (options.horizontal.substr(-1, 1) === '%') {

				// Set the percentage
				perc = parseFloat(options.horizontal);
				var x = $el.offsetParent().outerWidth() * (perc / 100);

				position.left = x - anchor.x;

			
			// Or pixels	
			} else if (options.horizontal.substr(-2, 2) === 'px') {

				// Get the pixels
				position.left = parseFloat(options.horizontal);
				if (position.left < 0) position.left += $el.offsetParent().outerWidth();
				position.left -= anchor.x;

			}

		}


		// Check vertical positioning
		if (options.vertical !== undefined) {
			
			// Top / bottom / center ?
			if (options.vertical === 'top') {			
				position.top = 0 - anchor.y;		
			} else if (options.vertical === 'bottom') {
				position.bottom = 0 - elSize.height + anchor.y;
			} else if (options.vertical === 'center') {
				position.top = ($el.offsetParent().outerHeight() * 0.5) - anchor.y;
			}

			// Must be % then.
			else if (options.vertical.substr(-1, 1) === '%') {

				// Set the percentage
				perc = parseFloat(options.vertical);
				var y = $el.offsetParent().outerHeight() * (perc / 100);

				position.top = y - anchor.y;

			// Or pixels
			} else if (options.vertical.substr(-2, 2) === 'px') {

				// Get the pixels
				position.top = parseFloat(options.vertical);
				if (position.top < 0) position.top += $el.offsetParent().outerHeight();
				position.top -= anchor.y;

			}


			
		}

		// Unset opposites
		if (position.top !== undefined) { 
			position.bottom = 'auto';
		} else if (position.bottom !== undefined) {
			position.top = 'auto';
		}
		if (position.left !== undefined) {
			position.right = 'auto';
		} else if (position.right !== undefined) {
			position.left = 'auto';
		}

		//console.log($el, position, $el.width(), $el.height(), $el.offsetParent().outerWidth(), $el.offsetParent().outerHeight());

		// Apply it.
		$el.css(position);


	};

	Positioner.prototype.__parseSizeOptions = function(str) {

		// Nothing?
		if (str === '') return false;

		// One worder?
		if (/^[a-z]+$/.test(str)) {
			return str;
		}

		// Remove spaces and split on ,
	 	var pairs = str.split(' ').join('').split(','),
	 		options = {};
	 	for (var q = 0; q < pairs.length; q++) {

	 		// Split on :
	 		var pair = pairs[q].split(':'),
	 			values = pair[1].split('/');
	 		if (values.length === 1) values = values[0];
	 		options[pair[0]] = values;

	 	}

	 	return options;

	};

	Positioner.prototype.__parseScaleOptions = function(str) {

		// Nothing?
		if (str === '') return false;

		// Remove spaces and split on ,
	 	var pairs = str.split(' ').join('').split(','),
	 		options = {};
	 	for (var q = 0; q < pairs.length; q++) {

	 		// Split on :
	 		var pair = pairs[q].split(':'),
	 			values = pair[1].split('/');
	 		if (values.length === 1) values = values[0];
	 		options[pair[0]] = values;

	 	}

	 	// Min / Max?
	 	if (options.min === undefined) options.min = 0.1;
	 	if (options.max === undefined) options.max = 100;

	 	return options;

	};


	Positioner.prototype.__parsePositionOptions = function(str) {

		// Nothing?
		if (str === '') return false;

		// Shortcuts
		if (str === 'center') {
			return {
				horizontal: 'center',
				vertical: 'center',
				anchor: ['center', 'center']
			};
		}

	 	// Remove spaces and split on ,
	 	var pairs = str.split(' ').join('').split(','),
	 		options = {};
	 	for (var q = 0; q < pairs.length; q++) {

	 		// Split on :
	 		var pair = pairs[q].split(':'),
	 			values = pair[1].split('/');
	 		if (values.length === 1) values = values[0];
	 		options[pair[0]] = values;

	 	}


	 	// X/Y?
	 	if (options.y !== undefined) options.vertical = options.y;
	 	if (options.x !== undefined) options.horizontal = options.x;

	 	// Is there an anchor?
	 	if (options.anchor === undefined) {
	 		options.anchor = ['center', 'center'];
	 		if (options.vertical !== undefined && options.vertical === 'bottom') {
	 			options.anchor[1] = 'bottom';
	 		}
	 		if (options.vertical !== undefined && options.vertical === 'top') {
	 			options.anchor[1] = 'top';
	 		}
	 	}

	 	
	 	return options;


	 };


})();