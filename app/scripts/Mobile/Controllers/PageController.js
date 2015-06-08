'use strict';
(function() {

	function PageController() {
	
	}
	Chick.registerController('Actiz.Mobile.PageController', PageController);

	// GET /
	PageController.prototype.show = function(page) {

		// No page?
		if (page === undefined) page = 'home';
		
		// Valid page?
		if (!/^(home|daarom-ouderenzorg|experience|het-netwerk|docent-mee-op-stage|nieuwsbrief)$/.test(page)) return false;

		return Chick.Gui.View.make('mobile/' + page)

			.on('ready' ,function() {

				// Newsletters
				this.$element.find('.newsletter.subscribe').each(function(index, item) {
					new Chick.Actiz.NewsletterSubscribe($(item));
				});

				// Newsletters
				this.$element.find('.mail-link').each(function(index, item) {
					new Chick.Actiz.MailLink($(item));
				});

				// Create paged content instances
				this.$element.find('.paged.content').each(function(index, item) {
					new Chick.Actiz.PagedContent($(item));
				});

				
			});


	};



})();
