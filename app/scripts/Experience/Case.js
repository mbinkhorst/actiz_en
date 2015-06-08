'use strict';
(function(jw) { 

	function Case($element, info, aspectRatio) {
		
		// Localize
		var self = this;
		this.info = info;
		this.$element = $element;

		if (aspectRatio === undefined) aspectRatio = [16, 9];
		this.aspectRatio = aspectRatio;


		// Find elements.
		this.$header = $element.find('> header');
		this.$footer = $element.find('> footer');

		this.$video = $element.find('.video').attr('id', 'case-video');
		this.$hotspots = $element.find('.case ul.hotspots').hide();
		this.$textEvents = $element.find('.text-events li').hide();

		this.$videoState = $element.find('.videostate');
		this.$timeLeft = this.$element.find('.time-left');

		this.$hotspotsFound = $element.find('.clues-found');
		this.$hotspotBullets = $element.find('.gamestate .clues > li');

		this.$btnSkipIntro = $element.find('button.skip-intro');
		this.$btnBack = $element.find('button.back').hide();

		this.$gameOverScreen = $element.find('section.game-over').hide();
		this.$gameWonScreen = $element.find('section.game-won').hide();
		this.$questionScreens = $element.find('section.question').hide();
		this.$pausedScreen = $element.find('section.paused').hide();
		this.$helpScreen = $element.find('section.help').hide();
		this.$notSeenDossierScreen = $element.find('section.not-seen-dossier').hide();


		this.$btnHint = $element.find('nav.gameplay .hint > a');
		this.$btnStartQuiz = $element.find('nav.gameplay .start-quiz > a');

		this.$btnPlay = $element.find('.gamestate .play');
		this.$btnPause = $element.find('.gamestate .pause').hide();
		
		this.$btnHelp = $element.find('nav .help');
		this.$btnDossier = $element.find('nav .dossier');

		this.$btnRestart = $element.find('.cover .restart');

		this.$btnToggleFullscreen = $element.find('.toggle-fullscreen')
			.toggle(window.screenfull.enabled);
		

		this.$btnStartGame = $element.find('.start-game');


		this.$hintsIcon = $element.find('nav.gameplay .start-quiz .icon');

		// Video states
		this.currentScene = this.__getScene(this.info.flow.intro);
		this.hotspotsViewed = [];
		this.hintsViewed = [];
		this.questionsAnsweredCorrectly = 0;
		
		this.activeEvents = [];


		// Check if this is the first visit
		var key = 'hasSeenCase' + Chick.app.router.lastRequest.uri;
		if (localStorage[key] === undefined) {

			// Store it
			localStorage['hasSeenCase' + Chick.app.router.lastRequest.uri] = true;
			this.$btnSkipIntro.remove();
			
		} 


		// Initial state
		this.__setInitialState();
		
		// Setup events
		this.__setupListeners();

		// Create the video
		this.__createVideo();

		// Calculate main scene duration
		this.mainSceneDuration = (this.__getScene(this.info.flow.main).endsAt - this.__getScene(this.info.flow.main).startsAt);

		// For debugging, set a global var
		window.actizCase = this;
		/*this.$element.on('mousedown', function(e) {

			console.log('You clicked at:');
			console.log('"x": "' + (Math.round((e.clientX / self.$hotspots.outerWidth()) * 10000) / 100) + '%",\n' + 
				'"y": "' + (Math.round((e.clientY / self.$hotspots.outerHeight()) * 10000) / 100) + '%"');
		});*/

		// On resize
		Chick.app.on('resize', function() {
			self.__onResize();
		});
		this.__onResize();

		// Add periodic class to start-quiz button
		var toggleStartQuiz = function() {
			
			var animQueue = ['#42b7d0', '#ffffff', '#42b7d0', '#ffffff'],
				showNext = function() {
					var c = animQueue.shift();
					TweenLite.to(self.$btnStartQuiz, 1.2, {
						color: c,
						ease: Quad.easeInOut,
						onComplete: function() {
							if (animQueue.length > 0) showNext();
						}
					});
				};
			showNext();

			
		};
		window.setInterval(function() {
			toggleStartQuiz();			
		}, 15000);

		// Start it.
		this.$btnStartGame.on('click', function(e) {
			self.resumeVideo();
			self.$btnStartGame.hide();
		});


	}
	Chick.registerController('Actiz.Experience.Case', Case);


	///////////////////////
	// 'Private' methods //
	///////////////////////

	Case.prototype.__setInitialState = function() {

		this.__initialized = false;

		// Hide the header and footer
		TweenLite.set(this.$header, {
			y: -100
		});
		TweenLite.set(this.$footer, {
			y: 100
		});

		// And the skip button
		TweenLite.set(this.$btnSkipIntro, {
			y: 50,
			opacity: 0
		});


	};

	Case.prototype.__setupListeners = function() {

		// All the hot spots.
		var self = this;
		this.$hotspots.find('>li').on('click', function(e) {

			// Handle it.
			self.openHotspot($(this).data('hotspot'));

		});

		// Back button for hotspots
		this.$btnBack.on('click', function(e) {
			e.preventDefault();
			self.__toggleBackButton(false);
			self.gotoScene(self.info.flow.main, self.lastMainPosition);
		});


		// I want a hint.
		this.$btnHint.on('click', function(e) {

			// Get hint.			
			e.preventDefault();
			self.showHint();

		});

		// Fullscreen.
		if (window.screenfull.enabled) {
		
			// Listen to button
			this.$btnToggleFullscreen.on('click', function(e) {
				e.preventDefault();
				$(this).blur();
				self.toggleFullscreen();
			});

			document.addEventListener(window.screenfull.raw.fullscreenchange, function () {
				self.$btnToggleFullscreen.toggleClass('active', window.screenfull.isFullscreen);
			});

		}




		// Start the quiz.
		this.$btnStartQuiz.on('click', function(e) {

			e.preventDefault();

			// Did they find any hints?
			if (self.hotspotsViewed.length === 0) {

				// No cheating!
				self.lastMainPosition = self.player.getPosition();
				self.gotoScene(self.info.flow.noCheating);
		
			// Not yet seen the dossier?
			} else if (self.hasSeenDossier !== true) {

				// Show that.
				self.__toggleNotSeenDossier();

			} else {
				self.startQuiz();				
			}

		});

		// Not seen dossier buttons.
		this.$notSeenDossierScreen.find('.close, .dossier').on('click', function(e) {

			// Back to main screen.
			e.preventDefault();
			self.__toggleNotSeenDossier(false);

			// Dossier?
			if ($(this).is('.dossier')) {

				self.showDossier();

			} else {

				self.resumeVideo();

			}
		});


		// Answers to questions
		this.$questionScreens.find('.answers > *').on('click', function(e) {

			// Give the answer
			self.giveAnswer($(this).index());

		});

		// Back from questions
		this.$questionScreens.find('.back').on('click', function(e) {

			// Back to main screen.
			e.preventDefault();
			self.currentQuestion.$screen.hide();
			self.gotoScene(self.info.flow.main, self.lastMainPosition);

			if (window._gaq) { window._gaq.push(['_trackEvent', 'back-from-question']); }
		});


		// Play / pause
		this.$btnPlay.on('click', function(e) {
			e.preventDefault();
			self.pauseVideo();
		});
		this.$pausedScreen.on('click', function(e) {
			e.preventDefault();
			self.resumeVideo();
		});

		// Skip intro
		this.$btnSkipIntro.on('click', function(e) {
			
			if (window._gaq) { window._gaq.push(['_trackEvent', 'case-skip-intro']); }

			self.gotoScene(self.info.flow.skipIntro);
			self.$btnSkipIntro.hide();
		});

		// Restart.
		this.$btnRestart.on('click', function(e) {

			if (window._gaq) { window._gaq.push(['_trackEvent', 'case-restart']); }
			e.preventDefault();
			self.restart();
		});


		// HELP!!!
		this.$btnHelp.on('click', function(e) {
			e.preventDefault();
			self.showHelp();
		});

		// Dossier
		this.$btnDossier.on('click', function(e) {
			if (window._gaq) { window._gaq.push(['_trackEvent', 'case-dossier']); }
			e.preventDefault();
			self.showDossier();
		});



		// Hover for hotspots.
		if (!Modernizr.touch) {

			this.$hotspots.find('>li').on('mouseenter', function() {
				TweenLite.to($(this), 0.5, {
					opacity: 1,
					ease: Quad.easeInOut
				});
			}).on('mouseleave', function() {
				TweenLite.to($(this), 0.5, {
					opacity: 0,
					ease: Quad.easeInOut
				});
			});

		}



		// Share.
		this.$gameWonScreen.find('.social-share').on('click', function(e) {
			e.preventDefault();
			var $btn = $(this);

			// Get text for current case
			var node = self.info.translations + '.share',
				link = encodeURI(Chick.app.wwwUrl(I18n.get(node + '.link'))),
				data = {
					time: self.$timeLeft.first().text(),
					clues: self.hotspotsViewed.length
				},
				url;

			// Facebook?
			if ($btn.is('.facebook')) {
				window._gaq.push(['_trackEvent', 'scene-' + this.scene.key, 'Shared-FB']);
				// Create the link
				url = 'http://www.facebook.com/sharer/sharer.php?p[url]=' + link;
				window.open(url, 'share-facebook', 'width=600,height=400,left=100,top=100,toolbar=no');			

			} else if ($btn.is('.linkedin')) {
				window._gaq.push(['_trackEvent', 'scene-' + this.scene.key, 'Shared-LinkedIN']);
				// Create the link
				url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + link;
				window.open(url, 'share-linkedin', 'width=600,height=400,left=100,top=100,toolbar=no');			

			} else if ($btn.is('.twitter')) {
				window._gaq.push(['_trackEvent', 'scene-' + this.scene.key, 'Shared-Twitter']);
				url = 'http://twitter.com/share?text=' + I18n.get(node + '.twitter-message', data) + '&url=' + link;
				window.open(url, 'share-twitter', 'width=600,height=400,left=100,top=100,toolbar=no');			


			}


		});



	};




	Case.prototype.__createVideo = function() {

		// Random server prefix
		var servers = ['http://google.com', 'http://yahoo.com'],
			videoPath = this.info.video;
		if (!Chick.app.isLocal) {
		//	videoPath = servers[_.random(0, servers.length - 1)] + videoPath;
		}
		
		var self = this,
		options = {

			file: videoPath,
			image: Modernizr.touch ? this.info.poster : undefined,

			width: '100%',		
			aspectratio: this.aspectRatio.join(':'),
			
			autostart: !Modernizr.touch,
			controls: false,

 			//primary: 'flash', 

			skin: '/vendor/skins/bekle.xml',
			
			html5player: '/vendor/jwplayer.html5.js',
			flashplayer: '/vendor/jwplayer.flash.swf'
		};

		// Create jwplayer
		this.player = jw('case-video').setup(options)
	
			
		// When we are playing.
		.onTime(function(e) {

			// Are we currently in seek-mode?
			//console.log('seeking', self.isCurrentlySeeking, e.position);
			if (self.isCurrentlySeeking > 0) {

				// Check if the position is already within the scene that we are seeking
				if (e.position >= self.currentScene.startsAt && e.position <= self.currentScene.endsAt) {

					// Seeking is done, continue with game flow
					self.isCurrentlySeeking --;
					//console.log('done seeking', self.isCurrentlySeeking);

				}

				// Really done?
				if (self.isCurrentlySeeking === 0) {

					self.isCurrentlySeeking = false;

				} else {

					// Not yet completed seek action.
					return;

				}




			}

			// An event triggered?
			if (self.info.events !== undefined) {
				for (var key in self.info.events) {

					// Currently active?
					var ev = self.__getEvent(key);
					if (_.indexOf(self.activeEvents, key) !== -1) {

						// Has it passed?
						if (!(e.position >= ev.startsAt && e.position < ev.endsAt)) {

							// Hide it.
							self.__toggleEvent(ev.key, false);

						}

					} else {

						// Has it started?
						if (e.position >= ev.startsAt && e.position < ev.endsAt) {

							// Show it.
							self.__toggleEvent(ev.key, true);

						}

					}

				}
			}


			// Show time in the player.
			if (self.currentScene.key === self.info.flow.main) {
		
				self.__updateTime();

			}

			// Current scene ended?
			if (self.currentScene && self.currentScene.endsAt <= e.position) {
				//console.log('pos= '+e.position);
				//console.log('curscene= '+self.currentScene.key);
				//console.log('curscene-end= '+self.currentScene.endsAt);
				// Ended.
				self.__onSceneEnd(self.currentScene);

			}


		})

		// When a seek (gotoScene) has succeeded
		.onSeek(function(e) {
			
			// Only show the menu for the main scene
			self.__toggleMenu(self.currentScene.key === self.info.flow.main);

			// Hide events?
			if (self.currentScene.key === self.info.flow.main && self.activeEvents.length > 0) {
				while (self.activeEvents.length > 0) {
					self.__toggleEvent(self.activeEvents[0], false, false);
				}
			}

			// Only show intro button for intro
			self.__toggleSkipIntroButton(self.currentScene.key === self.info.flow.intro);
							
			// Update time in the player, in mainloop, coming from wrong answer to question1
			if (self.currentScene.key === self.info.flow.main) self.__updateTime();
			
			// First time to main scene?
			if (self.currentScene.key === self.info.flow.main && self.mainLoopStarted === undefined) {

				self.mainLoopStarted = true;
				self.__onStartMainLoop();

			} else {

				// Toggle hotspots depening on main scene or not
				self.__toggleHotspots(self.currentScene.key === self.info.flow.main);
				
			}

		})


		// When we start playing.
		.onPlay(function(e) {
			
			// First time?
			if (self.__initialized === false) {
				self.__initialized = true;

				// Goto intro
				self.gotoScene(self.info.flow.intro);

			}

		});

	};


	Case.prototype.__onSceneEnd = function(scene) {
		
		// Scene completed track./
		if (window._gaq) {
			window._gaq.push(['_trackEvent', 'scene-' + scene.key, 'ended']);
		}


		// Was it the main scene?
		if (this.info.flow.main === scene.key) {
			//console.log('nu in main, maar tijd op');
			this.gotoScene(this.info.flow.gameOver);
			return;
		}

		// Game over scene over?
		if (this.info.flow.gameOver === scene.key) {
			//console.log('nu in gameover');
			// Goto game over state.
			this.showGameOver();
			return;

		}

		// Intro over?
		if (this.info.flow.intro === scene.key) {

			// Hide intro button
			this.__toggleSkipIntroButton(false);

			// Goto skip intro scene
			this.gotoScene(this.info.flow.skipIntro);
			return;

		}

		// Second intro over?
		if (this.info.flow.skipIntro === scene.key) {

			// Goto main scene
			this.gotoScene(this.info.flow.main);
			return;

		}

		// Are we in the questions part of the flow?
		if (this.currentQuestion) {

			// End of and intro?
			if (this.currentQuestion.scenes.intro === scene.key) {

				// Show that screen
				this.showQuestion(this.currentQuestion.index);
				return;

			}

			// Right/wrong?
			if (this.currentQuestion.scenes.right === scene.key || this.currentQuestion.scenes.wrong === scene.key) {

				// added michel
				if (this.currentQuestion.index === 0 && this.currentQuestion.scenes.wrong === scene.key){
					
					// if q1 is wrong, goto lastMainPosition
					this.gotoScene(this.info.flow.main, this.lastMainPosition);					
					return;

				} else {

					// Show question
					this.gotoQuestion();
					return;
				}
				
			}

		}

		// Return to main scene
		this.gotoScene(this.info.flow.main, this.lastMainPosition);
		this.$btnBack.hide();
		this.lastMainPosition = undefined;


	};


	Case.prototype.__convertToSeconds = function(sTime) {

		// Preg it.
		var result = /^(\d+)m(\d+)(\.(\d{3}))?/.exec(sTime),
		minutes = parseInt(result[1]),
		seconds = parseInt(result[2]),
		ms = result[4] !== undefined ? parseInt(result[4]) : 0;
		//console.log(minutes * 60 + seconds + (ms * 0.001));
		return minutes * 60 + seconds + (ms * 0.001);

	};

	Case.prototype.__updateHintsIcon = function() {

		// Apply it.
		this.$hintsIcon.removeClass('icon-lamp0')
			.removeClass('icon-lamp1')
			.removeClass('icon-lamp2')
			.removeClass('icon-lamp3')
			.addClass('icon-lamp' + this.hintsViewed.length);

		// Enable/disable button
		this.$btnHint.parent().toggleClass('disabled', this.hintsViewed.length === this.info.hints.length);

	};

	Case.prototype.__updateHotspotIcons = function() {

		// Show the # of viewed hotspots
		var self = this;
		this.$hotspotBullets.each(function(index, el) {
			$(el).toggleClass('found', index < self.hotspotsViewed.length);
		});

		// Set textual variant as well
		this.$hotspotsFound.text(this.hotspotsViewed.length + '/' + _.size(self.info.hotspots));


	};

	Case.prototype.__updateTime = function() {

		// Get seconds since main loop started and percentage of main scene played
		var secondsInGame = this.player.getPosition() - this.__getScene(this.info.flow.main).startsAt,
			percOfGame = secondsInGame / this.mainSceneDuration,
			deciSecondsLeft = Math.ceil((this.info.gameDuration * 10) * (1 - percOfGame));

		// Convert to mm:ss format
		var deciSecs = deciSecondsLeft,
			secs = Math.floor(deciSecs / 10),
			mins = '' + Math.floor(secs / 60);
		secs = '' + (secs % 60);
		deciSecs = '' + (deciSecs - (mins * 600) - (secs * 10));
		
		if (secs.length === 1) secs = '0' + secs;
		if (mins.length === 1) mins = '0' + mins;
		
		var randomnumber = Math.floor(Math.random() * (9 - 1 + 1) ) << 0;
		
		// Apply.
		this.$timeLeft.text(mins + ':' + secs + ':' + deciSecs + randomnumber);

	};


	Case.prototype.__toggleEvent = function(key, show, animate) {

		// Get the event
		var ev = this.__getEvent(key);

		// Hide or show?
		if (show === false) {

			// Remove it from active events
			this.activeEvents = _.without(this.activeEvents, key);

			// Text?
			if (ev.type === 'text') {

				// Hide it
				if (animate === false) {

					ev.$element.hide();

				} else {
				
					TweenLite.to(ev.$element, 0.25, {
						y: -20, 
						opacity: 0,
						ease: Quad.easeIn,
						onComplete: function() {
							ev.$element.hide();
						}
					});

				}

			}

		} else {

			// Add to active events
			this.activeEvents.push(key);
			
			// Text?
			if (ev.type === 'text') {

				// Fade it in.
				ev.$element.position({
					opacity: 0,
					y: 20
				});
				TweenLite.to(ev.$element, 0.5, {
					y: 0,
					opacity: 1,
					ease: Quad.easeInOut
				});


			}
			
			
		}




	};


	Case.prototype.__toggleMenu = function(show) {

		// Show/hide header and footer
		TweenLite.to(this.$header, show === false ? 0.4 : 0.9, {
			y: show === false ? -100 : 0,
			ease: Quad.easeInOut,
			delay: 0.2
		});
		TweenLite.to(this.$footer, show === false ? 0.4 : 0.9, {
			y: show === false ? 100 : 0,
			ease: Quad.easeInOut
		});
		
	};

	Case.prototype.__toggleBackButton = function(show, delay) {

		// Default values
		if (show === undefined) show = true;
		if (delay === undefined) delay = 0;

		// Fade it.
		if (show) {
			
			// Show it.
			this.$btnBack.position({
				opacity: 0
			});
			TweenLite.to(this.$btnBack, 0.4, {
				opacity: 1,
				delay: delay
			});

		} else {

			// Just hide.
			this.$btnBack.hide();

		}

	};


	Case.prototype.__toggleSkipIntroButton = function(show, delay) {

		// Default values
		if (show === undefined) show = true;
		if (delay === undefined) delay = 0;

		// Fade it.
		if (show) {
		
			// Show it.
			this.$btnSkipIntro.position({
				opacity: 0
			});
			TweenLite.to(this.$btnSkipIntro, 0.4, {
				opacity: 1,
				delay: delay
			});

		} else {

			// Just hide.
			this.$btnSkipIntro.hide();

		}

	};





	Case.prototype.__toggleHotspots = function(show, showAnimation, showDelay) {


		// Show the hotspots and position them
		this.$hotspots.toggle(show);
		if (show !== false)	Chick.app.flow.positioner.apply(this.$hotspots);
		
		// Show animation?
		if (show !== false && showAnimation === true && Modernizr.touch === false) {
			
			// Show intro animation (for non-touch only)
			var elements = [];
			this.$hotspots.find('[data-hotspot]').each(function() {
				elements.push($(this));
			});
			elements = _.shuffle(elements);

			// Show delay?
			if (showDelay === undefined) showDelay = 10;

			_.each(elements, function($el, index) {

				TweenLite.to($el, 0.3, {
					opacity: 1,
					ease: Quad.easeInOut,

					delay: showDelay + index * 0.1,

					onComplete: function() {

						TweenLite.to($el, 0.3, {
							opacity: 0,
							ease: Quad.easeInOut,

							delay: 0.5
						});

					}

				});

			});




		}

	};

	Case.prototype.__getHotspot = function(key) {

		// Already converted?
		if (this.info.hotspots[key].key === undefined) {
			this.info.hotspots[key].key = key;
			this.info.hotspots[key].$button = this.$hotspots.find('[data-hotspot=' + key + ']');
		}
		return this.info.hotspots[key];

	};

	Case.prototype.__getEvent = function(key) {

		// Already converted?
		if (this.info.events[key].key === undefined) {
			
			// Basics
			this.info.events[key].key = key;
			this.info.events[key].startsAt = this.__convertToSeconds(this.info.events[key].startsAt);
			this.info.events[key].endsAt = this.__convertToSeconds(this.info.events[key].endsAt);

			// Find element.
			if (this.info.events[key].type === 'text') {
				this.info.events[key].$element = this.$textEvents.filter('[data-event=' + key + ']');
			}


		}
		return this.info.events[key];

	};


	Case.prototype.__getScene = function(key) {

		// Already converted?
		if (typeof this.info.scenes[key].startsAt === 'string') {
			this.info.scenes[key].startsAt = this.__convertToSeconds(this.info.scenes[key].startsAt);
			this.info.scenes[key].endsAt = this.__convertToSeconds(this.info.scenes[key].endsAt);
			this.info.scenes[key].key = key;
		}
		return this.info.scenes[key];

	};

	Case.prototype.__getQuestion = function(index) {

		// Already enriched?
		if (this.info.questions[index].$screen === undefined) {
			this.info.questions[index].index = index;
			this.info.questions[index].$screen = this.$questionScreens.filter('[data-question=' + index + ']');
		}

		return this.info.questions[index];

	};

	Case.prototype.__toggleScreen = function($screen, show) {

		// Show/hide screen
		if (show === false) {

			// Fade out.
			TweenLite.to($screen, 0.4, {
				opacity: 0,
				onComplete: function() {
					$screen.hide();					
				}
			});

			// No more screen.
			this.$currentScreen = undefined;

		} else {

			// Fade in and reposition
			$screen.position({
				opacity: 0
			});
			TweenLite.to($screen, 0.5, {
				opacity: 1
			});
			
			// Store it.
			this.$currentScreen = $screen;

		}

		// Track it?
		if (window._gaq) {
			var track = $screen.data('track');
			if (track) {
				window._gaq.push(['_trackEvent', 'overlay-' + track, show === false ? 'hide' : 'show']);
			}
		}

	};

	Case.prototype.__toggleNotSeenDossier = function(show) {

		// Main toggle
		this.__toggleScreen(this.$notSeenDossierScreen, show);
		
		// Showing?
		if (show !== false) {

			// Pause!
			this.pauseVideo(false);

		}


	};

	Case.prototype.__onStartMainLoop = function() {

		// First time ever?
		var key = 'hasSeenHelp',
			self = this;
		if (localStorage[key] === undefined) {

			// Show help first.
			localStorage[key] = true;
			this.showHelp().then(function() {

				// When help is closed, show the hotspots with animatino
				self.__toggleHotspots(true, true);

			});

		} else {

			// Show hotspots now with an animation
			self.__toggleHotspots(true, true);

		}


	};


	Case.prototype.__onResize = function() {

		// Make screens as big as video.
		this.$element.css({
			width: $(window).width(),
			height: Math.min($(window).width() * (this.aspectRatio[1] / this.aspectRatio[0]), $(window).height())
		});

	};


	Case.prototype.__createDossier = function() {

		// Already done?
		if (this.__promiseDossier !== undefined) return  this.__promiseDossier;

		// Load the template
		this.__promiseDossier = Chick.promise();
		var self = this;
		var view = new Chick.Gui.View('experience/dossier').withData(this.info);
		view.render().then(function() {

			// Add it
			self.$dossier = $('<section class="dossier cover"></section>').appendTo(self.$element).html(
				view.$element.html()
			);
			self.__promiseDossier.resolve(self.$dossier);

		});


		return this.__promiseDossier;

	};

	Case.prototype.__createPlan = function() {

		// Already done?
		if (this.__promisePlan !== undefined) return  this.__promisePlan;

		// Load the template
		this.__promisePlan = Chick.promise();
		var self = this;
		var view = new Chick.Gui.View('experience/plan').withData(this.info);
		view.render().then(function() {

			// Add it
			self.$dossier = $('<section class="plan cover"></section>').appendTo(self.$element).html(
				view.$element.html()
			);
			self.__promisePlan.resolve(self.$dossier);

		});


		return this.__promisePlan;

	};



	////////////////////
	// Public methods //
	////////////////////

	Case.prototype.pauseVideo = function(showPausedScreen) {

		// Switch buttons
		this.$btnPlay.hide();
		this.$btnPause.show();

		// Actual pausing.
		if (this.player.getState() === 'PLAYING') this.player.pause();

		// Hide navi
		this.__toggleMenu(false);

		// Show the screen
		if (showPausedScreen !== false) this.__toggleScreen(this.$pausedScreen);

	};

	Case.prototype.resumeVideo = function() {

		// Switch buttons
		this.$btnPlay.show();
		this.$btnPause.hide();

		// Actual playing.
		this.player.play();

		// Show 'n hide.
		this.__toggleMenu(true);
		this.__toggleScreen(this.$pausedScreen, false);

	};

	Case.prototype.toggleFullscreen = function(fullScreen) {

		// Yes or no?
		if (fullScreen === undefined) {

			// Check current state
			fullScreen = !window.screenfull.isFullscreen;

		}

		// Now toggle.
		window.screenfull.toggle();


	};


	Case.prototype.gotoScene = function(key, position) {

		// Leaving main loop?
		if (this.currentScene && this.currentScene.key === this.info.flow.main) {

			// Remember current position
			this.lastMainPosition = this.player.getPosition();

		}

		// Set as current scene
		this.currentScene = this.__getScene(key);

		// Track it.
		if (window._gaq) {
			window._gaq.push(['_trackEvent', 'scene-' + key, 'started']);
		}


		// Seek the position
		if (position === undefined) position = this.currentScene.startsAt;
		//console.log('start seek');
		this.isCurrentlySeeking = 2;
		this.player.seek(position);

	};


	Case.prototype.openHotspot = function(hotspot) {

		var self = this;

		// Look it up.
		if (typeof hotspot === 'string') hotspot = this.__getHotspot(hotspot);

		// Show the back button
		this.__toggleBackButton(true, 2);		

		// Set to seen.
		hotspot.$button.addClass('seen');

		// Goto the scene
		this.gotoScene(hotspot.scene);

		// Add to viewed hotspots
		if (_.indexOf(this.hotspotsViewed, hotspot.key) === -1) this.hotspotsViewed.push(hotspot.key);
		this.__updateHotspotIcons();

		// Is this linked to a hint?
		for (var q = 0; q < this.info.hints.length; q++) {

			if (this.info.hints[q].hotspot === hotspot.key) {

				// Already in there?
				if (_.indexOf(this.hintsViewed, q) === -1) {
					this.hintsViewed.push(q);
				}

				this.__updateHintsIcon();
				break;
			}

		}

	};

	Case.prototype.showHint = function() {

		// Check if there are hints left
		if (this.hintsViewed.length === this.info.hints.length) return;

		// Remember current position
		this.lastMainPosition = this.player.getPosition();		

		// Get first non-viewed hint
		var index;
		for (var q = 0; q < this.info.hints.length; q++) {

			// Not viewed?
			if (_.indexOf(this.hintsViewed, q) === -1) {
				index = q;
				break;
			}

		}

		// Show the back button
		this.__toggleBackButton(true, 2);

		// Show it.
		var hint = this.info.hints[index];
		this.gotoScene(hint.scene);
		
		// Update shown hints.
		this.__updateHintsIcon();

	};


	Case.prototype.showGameOver = function() {

		// Stop video.
		this.player.pause();

		// Show game over screen
		this.__toggleScreen(this.$gameOverScreen);
	
	};

	Case.prototype.showGameWon = function() {

		// Show game over screen
		this.__toggleScreen(this.$gameWonScreen);
		
	};

	Case.prototype.startQuiz = function() {

		// Go there.
		this.gotoQuestion(0);

	};

	Case.prototype.gotoQuestion = function(index) {

		// All answered correctly?
		if (this.questionsAnsweredCorrectly === this.info.questions.length) {

			// Show result
			this.showPlan();
			return;

		}

		// Question given?
		if (index === undefined) index = this.questionsAnsweredCorrectly;

		// Get the question
		this.currentQuestion = this.__getQuestion(index);

		// Intro for this question?
		if (this.currentQuestion.scenes.intro === false) {

			// Show it now.
			this.showQuestion(index);

		} else {

			// Show the intro
			this.gotoScene(this.currentQuestion.scenes.intro);

		}




	};

	Case.prototype.showQuestion = function(index) {

		// Question given?
		if (index === undefined) index = this.questionsAnsweredCorrectly;

		// Pause the video
		this.player.pause();

		// Get the question
		this.currentQuestion = this.__getQuestion(index);

		// Show the screen
		this.__toggleScreen(this.currentQuestion.$screen);

	};

	Case.prototype.giveAnswer = function(index) {

		// Hide question
		this.currentQuestion.$screen.hide();

		// Correct?
		var isCorrect = index === this.currentQuestion.answers[1];
		if (isCorrect) this.questionsAnsweredCorrectly++;

		// Show scene
		this.gotoScene(isCorrect ? this.currentQuestion.scenes.right : this.currentQuestion.scenes.wrong);


	};

	Case.prototype.showHelp = function() {

		// Disable header
		this.$header.addClass('disabled');
		this.$footer.addClass('disabled');
		this.$btnHelp.addClass('active');

		// Show help screen
		this.__toggleScreen(this.$helpScreen);

		// Pause video
		this.player.pause();

		// Click to close
		var self = this,
			promise = Chick.promise();
		this.$helpScreen.one('click', function(e) {
			e.preventDefault();

			// Hide again
			self.__toggleScreen(self.$helpScreen, false);
			self.$header.removeClass('disabled');
			self.$footer.removeClass('disabled');

			// Back to normal
			self.player.play();

			self.$hotspots.find('>li').first().removeClass('visible');

			// Remove active
			self.$btnHelp.removeClass('active');

			promise.resolve();

		});

		return promise;


	};



	Case.prototype.restart = function() {

		// Reset status vars
		this.hotspotsViewed = [];
		this.hintsViewed = [];
		this.questionsAnsweredCorrectly = 0;
		this.hasSeenDossier = false;

		// Hide any showing screen
		if (this.$currentScreen !== undefined) {
			this.__toggleScreen(this.$currentScreen, false);
		}

		// Update it in screen
		this.__updateHintsIcon();
		this.__updateHotspotIcons();

		// MB: reset hotspots 'seen' class
		this.$hotspots.find('>li').removeClass('seen');


		// Back to the intro.
		this.gotoScene(this.info.flow.intro);


	};

	Case.prototype.showDossier = function() {

		// We've seen it now.
		this.hasSeenDossier = true;

		// What type of dossier?
		if (typeof this.info.dossier === 'object' && this.info.dossier.scene !== undefined) {

			// Goto that scene
			this.gotoScene(this.info.dossier.scene);

			// Show the back button
			this.__toggleBackButton(true, 2);

			return;

		}

		// Hide menu
		this.pauseVideo(false);

		// When the dossier is there
		var self = this;
		this.__createDossier().then(function($dossier) {

			// Fade in layer
			TweenLite.fromTo($dossier, 0.5, {
				opacity: 0
			}, {
				opacity: 1
			});
			$dossier.show();

			// Position the article
			var $article = $dossier.find('> *');
			$article.position({
				y: $(window).outerHeight(),
				opacity: 1
			});

			TweenLite.to($article, 0.6, {
				y: 0,
				ease: Quad.easeInOut
			});

			// The closer
			$article.find('.close').one('click', function(e) {

				// Close it up.
				e.preventDefault();
				TweenLite.to($article, 0.35, {
					y: $(window).outerHeight(),
					ease: Quad.easeIn
				});
				TweenLite.to($dossier, 0.5, {
					opacity: 0,
					delay: 0.3,
					onComplete: function() {

						$dossier.hide();
						
					}
				});

				// Back to normal
				//self.player.play();
				// resume video ipv play, so pauzemenu/state gets reset
				self.resumeVideo();
				self.__toggleMenu();


			});



		});
		
	};

	Case.prototype.showPlan = function() {

		// Hide menu
		this.pauseVideo(false);

		// When the dossier is there
		var self = this;
		this.__createPlan().then(function($dossier) {

			// Fade in layer
			TweenLite.fromTo($dossier, 0.5, {
				opacity: 0
			}, {
				opacity: 1
			});
			$dossier.show();

			// Position the article
			var $article = $dossier.find('> *');
			$article.position({
				y: $(window).outerHeight(),
				opacity: 1
			});

			TweenLite.to($article, 0.6, {
				y: 0,
				ease: Quad.easeInOut
			});

			// The closer
			$article.find('.continue').one('click', function(e) {

				// Close it up.
				e.preventDefault();
				TweenLite.to($article, 0.35, {
					y: $(window).outerHeight(),
					ease: Quad.easeIn
				});
				TweenLite.to($dossier, 0.5, {
					opacity: 0,
					delay: 0.3,
					onComplete: function() {

						$dossier.hide();
						
					}
				});

				// Done.
				self.showGameWon();


			});



		});
		
	};



})(window.jwplayer);
