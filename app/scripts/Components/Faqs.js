'use strict';
(function() {


	function Faqs($element) {
	
		// Localize.
		this.$element = $element;
		var self = this;

		// Find elements
		this.$firstFaq = this.$element.find('.faq').first();
		this.$content = this.$firstFaq.offsetParent();
		this.$questions = this.$firstFaq.parent();
		this.$navi = this.$element.find('.anchor-menu');

		// Find anchor links
		Chick.app.router.on('anchorChange', function(hash) {
			
			// Get the corresponding element
			var $el = self.$element.find('a[name=' + hash + ']');
			if ($el.length > 0) {

				var y = Math.min(
					self.$questions.height() - self.$navi.height(),
					Math.max(0, $el.offset().top - self.$firstFaq.offset().top)
				);

				// Scroll thereto.
				TweenLite.to(self.$content, 0.7, {
					scrollTo: { y: y },
					ease: Quad.easeInOut
				});

			}

		});
/*
		// When the window scrolls.
		var timeout = false;
		this.$content.on('scroll', function() {

			if (timeout) window.clearTimeout(timeout);
			timeout = window.setTimeout(function() {

				TweenLite.to(self.$navi, 0.3, {
					y: self.$content.scrollTop(),
					ease: Quad.easeOut
				});

			}, 100);

		});*/


	}
	Chick.register('Actiz.Faqs', Faqs);


	Faqs.prototype.show = function(anchor) {

		// Find the anchro.
		console.log(anchor);

	};




})();