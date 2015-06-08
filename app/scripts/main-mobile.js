'use strict';

(function($, _, Chick) {

	$(document).ready(function() {

		// Configure the API
		Chick.Net.Api.configure({
			baseUrl: '/content',
			urlSuffix: '.json'
		});

		// Get my namespace
		var ns = Chick.Actiz;

		// Create the applicatioN
		var app = Chick.createApplication($('#main'), {

				baseUrl: '/',
				languageInUrl: false,

				classes: {
					app: 'actiz-application',
					interface: 'actiz-interface'			
				},

				i18n: {
					bundles: ['actiz', 'actiz-mobile']
				},

				router: {
					catchForms: false
				}

			})
			.routes(function() {

				this.languages(['nl']);

				this.get('/m/',  								{ controller: ns.Mobile.PageController,			action: 'show' });

				this.get('/m/praktijk',  						{ controller: ns.Mobile.BlogController,			action: 'index' });
				this.get('/m/praktijk/bloggers/:slug', 			{ controller: ns.Mobile.BlogController,			action: 'showAuthor' });
				this.get('/m/praktijk/:slug', 					{ controller: ns.Mobile.BlogController,			action: 'show' });

				this.get('/m/:page',							{ controller: ns.Mobile.PageController,			action: 'show' });
						
			

			})
			.errors({

				'404': function() {

					return Chick.Gui.View.make('errors/404-mobile');

				},

				'500': function(error) {

					return Chick.Gui.View.make('errors/500').withData('error', error);

				}

			})

			.on('ready', function() {

				// The site header
				this.siteHeader = new ns.SiteHeader(this.$app.find('header.site'), false);
				
				// Create navigation
				this.nav = new ns.Mobile.Navigation(this.$app.find('>.slider'));				



			})

			.start();


		// Backend
		var isLocal = /\d/.test(window.location.hostname);
		app.backendUrl = function(uri) {
			return 'http://admin.daarzitmeerachter' + (isLocal ? '.local' : '.nl') + uri;
		};

		app.wwwUrl = function(uri) {
			return (isLocal ? 'http://demo.daarzitmeerachter.nl' : 'http://' + window.location.hostname) + uri;
		};


		// Any api call error?
		Chick.Net.ApiCall.any.on('error', function(xhr) {

			// Json?
			Chick.app.abort(500, xhr.responseJSON);

		});

		// When a view is shewn
		Chick.Gui.View.any.on('ready', function(view) { 

			// Scroll on up.
			app.$interface.scrollTop(0);

			// Track url
			if (window._gaq) {
				window._gaq.push(['_trackPageview']);
			}

		});







	});

})(jQuery, _, Chick);