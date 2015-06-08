'use strict';
(function() {

	function BlogController() {
	
	}
	Chick.registerController('Actiz.BlogController', BlogController);




	BlogController.prototype.index = function() {

		var view = Chick.Gui.View.make('blog/index')

			.withCollection('posts', Chick.api('/posts'), function(result) {

				// Collect authors
				var foundIds = [], self = this;
				this.data.authors = new Chick.Core.Collection(Chick.Models.Author);
				result.each(function(item) {
					
					// Already found
					if (_.indexOf(foundIds, item.get('author.id')) !== -1) return false;
					foundIds.push(item.get('author.id'));
					
					// Add it, and his/her latest article
					var author = item.get('author');
					author.latestPost = item;
					self.data.authors.add(author);

				});

	
			})

			.on('ready' ,function() {

				
				
			})

			.on('leave', function(newRequest) {


			});

		return view;

			//.waitForLeaveAnimation();

	};


	BlogController.prototype.show = function(slug) {

		var view = Chick.Gui.View.make('blog/show')

			.withCollection('posts', Chick.api('/posts'), function(result) {

				// No post by this name?
				this.data.post = result.findBy('slug', slug);
				if (this.data.post === undefined) {
					return false;
				}

				// Find author's other posts
				var self = this;
				this.data.otherPosts = result.filter(function(post) {
					return post.get('author.id') === self.data.post.get('author.id') && 
						post.get('id') !== self.data.post.get('id');
				});

				
			})

			.on('ready' ,function() {
				
				// Toggle!
				this.$element.find('.bio .toggle').on('click', function(e) {

					e.preventDefault();

					// Open it up.
					var $bio = view.$element.find('.bio'),
						$details = $bio.find('.details');

					$bio.addClass('open');
					var toHeight = $details.outerHeight();
					
					TweenLite.fromTo($details, 0.4, {
						height: 25
					}, {
						height: toHeight,
						ease: Quad.easeInOut
					});

				});

				// Wait a while for this, because it takes up cpu-power needed for intro animations.
			//	window.setTimeout(function() {
					
					 /* * * CONFIGURATION VARIABLES * * */
					// Required: on line below, replace text in quotes with your forum shortname
					window.disqus_shortname = 'daarzitmeerachter';
					window.disqus_title = 'HBO-V in de ouderenzorg - Daar zit meer achter';
					
					// Set urlheb
					var href = window.location.href;
					window.disqus_identifier = href;
					window.disqus_url = href;

					
					/* * * DON'T EDIT BELOW THIS LINE * * */
					(function() {
						var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
						dsq.src = '//' + window.disqus_shortname + '.disqus.com/embed.js';
						(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
					})();


//				}, 3000);

				var sharePopup = function(url){
					var width = 600;
					var height = 400;
				   
					var leftPosition, topPosition;
					leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
					topPosition = (window.screen.height / 2) - ((height / 2) + 50);

					var windowFeatures = 'status=no,height=' + height + ',width=' + width + ',resizable=yes,left=' + leftPosition + ',top=' + topPosition + ',screenX=' + leftPosition + ',screenY=' + topPosition + ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no';

					window.open(url,'Social Share', windowFeatures);
				};
				
				
				// Share buttons
				this.$element.find('.share a').on('click', function(e) {
					e.preventDefault();

					// Platform
					var platform = $(this).data('share'),

					// Collect values from model
					title = view.data.post.get('title'),
					url = 'http://www.daarzitmeerachter.nl/content/' + view.data.post.get('slug') + '.html',
					description = view.data.post.get('description');

					// Create the window
					switch(platform) {

						case 'facebook': 
							sharePopup('http://www.facebook.com/sharer.php?u='+encodeURIComponent(url)+'&t='+encodeURIComponent(title));
							break;

						case 'twitter': 
							sharePopup('http://twitter.com/share?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title)+'&via=Daarzitmeer8er');
							break;

						case 'linkedin': 
						    sharePopup('http://www.linkedin.com/shareArticle?mini=true&url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title)+'&summary='+encodeURIComponent(description)+'&source='+encodeURIComponent('http://www.daarzitmeerachter.nl')+'');
							break;

					}

				});


				
			})

			.on('leave', function(newRequest) {


			});

		return view;



	};




})();
