'use strict';
(function() {

	function PageController() {
	
	}
	Chick.registerController('Actiz.PageController', PageController);

	// GET /
	PageController.prototype.home = function() {

		return Chick.Gui.View.make('pages/home')

			.on('ready' ,function() {

				// Find elements
				this.$banner = this.$element.find('.banner');
			
				// Show the CTA
				TweenLite.fromTo(this.$banner, 0.8, {
					x: -300,
					rotationY: -90,
					opacity: 0
				}, {
					x: 0,
					rotationY: 0,
					opacity: 1,
					ease: Back.easeOut.config(1),
					delay: 1
				});

				
			})

			.on('leave', function(newRequest) {


				// Hide some things.
				var promise = Chick.promise();
				TweenLite.to(this.$banner, 0.5, {
					rotationY: -90,
					x: -300,
					opacity: 0,
					ease: Quad.easeInOut,
				});
				
				// Fade out all.
				TweenLite.to(this.$element, 0.7, {
					opacity: 0,
					onComplete: function() {
						promise.resolve();
					}
				});

				return promise;

			})

			.waitForLeaveAnimation();

	};


	// GET /waarom-ouderenzorg/:page
	PageController.prototype.daaromOuderenzorg = function(page) {

		// Known?
		if (!/^(hbo-v|faq|opleiding|arbeidsmarkt|docenten|media)$/.test(page)) return false;

		// Show the page.
		var view = Chick.Gui.View.make('pages/ouderenzorg-' + page)

			.on('ready', function() {

				// Create paged content instances
				this.$element.find('.paged.content').each(function(index, item) {
					new Chick.Actiz.PagedContent($(item));
				});

				// Newsletters
				this.$element.find('.newsletter.subscribe').each(function(index, item) {
					new Chick.Actiz.NewsletterSubscribe($(item));
				});

				// FAQs.
				if (page === 'faq') {
					new Chick.Actiz.Faqs(this.$element);
				}
			

			});
		return view;


	};


	// GET /het-netwerk/:page
	PageController.prototype.hetNetwerk = function(page) {

		// Known?
		if (!/^(testimonials|partners-en-links|evenementen)$/.test(page)) return false;


		// Show the page.

		return Chick.Gui.View.make('pages/netwerk-' + page)

			.on('ready', function() {

			});



	};


	// GET /praktijk/mee-op-stage
	PageController.prototype.meeOpStage = function() {

		// Show the page.
		return Chick.Gui.View.make('pages/praktijk-mee-op-stage')

			.on('ready', function() {

			});



	};


})();
