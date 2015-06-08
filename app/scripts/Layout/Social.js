'use strict';
(function() {


	function Social($target) {
	
		// Store target
		this.$target = $target;
		var self = this;

		// Status
		this.isShowing = false;
		this.newsletterIsShowing = false;
		
		// Outta sight
		TweenLite.set($target, {
			y: -Social.height
		});


		// Render the template
		Chick.template($target.find('script').html(), {}, $target);
		Chick.enableContent($target);

		// Get the newlettterr form(s)
		this.$newsletter = this.$target.find('div.newsletter').hide();
		this.$newsletterForm = this.$newsletter.find('form');

		// Bind newsletter
		this.$btnNewsletter = $target.find('a.newsletter').on('click', function(e) {
			e.preventDefault();

			// Toggle newsletter
			self.toggleNewsletter();

		});

		// Subscribe.
		new Chick.Actiz.NewsletterSubscribe(this.$newsletterForm);
		this.$newsletterForm.on('complete', function() {
			self.toggleNewsletter(false);
		});

	}
	Chick.register('Actiz.Social', Chick.Core.TriggerClass, Social);



	Social.prototype.show = function(delay) {

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

	Social.prototype.hide = function(delay) {

		// Not showing?		
		if (!this.isShowing) return;
		this.isShowing = false;

		// Default delay
		delay = delay === undefined ? 0 : delay;

		// Slide down
		TweenLite.to(this.$target, 0.6, {
			y: -Social.height,
			ease: Quart.easeIn,
			delay: delay
		});

		// Hide newsletter
		this.toggleNewsletter(false);

	};

	Social.prototype.toggleNewsletter = function(show) {

		// No show?
		if (show === undefined) show = !this.newsletterIsShowing;
		this.newsletterIsShowing = show;

		// Apply to button
		this.$btnNewsletter.toggleClass('active', show);

		// Show?
		if (show) {

			// Show it.
			TweenLite.fromTo(this.$newsletter, 0.4, {
				y: -10,
				opacity: 0
			}, {
				y: 0,
				opacity: 1,
				ease: Quad.easeInOut
			});
			this.$newsletter.show();

		} else{ 

			// Hide it.
			var self = this;
			TweenLite.to(this.$newsletter, 0.4, {
				y: -10,
				opacity: 0,
				ease: Quad.easeInOut,
				onComplete: function() {
					self.$newsletter.hide();
				}
			});

		}

	};


	Social.height = 77;


	

})();