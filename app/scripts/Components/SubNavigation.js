'use strict';
(function() {


	function SubNavigation(key) {
	
		this.key = key;

	}
	Chick.register('Actiz.SubNavigation', Chick.Core.TriggerClass, SubNavigation);



	///////////////////////
	// "Private" methods //
	///////////////////////



	////////////////////
	// Public methods //
	////////////////////
	
	SubNavigation.prototype.render = function(activeIndex) {

		// Find template
		var template = SubNavigation.getTemplate(),

		// Find items
		items = I18n.get('sub-navigation.' + this.key);

		// Run it.
		return template.run({
			items: items,
			activeIndex: activeIndex
		});



	};


	

	////////////////////
	// Static methods //
	////////////////////


	var t;
	SubNavigation.getTemplate = function() {
		if (t === undefined) {
			t = new Chick.Gui.Template($('script.sub-navigation').html());
		}
		return t;
	};


	SubNavigation.create = function(key) {

		return new Chick.Actiz.SubNavigation(key);

	};

	SubNavigation.render = function(key, activeIndex) {

		return new Chick.Actiz.SubNavigation(key).render(activeIndex);

	};



})();