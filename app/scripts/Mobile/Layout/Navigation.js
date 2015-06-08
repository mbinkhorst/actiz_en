'use strict';
(function() {


	function Navigation($slider) {
	
		// Store target
		var self = this;

		this.$slider = $slider;
		this.$nav = $slider.find('>nav');

		// Status
		this.isShowing = false;

		
		// Render the template
		Chick.template(this.$nav.find('script').html(), {}, this.$nav);
		Chick.enableContent(this.$nav);

		// Find the items.
		this.$items = this.$nav.find('ul>li');

		// Listen to urls changing.
		Chick.app.router.on('pageLoadComplete', function() {

			// Loop through items and (de)activate
			self.$items.each(function() {

				var $item = $(this),
					link = $item.find('a').attr('href'),
					curLink = Chick.app.router.lastRequest.uri;

				// First part the same?
				link = link.split(/\//)[2];
				curLink = curLink.split(/\//)[2];
				$item.toggleClass('active', curLink === link);


			});

		});


		// Toggler.
		this.$btnToggle = Chick.app.siteHeader.$target.find('button.toggle');
		this.$btnToggle.on('mousedown', function(e) {

			// Toggle nav
			self.toggle();			

		});

		// When an item is clicked.
		this.$items.on('mousedown', function(e) {
			self.hide();
		});


	}
	Chick.register('Actiz.Mobile.Navigation', Chick.Core.TriggerClass, Navigation);


	Navigation.prototype.toggle = function() {

		return this.isShowing ? this.hide() : this.show();
		
	};


	Navigation.prototype.show = function(delay) {

		// Already showing?
		if (this.isShowing) return;
		this.isShowing = true;
		this.$btnToggle.toggleClass('active', this.isShowing);

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Move it in.
		TweenLite.to(this.$slider, 0.35, {
			left: Navigation.WIDTH,
			ease: Quad.easeOut,
			delay: delay
		});
	
		

	};

	Navigation.prototype.hide = function(delay) {

		// Not showing?		
		if (!this.isShowing) return;
		this.isShowing = false;
		this.$btnToggle.toggleClass('active', this.isShowing);


		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Move it out.
		TweenLite.to(this.$slider, 0.25, {
			left: 0,
			ease: Quad.easeIn,
			delay: delay
		});
	
	

	};

	Navigation.WIDTH = 165;

})();