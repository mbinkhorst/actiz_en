'use strict';
(function() {

	function ExperienceController() {
	
	}
	Chick.registerController('Actiz.ExperienceController', ExperienceController);



	// GET /experience
	ExperienceController.prototype.index = function() {


		return Chick.Gui.View.make('experience/index')

			// Preload the case backgrounds
			.preloadImages(_.map(I18n.get('cases'), function(item) {
				return item.background;
			}))

			.on('ready' ,function() {

				// Create the case selector
				var view = this;
				this.caseSelector = new Chick.Actiz.CaseSelector(this.$element.find('.case-selector'));

				// Get elements
				this.$intro = this.$element.find('.intro');
				this.$introHeader = this.$intro.find('h2,h3,h4');
				this.$introText = this.$intro.find('p');
				this.$introButtons = this.$intro.find('.buttons');

				// Show intro
				TweenLite.fromTo(this.$introHeader, 0.4, {
					rotationX: -30,
					y: -40, 
					opacity: 0
				}, {
					rotationX: 0,
					y: 0,
					opacity: 1,
					delay: 0.5,
					ease: Back.easeOut
				});

				TweenLite.fromTo(this.$introText, 0.4, {
					rotationX: 30,
					y: 40,
					opacity: 0
				}, {
					rotationX: 0,
					y: 0,
					opacity: 1,
					delay: 0.7,
					ease: Back.easeOut
				});

				
				TweenLite.fromTo(this.$introButtons, 0.4, {
					rotationX: 30,
					y: 20,
					opacity: 0
				}, {
					rotationX: 0,
					y: 0,
					opacity: 1,
					delay: 0.8,
					ease: Back.easeOut
				});




				// When clicked.
				this.$intro.find('button').on('click', function(e) {

					// Then fade it all out.
					TweenLite.to(view.$introHeader, 0.3, {
						y: -70,
						ease: Quad.easeIn
					});
					TweenLite.to(view.$introText, 0.3, {
						y: 70,
						ease: Quad.easeIn
					});
					TweenLite.to(view.$introButtons, 0.3, {
						y: 70,
						ease: Quad.easeIn
					});
					TweenLite.to(view.$intro, 0.5, {
						opacity: 0,
						delay: 0.2,
						onComplete: function() {
							view.$intro.hide();
						}
					});

				});



				
			})

			.on('leave', function() {

				

			});


	};


	// GET /experience/:key
	ExperienceController.prototype.show = function(key) {

		// Load the case info.		
		return Chick.Gui.View.make('experience/show')

			.withJson(Chick.url('cases/' + key + '.json'))

			.on('ready', function() {

				// Create the case!
				this.myCase = new Chick.Actiz.Experience.Case(this.$element, this.data);

			});

	};





})();
