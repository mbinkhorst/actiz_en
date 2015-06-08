'use strict';
(function() {


	function MailLink($element) {
	
		// Localize.
		this.$element = $element;
		var self = this;

		// Am I a form?
		if ($element.is('form')) {
			this.$mailLinkForm = $element;
		} else {
			this.$mailLinkForm = $element.find('form');
		}


		// Submission.
		this.$mailLinkForm.on('submit', function(e) {
			e.preventDefault();

			// Form is busy
			self.$mailLinkForm.addClass('busy');

			// Remove errors
			self.$element.find('p.result').remove();

			// Ajax!
			$.ajax(self.$mailLinkForm.attr('action'), {
				method: 'post',
				dataType: 'jsonp',
				data: {
					email: self.$mailLinkForm.find('[name=email]').val()
				}
			}).then(function(result) {

				// Success?
				if (result.success === true) {

					// Show success message
					$('<p class="success result">' + I18n.get('mobile.experience.linkmail.success') + '</p>')
						.insertAfter(self.$mailLinkForm.hide());

					// Close after a while
					window.setTimeout(function() {
						self.$element.trigger('complete');
					}, 5000);

				} else {

					// Show error.
					$('<p class="error result">' + result.error.message + '</p>')
						.insertAfter(self.$mailLinkForm.removeClass('busy'));

				}


			});



		});

		

	}
	Chick.register('Actiz.MailLink', MailLink);


})();