'use strict';


/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
	var ua = window.navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
	   // IE 12 => return version number
	   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	// other browser
	return false;
}



(function($, _, Chick) {

	$(document).ready(function() {

		// Configure the API
		Chick.Net.Api.configure({
			baseUrl: '/content',
			urlSuffix: '.json'
		});

		// Get my namespace
		var ns = Chick.Actiz;

		// Browser detection
		var isIE = detectIE();
		$('html').toggleClass('ie', isIE !== false)
			.toggleClass('non-ie', isIE === false);

		// Local mobile detection
		var isMobile = window.innerWidth < 750;

		// Set jwplayer credentials
		window.jwplayer.key = 'zWxTzrA2T5xKdBuNpnNWgci5nrDoBpzKy/7VO+iBW9Y=';
		

		// Create the applicatioN
		var app = Chick.createApplication($('#main'), {

				baseUrl: '/',
				languageInUrl: false,

				classes: {
					app: 'actiz-application',
					interface: 'actiz-interface'			
				},

				i18n: {
					bundles: ['actiz']
				},

				router: {
					catchForms: false
				}

			})
			.routes(function() {

				this.languages(['nl']);

				this.get('/',  								{ controller: ns.PageController,		action: 'home' });
				
				this.get('/praktijk',						{ controller: ns.BlogController,		action: 'index' });
				this.get('/praktijk/mee-op-stage',			{ controller: ns.PageController,		action: 'meeOpStage' });
				this.get('/praktijk/:post',					{ controller: ns.BlogController,		action: 'show' });

				this.get('/experience',						{ controller: ns.ExperienceController,	action: 'index' });
				this.get('/experience/:case',				{ controller: ns.ExperienceController,	action: 'show' });

				this.get('/daarom-ouderenzorg/:page',		{ controller: ns.PageController,		action: 'daaromOuderenzorg' });

				this.get('/test-je-kennis',					{ controller: ns.QuizController,		action: 'index' });
				this.get('/test-je-kennis/start',			{ controller: ns.QuizController,		action: 'start' });

				this.get('/het-netwerk/:page',				{ controller: ns.PageController,		action: 'hetNetwerk' });

			

			})
			.errors({

				'404': function() {

					return Chick.Gui.View.make('errors/404');

				},

				'500': function(error) {

					return Chick.Gui.View.make('errors/500').withData('error', error);

				}

			})

			.on('ready', function() {

				// Create navigation
				this.nav = new ns.Navigation(this.$app.find('>nav'));
				
				// And social
				this.social = new ns.Social(this.$app.find('aside.social'));

				// ...and lastly the site header
				this.siteHeader = new ns.SiteHeader(this.$app.find('header.site'));

				// Create the flow that handles all layout issues
				this.flow = new ns.Flow(this);

			})

			.start();


		// Backend
		var isLocal = /\d/.test(window.location.hostname);
		app.isLocal = isLocal;
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


		// iOS clicking.
	    window.FastClick.attach(document.body);





	});

})(jQuery, _, Chick);