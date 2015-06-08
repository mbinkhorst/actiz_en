'use strict';
(function() {


	function Navigation($target) {
	
		// Store target
		var self = this;
		this.$target = $target;

		// Status
		this.isShowing = false;

		// Outta sight
		TweenLite.set($target, {
			y: Navigation.height
		});

		// Render the template
		Chick.template($target.find('script').html(), {}, $target);
		Chick.enableContent($target);

		// Find the items.
		this.$items = $target.find('ul>li');

		// Listen to urls changing.
		Chick.app.router.on('pageLoadComplete', function() {

			// Loop through items and (de)activate
			self.$items.each(function() {

				var $item = $(this),
					link = $item.find('a').attr('href'),
					curLink = Chick.app.router.lastRequest.uri;

				// First part the same?
				link = link.split(/\//)[1];
				curLink = curLink.split(/\//)[1];
				$item.toggleClass('active', curLink === link);


			});

		});

	}
	Chick.register('Actiz.Navigation', Chick.Core.TriggerClass, Navigation);



	Navigation.prototype.show = function(delay) {

		// Already showing?
		if (this.isShowing) return;
		this.isShowing = true;

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Get items and place them out of screen
		TweenLite.set(this.$items, {
		 	rotationX: 0,
		 	opacity: 0
		});

		// Slide in from bottom
		TweenLite.to(this.$target, 0.6, {
			y: 0,
			ease: Quart.easeOut,
			delay: delay
		});

		// Show each item
		this.$items.each(function(index, item) {
			TweenLite.to(item, 0.7, {
				delay: delay + 0.5 + index * 0.05,
				opacity: 1,
				rotationX: 0,				
				ease: Quad.easeOut
			});
		});

	};

	Navigation.prototype.hide = function(delay) {

		// Not showing?		
		if (!this.isShowing) return;
		this.isShowing = false;

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Slide down
		TweenLite.to(this.$target, 0.6, {
			y: Navigation.height,
			ease: Quart.easeIn,
			delay: delay
		});

	};


	Navigation.height = 75;

})();