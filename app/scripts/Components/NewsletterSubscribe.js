'use strict';
(function() {


	function NewsletterSubscribe($element) {
	
		// Localize.
		this.$element = $element;
		var self = this;

		// Am I a form?
		if ($element.is('form')) {
			this.$newsletterForm = $element;
		} else {
			this.$newsletterForm = $element.find('form');
		}


		// Submission.
		this.$newsletterForm.on('submit', function(e) {
			e.preventDefault();

			// Form is busy
			self.$newsletterForm.addClass('busy');

			// Remove errors
			self.$element.find('p.result').remove();

			// Ajax!
			$.ajax(self.$newsletterForm.attr('action'), {
				method: 'post',
				dataType: 'jsonp',
				data: {
					email: self.$newsletterForm.find('[name=email]').val()
				}
			}).then(function(result) {

				// Success?
				if (result.success === true) {

					// Show success message
					$('<p class="success result">' + I18n.get('newsletter.subscribe.success') + '</p>')
						.insertAfter(self.$newsletterForm.hide());

					// Close after a while
					window.setTimeout(function() {
						self.$element.trigger('complete');
					}, 5000);

				} else {

					// Show error.
					$('<p class="error result">' + I18n.get('newsletter.subscribe.errors.' + result.error.type) + '</p>')
						.insertAfter(self.$newsletterForm.removeClass('busy'));

				}


			});



		});

		

	}
	Chick.register('Actiz.NewsletterSubscribe', NewsletterSubscribe);


})();