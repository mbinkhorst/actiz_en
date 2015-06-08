'use strict';
(function() {


	function CaseSelector($element) {
	
		var self = this;

		// Store target
		this.$element = $element;

		// Create the items
		this.items = [];
		this.__currentFocus = false;
		var info = I18n.get('cases');
		this.$items = this.$element.find('.case').each(function(index, el) {

			// Create it
			var $el = $(el),
			item = {
				index: index,
				info: info[index],
				$element: $el,
				$container: $el.find('.container')
			};


			// Find subelements
			item.$image = item.$container.find('> img');
			item.$container.css({
				'background-image': 'url(' + item.$image.hide().attr('src') + ')',
				'background-size': 'auto 100%',
				'background-position': 'center center'
			});
			item.$content = item.$container.find('.banner');
			item.$link = item.$container.find('.link').css({
				'pointer-events': 'none'
			});
			

			// Add it
			self.items.push(item);

			// For touch...
			if (Modernizr.touch) {
			
				var hammer = new Hammer(item.$link[0], {});
				hammer.on('tap', function(e) {
					item.$link.click();
				});

			}

		});




		// Resize and position in initial position
		this.__calcSizes();
		for (var i = 0; i < this.items.length; i++) {

			// Resize
			this.items[i].perc = 1 / this.items.length;
			this.__resizeItem(this.items[i]);
			
		}


		// Resize listen.
		Chick.app.on('resize', function() { self.__onResize(); });
	
		// Calculate percentages
		this.mouseOverPerc = 1 / (this.items.length - 1);
		this.mouseOutPerc = (1 - this.mouseOverPerc) / (this.items.length - 1);
		this.normalPerc = 1 / this.items.length;



		// Hover!
		var mouseOver = function(hoverItem) {

			// Lose focus?
			self.__loseFocus();
			
			// Animate percentages
			_.each(self.items, function(item, index) {

				// Animate there
				item.animation = TweenLite.to(item, 0.6, {
					perc: (index === hoverItem.index) ? self.mouseOverPerc : self.mouseOutPerc,
					ease: Quad.easeInOut,
					onUpdate: function() {
						self.__resizeItem(item);
					},
					onComplete: (index === hoverItem.index) ? function() {

						// Give focus to the item
						self.__setFocus(hoverItem);

					} : null
				});

			});			

		};
		this.$items.on('mouseenter', function() {
		
			// Get item
			var hoverItem = self.items[$(this).index()];
			mouseOver(hoverItem);

		});

		// Touch this.
		if (Modernizr.touch) {
			_.each(this.items, function(item) {

				// Hammer time.
				var hammer = new Hammer(item.$element[0], {});
				hammer.on('tap', function(e) {
					mouseOver(item);
				});

			});
		}


		this.$element.on('mouseleave', function(e) {

			// Leave focus.
			self.__loseFocus();

			// Back to normal
			_.each(self.items, function(item, index) {

				// Animate there
				item.animation = TweenLite.to(item, 0.6, {
					perc: self.normalPerc,
					ease: Quad.easeInOut,
					onUpdate: function() {
						self.__resizeItem(item);
					}
				});

			});		


		});


	}
	Chick.register('Actiz.CaseSelector', Chick.Core.TriggerClass, CaseSelector);



	///////////////////////
	// "Private" methods //
	///////////////////////

	CaseSelector.prototype.__setFocus = function(item) {

		// Store focus
		this.__currentFocus = item;

		// Loop through items
		for (var q = 0; q < this.items.length; q++) {

			// Current?
			if (this.items[q].index === item.index) {

				// Show the call to action.
				this.items[q].$content.show();
				TweenLite.fromTo(this.items[q].$content, 0.5, {
					y: 100, 
					opacity: 0,
					rotationX: 90
				}, {
					y: 0,
					opacity: 1,
					rotationX: 0,
					ease: Back.easeOut					
				});

				// Enable clicking
				this.items[q].$link.css({
					'pointer-events': 'all'
				});

			} else {

				// Back to black.
				TweenLite.to(this.items[q].$element, 0.4, {
					opacity: 0.43,
					ease: Linear.easeNone
				});

			}

		}


	};


	CaseSelector.prototype.__loseFocus = function() {

		// Do we have focus?
		if (this.__currentFocus === false) return;

		// Disble clicking
		this.__currentFocus.$link.css({
			'pointer-events': 'none'
		});

		// Hide the cta
		var $content = this.__currentFocus.$content;
		TweenLite.to($content, 0.2, {
			y: 100,
			opacity: 0,
			rotationX: 90,
			ease: Back.easeIn,
			onComplete: function() {
				$content.hide();
			}
		});

		// Everyone back to light
		for (var q = 0; q < this.items.length; q++) {
			if (q === this.__currentFocus.index) continue;
			TweenLite.to(this.items[q].$element, 0.2, {
				opacity: 1
			});
		}
		this.__currentFocus = false;


	};

	CaseSelector.prototype.__resizeItem = function(item) {

		// Set width to a nth of the total
		item.$container.css({
			width: this.__width * item.perc,
			height: this.__height
		});

		// Position it
		if (item.index === 0) {
			item.left = 0;
			item.$element.css({ left: 0 });
		} else {

			// Position the item next to previous one.
			var prev = this.items[item.index - 1],
			left = prev.left + prev.$element.width();
			item.left = left;
			item.$element.css({
				left: left
			});
			

		}

	};

	CaseSelector.prototype.__calcSizes = function() {

		this.__width = this.$element.outerWidth();
		this.__height = this.$element.outerHeight();

	};



	CaseSelector.prototype.__onResize = function() {

		// Recalc and position
		this.__calcSizes();
		for (var i = 0; i < this.items.length; i++) {

			// Resize
			this.__resizeItem(this.items[i]);

		}


	};



})();