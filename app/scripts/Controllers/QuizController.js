'use strict';
(function() {

	function QuizController() {
	
	}
	Chick.registerController('Actiz.QuizController', QuizController);




	QuizController.prototype.index = function() {

		var view = Chick.Gui.View.make('quiz/index')

			.on('ready' ,function() {

				
				
			})

			.on('leave', function(newRequest) {


			});

		return view;

			//.waitForLeaveAnimation();

	};


	QuizController.prototype.start = function() {

		var view = Chick.Gui.View.make('quiz/start')

			
			.on('ready' ,function() {
				
				// Create component
				this.quiz = new Chick.Actiz.Quiz(this.$element);
			
				
			})

			.on('leave', function(newRequest) {


			});

		return view;



	};




})();
