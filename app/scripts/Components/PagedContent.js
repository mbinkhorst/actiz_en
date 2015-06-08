'use strict';
(function() {


	function PagedContent($element) {
	
		// Localize.
		this.$element = $element;
		var self = this;

		// Find elements
		this.$btnPrevious = this.$element.find('.previous');
		this.$btnNext = this.$element.find('.next');

		this.$items = this.$element.find('>ul > li');

		// Show first.
		this.show(0);

		// Listen.
		this.$btnPrevious.on('click', function(e) {
			e.preventDefault();
			self.show(self.currentIndex - 1);
		});
		this.$btnNext.on('click', function(e) {
			e.preventDefault();
			self.show(self.currentIndex + 1);
		});


	}
	Chick.register('Actiz.PagedContent', PagedContent);


	PagedContent.prototype.show = function(index) {

		// Check bounds.
		if (index >= this.$items.length) index = 0;
		if (index < 0) index = this.$items.length - 1;

		// Show it.
		this.currentIndex = index;
		$(this.$items.get(index)).show().siblings().hide();

	};




})();