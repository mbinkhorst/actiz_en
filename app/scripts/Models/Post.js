'use strict';
(function() {

	function Post() {
		this.__init();
	}
	Chick.register('Models.Post', Chick.Core.Model, Post);

	Post.dates = ['publishedAt'];

	Post.prototype.getTeaser = function() {

		// Convert body to text
		var text = $('<span></span>').html(this.__attributes.body).text();
		if (text.length > 160) {
			text = text.substr(0, 157) + '&hellip;';
		}
		return text;

	};

	Post.prototype.getDescription = function() {

		// Convert body to text
		var text = $('<span></span>').html(this.__attributes.body).text();
		if (text.length > 120) {
			text = text.substr(0, 117) + '...';
		}
		return text;

	};

	Post.prototype.getBody = function() {

		var body = this.__attributes.body;
		body = body.split(/<p>\s*<\/p>/).join('');
		return body;

	};

	Post.prototype.getDate = function() {
		return this.get('publishedAt').format('DD-MM-YYYY');
	};

	Post.prototype.getUrl = function() {

		return Chick.url('/praktijk/' + this.get('slug'));

	};
	Post.prototype.getUrlMobile = function() {

		return Chick.url('/m/praktijk/' + this.get('slug'));

	};

})();
