'use strict';
(function() {

	function Author() {
		this.__init();
	}
	Chick.register('Models.Author', Chick.Core.Model, Author);

	Author.prototype.getImageUrl = function() {
		return '/content/' + this.__attributes.imageUrl;
	};

	Author.prototype.getFullname = function() {
		return this.__attributes.firstname + ' ' + this.__attributes.lastname;
	};

	Author.prototype.isGuest = function() {
		return this.__attributes.isGuest;
	};

	Author.prototype.getSlug = function() {
		return inflection.dasherize(this.getFullname().toLowerCase());
	};

	Author.prototype.getUrlMobile = function() {
		return '/m/praktijk/bloggers/' + this.get('slug');
	};

})();


