'use strict';
(function() {


	function SiteHeader($target, anim) {
	
		// Store target
		this.$target = $target;

		// Status
		this.isShowing = false;

		

		// Render the template
		Chick.template($target.find('script').html(), {}, $target);
		this.$hgroup = $target.find('hgroup');
		Chick.enableContent($target);

		// Outta sight
		if (anim !== false) {
			TweenLite.set(this.$target, {
				y: -SiteHeader.height
			});
		}

	}
	Chick.register('Actiz.SiteHeader', Chick.Core.TriggerClass, SiteHeader);



	SiteHeader.prototype.show = function(delay) {

		// Already showing?
		if (this.isShowing) return;
		this.isShowing = true;

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Slide in from bottom
		TweenLite.to(this.$target, 0.6, {
			y: 0,
			ease: Quart.easeOut,
			delay: delay
		});


	};

	SiteHeader.prototype.hide = function(delay) {

		// Not showing?		
		if (!this.isShowing) return;
		this.isShowing = false;

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Slide down
		TweenLite.to(this.$target, 0.6, {
			y: -SiteHeader.height,
			ease: Quart.easeIn,
			delay: delay
		});

	};


	SiteHeader.height = 77;


	

})();