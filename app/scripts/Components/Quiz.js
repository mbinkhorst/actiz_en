'use strict';
(function() {


	function Quiz($element) {
	
		// Localize.
		this.$element = $element;
		var self = this;

		// State
		this.categories = {};
		this.currentQuestion = false;

		// Find result
		this.$quizResult = $element.find('article.result');

		// Find questions
		this.questions = [];
		var data = I18n.get('test-je-kennis.questions');
		this.$questions = $element.find('article.question').each(function(index, el) {

			// Create
			var question = {
				index: index,
				info: data[index],
				$element: $(el),
				$answers: $(el).find('.answers > li'),
				$answersResult: $(el).find('.answers.show'),
				$result: $(el).find('.result')
			};
			self.questions.push(question);

			// Check cat
			var cat = question.info.category;
			if (self.categories[cat] === undefined) {
				self.categories[cat] = {
					correct: 0,
					total: 1
				};
			} else {
				self.categories[cat].total++;
			}

		}).hide();

		// Show question
		this.showQuestion(0);

		// Listen!
		this.__createListeners();


		// Debug!
		window.actizQuiz = this;

	}
	Chick.register('Actiz.Quiz', Chick.Core.TriggerClass, Quiz);



	///////////////////////
	// "Private" methods //
	///////////////////////

	Quiz.prototype.__createListeners = function() {

		// Select an answer...
		var self = this;
		this.$questions.find('.answers > li').on('click', function(e) { 

			// Select answer.
			self.chooseAnswer($(this).index());

		});

		// Next!
		this.$questions.find('button.next').on('click', function(e) {

			// Show next q
			self.showQuestion(self.currentQuestion + 1);	

		});

		// Finish.
		this.$questions.find('button.finish').on('click', function(e) {

			// Finish up.
			self.showQuizResult();

		});

	};




	////////////////////
	// Public methods //
	////////////////////

	Quiz.prototype.showQuestion = function(index) {

		// Hide current?
		var delay = 0;
		if (this.currentQuestion !== false) {

			// Hide it
			var $q = this.questions[this.currentQuestion].$element;
			$q.hide();
			
		}

		// Don't show?
		this.currentQuestion = index;
		if (index === false) { return; }

		// Show it.
		this.questions[index].$element.show();

	};

	Quiz.prototype.chooseAnswer = function(index) {

		// Right?
		var q = this.questions[this.currentQuestion],
			isCorrect = index === q.info.correct;

		// Show correct answer in different list
		var $correctAnswer = $(q.$answers[q.info.correct]);
		$correctAnswer
			.clone()
			.addClass('correct')
			.appendTo(q.$answersResult);

		// Not right?
		if (!isCorrect) {

			// Add selected answer to result too
			var $chosenAnswer = $(q.$answers[index]);
			$chosenAnswer
				.clone()
				.addClass('incorrect')
				.prependTo(q.$answersResult);

		} else {

			// Count the correct answer.
			this.categories[q.info.category].correct++;

		}

		// Hide the normal answers
		q.$answers.hide();

		// Result.
		TweenLite.fromTo(q.$result, 0.6, {
			y: -5,
			opacity: 0
		}, {
			y: 0,
			opacity: 1,
			ease: Quad.easeInOut
		});
		q.$result.show();


	};


	Quiz.prototype.showQuizResult = function() {

		// Hidw current question
		this.showQuestion(false);

		// Total score
		var totalScore = _.reduce(this.categories, function(memo, cat) {
			return memo + cat.correct;
		}, 0);

		// Render result
		var resultCaption = '',
			resultOptions = I18n.get('test-je-kennis.results');
		for (var q = 0; q < resultOptions.length; q++) {

			if (totalScore >= resultOptions[q].min && totalScore <= resultOptions[q].max) {
				resultCaption = resultOptions[q].caption;
				break;
			}

		}		
		this.$quizResult.find('header h3').text(resultCaption);


		// Show categories
		var $ul = this.$quizResult.find('.categories').empty();
		_.each(this.categories, function(cat, key) {
			$ul.append('<li>' + key + '<span class="score">' + cat.correct + '/' + cat.total + '</span></li>');
		});


		// Show it.
		this.$quizResult.show();


	};


})();