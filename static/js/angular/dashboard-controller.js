
var app = angular.module('AloftDash', ['angularUserSettings', 'minicolors', 'angularUtils.directives.dirPagination'])
	.service('configService', function ($userSettings) {
		this.setConfig = function (prefs) {
			$userSettings.set('editorFontFamily', prefs.editorFontFamily);
			$userSettings.set('editorFontSize', prefs.editorFontSize);
			$userSettings.set('editorLineHeight', prefs.editorLineHeight);
			$userSettings.set('editorFgColor', prefs.editorFgColor);
			$userSettings.set('editorBgColor', prefs.editorBgColor);
			$userSettings.set('editorFonts', prefs.editorFonts);
			$userSettings.set('editorHasBeenHere', true);
		}
		this.saveConfig = function (setting, value) {
			$userSettings.set(setting, value);
		}
		this.createConfig = function (name, settings) {
			$userSettings.set(name, settings)
		}
	})
	.controller('DashboardController', function ($scope, $rootScope, $http, $filter, $userSettings, configService) {
		$scope.currentPage;
		$scope.pageSize = 6;
		var defaults = {
			editorFontFamily: {name: 'Sintony', id: 'Sintony'},
			editorFontSize: '30',
			editorLineHeight: '130',
			editorFgColor: '#fff',
			editorBgColor: '#30353e',
			editorFonts: [
				{name: 'Inconsolata', id: 'Inconsolata', type: 'default'},
				{name: 'Lato', id: 'Lato', type: 'default'},
				{name: 'Roboto', id: 'Roboto', type: 'default'},
				{name: 'Sintony', id: 'Sintony', type: 'default'}
			]
		};

		$rootScope.activeEventURL = '';
		$rootScope.activeEventTitle = '';
		$rootScope.host = window.location.origin;
		$scope.eventCreator = {
			url: '',
			slug: '',
			title: '',
			speaker: ''
		}
		$scope.planned = {
			slug: '',
			title: '',
			speaker: ''
		};

		$scope.minicolorsSettings = {
    		control: 'hue',
    		theme: 'bootstrap',
    		position: 'bottom right',
    		changeDelay: 200,
    		hide: null
  		};

		$scope.confMode = false;
		$scope.$watch('username', function () {
			$http({
				method: 'GET',
				url: window.location.origin + '/getJobs/' + $scope.username + '?perPage=' + $scope.pageSize + '&page=' + $scope.currentPage
			}).then(function (success) {
				$scope.events = success.data.events;
				$scope.total = success.data.total;
			}, function (err) {

			});
		});

		$scope.toggleComplete = function (id) {
			$scope.eventCompleted = $scope.eventCompleted === false ? true: false;
			$http({
				method: 'POST',
				url: window.location.origin + '/toggleComplete/' + id
			}).then(function (success) {
				console.log('it was a success! ' + JSON.stringify(success) + ' ' + window.location.origin + '/toggleComplete/' + id);
			}, function(err) {
				if (err) {
					console.log('there was an error! ' + err);
				}
			});
		}

		$scope.getEvents = function () {
			$http({
				method: 'GET',
				url: window.location.origin + '/getJobs/' + $scope.username + '?perPage=' + $scope.pageSize + '&page=' + $scope.currentPage
			}).then(function (success) {
				$scope.events = success.data.events;
				$scope.total = success.data.total;
			}, function (err) {
				if (err) throw err;
			});
		}
		$scope.setEventId = function (id) {
			$scope.activeEventId = id;
		}
		$scope.deleteEvent = function (id) {
			console.log('hey this works!');
			$http({
				method: 'POST',
				url: window.location.origin + '/editor/' + id + '?_method=DELETE'
			}).then(function (success) {
				console.log('Success!');
				$scope.getEvents();
			}, function (err) {
				if (err) throw err;
			});
		}
		$scope.pageChangeHandler = function (num) {
			console.log('Page changed to ' + num + '!!');
			$scope.getEvents();
		}
		
		$scope.startEditor = function (e) {
			$rootScope.activeEvent = e;
			$scope.eventCompleted = e.completed;
			startEditor(e.url);
		}

		$scope.generateURL = function (url, conference) {
			let newURL = conference + '_' + url;
			return newURL;
		}

		$scope.pickEvent = function (conf_url) {
			let split = $scope.planned.split('::');
			let slug = split[0];
			let title = split[1];
			let speaker = split[2];

			$scope.eventCreator.slug = slug;
			$scope.eventCreator.title = title;
			$scope.eventCreator.speaker = speaker;
			$scope.eventCreator.url = conf_url + '_' + slug;

			$scope.planned.slug = slug;
			$scope.planned.title = title;
			$scope.planned.speaker = speaker;
		}

		$scope.toggleConfMode = function() {
            $scope.confMode = $scope.confMode === false ? true: false;
        };


  		// Saves foreground color
  		$scope.saveFg = function () {
  			configService.saveConfig('editorFgColor', $scope.editorFgColor);
  		}

  		// Saves background color
  		$scope.saveBg = function () {
  			configService.saveConfig('editorBgColor', $scope.editorBgColor);
  		}

  		// Saves font
  		$scope.saveFontFamily = function () {
  			configService.saveConfig('editorFontFamily', $scope.editorFontFamily);
  		}

  		$scope.addDate = function (w) {
  			if ($scope.rawEventUrl) {
  				let date = new Date();
  				let formattedDate = $filter('date')(date, 'yyyy-M-d');
  				let formattedTime = $filter('date')(date, 'HHmm');
  				let dateAndTime = formattedDate + '-' + formattedTime;
  				if (w === 'd') {
  					$scope.rawEventUrl = $scope.rawEventUrl + '-' + formattedDate;
  				}
  				if (w === 't') {
  					$scope.rawEventUrl = $scope.rawEventUrl + '-' + formattedTime;
  				}
  				if (w === 'dt') {
  					$scope.rawEventUrl = $scope.rawEventUrl + '-' + dateAndTime;
  				}
  			} else {
  				$scope.urlMessage = 'You must type in a URL before trying to add a timestamp.'
  			}
  		}

		if ($userSettings.get('editorHasBeenHere')) {
			$scope.editorFontFamily = $userSettings.get('editorFontFamily');
			$scope.editorFontSize = $userSettings.get('editorFontSize');
			$scope.editorLineHeight = $userSettings.get('editorLineHeight');
			$scope.editorFgColor = $userSettings.get('editorFgColor');
			$scope.editorBgColor = $userSettings.get('editorBgColor');
			$scope.editorFonts = $userSettings.get('editorFonts');
			console.log('I\'ve been here!');
		} else {
			configService.setConfig(defaults);
			location.reload();
			console.log('I haven\'t been here!');
		}
		$scope.grabTranscript = function (user, event) {
			$.ajax({
				url: window.location.origin + '/text/' + user + '/' + event,
				success: function (data) {
					saveForm(user, event, data);
				}
			});
		}
		$scope.addHeader = function () {
			let box = document.getElementById('pad');
			let text = box.value;
			let newText;

			if (text) {
				if ($scope.activeEvent.speaker && $scope.activeEvent.speaker != '') {
					newText = '\"' + $scope.activeEvent.title + '\"' + '\n' + $scope.activeEvent.speaker + '\n\n' + text;
				} else {
					newText = '\"' + $scope.activeEvent.title + '\"' + '\n\n' + text;
				}
			} else {
				if ($scope.activeEvent.speaker && $scope.activeEvent.speaker != '') {
					newText = '\"' + $scope.activeEvent.title + '\"' + '\n' + $scope.activeEvent.speaker + '\n\n' + text;
				} else {
					newText = '\"' + $scope.activeEvent.title + '\n\n' + text;
				}
			}
			box.value = newText;
 		}
	})
	.directive('settingSlider', ['configService', function (configService) {
		return {
			restrict: 'A',
			scope: {
				'model': '='
			},
			link: function (scope, elem, attrs) {
				var $slider = $(elem).slider({
					value: +scope.model,
					min: +attrs.min,
					max: +attrs.max,
					step: +attrs.step,
					slide: function (event, ui) {
						scope.$apply(function () {
							scope.model = ui.value;
							configService.saveConfig(attrs.model, scope.model);
						});
					}
				});
				scope.$watch('model', function (newVal) {
					$slider.slider('value', newVal);
				})
			}
		}
	}]);