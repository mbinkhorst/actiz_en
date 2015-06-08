'use strict';
(function() {


	function Content() {
	
	}
	Chick.register('Actiz.Content', Content);



	///////////////////////
	// "Private" methods //
	///////////////////////



	////////////////////
	// Static methods //
	////////////////////

	Content.render = function(key) {

		// Already an object?
		var items;
		if (typeof key === 'string') {

			// A i18n key?
			if (/^[a-z\-]+\./.test(key)) {

				// Get data
				items = I18n.get(key);
				if (typeof items === 'string') return '<p>' + items + '</p>';

			} else {

				// Just do the key itself
				return '<p>' + key + '</p>';

			}


		} else {
			items = key;
		}

		// Loop it.
		var html = _.reduce(items, function(memo, item) {

			// Paragraph
			var result = '<p>' + item + '</p>';


			return memo + result;
		}, '');

		return html;

	};



})();