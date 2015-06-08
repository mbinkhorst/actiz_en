(function() {
	'use strict';

	function Flow(app) {
	
		// Localize
		this.app = app;

		// Create the positioner
		this.positioner = new Chick.Actiz.Positioner();
		

		// Bind view events
		var self = this;
		Chick.Gui.View.any.on('render', function(view) { self.onViewRender(view); });
		Chick.Gui.View.any.on('ready', function(view) { self.onViewReady(view); });

		// App events
		this.app.on('resize', function() { 
			self.onAppResize(self.app); 
		});



	}
	Chick.register('Actiz.Flow', Chick.Core.TriggerClass, Flow);


	Flow.prototype.onAppResize = function(app) {

		// Set me to be full size.
		app.$app.css({
			width: window.innerWidth,
			height: window.innerHeight
		});

		// Positioner?
		if (this.positioner && this.positioner.$target) {
			var self = this;
			window.setTimeout(function() {
				self.positioner.apply();
			}, 10);
		}

	};




	/**
	 * Generic preparations for view, before the content is added to the view
	 */
	Flow.prototype.onViewRender = function(view) {

		// Hide it.
		TweenLite.set(view.$element, {
			opacity: 0
		});


	};

	/**
	 * Generic intro animation for all views
	 */
	Flow.prototype.onViewReady = function(view) {

		// Position elements in the view
		this.positioner.setTarget(view.$element).apply();

		// Track url
		if (window._gaq) {
			window._gaq.push(['_trackPageview']);
		}

		// Only navigation for non-experience pages
		if (/^\/experience\/[a-z]/.test(Chick.app.router.lastRequest.uri)) {
			this.app.nav.hide();
		} else {
			this.app.nav.show(0.9);									
		}
		if (/^\/experience/.test(Chick.app.router.lastRequest.uri)) {
			this.app.social.hide();
			this.app.siteHeader.hide();
		} else {
			this.app.social.show(0.9);						
			this.app.siteHeader.show(0.9);
		}

		// Fade it in.
		TweenLite.to(view.$element, 0.5, {
			opacity: 1,
			ease: Quad.easeOut
		});



	};




})();