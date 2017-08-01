
var app = angular.module('AloftDash', ['angularUserSettings', 'minicolors'])
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
	.controller('DashboardController', function ($scope, $userSettings, configService) {
		var defaults = {
			editorFontFamily: {name: 'Sintony', id: 'Sintony'},
			editorFontSize: '30',
			editorLineHeight: '130',
			editorFgColor: '#c5ff33',
			editorBgColor: '#102147',
			editorFonts: [
				{name: 'Inconsolata', id: 'Inconsolata', type: 'default'},
				{name: 'Lato', id: 'Lato', type: 'default'},
				{name: 'Roboto', id: 'Roboto', type: 'default'},
				{name: 'Sintony', id: 'Sintony', type: 'default'}
			]
		};

		$scope.activeEventURL = '';
		$scope.activeEventTitle = '';
		$scope.host = window.location.origin;

		$scope.minicolorsSettings = {
    		control: 'hue',
    		theme: 'bootstrap',
    		position: 'bottom right',
    		changeDelay: 200,
    		hide: null
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
				url: 'http://' + window.location.hostname + ':' + window.location.port + '/text/' + user + '/' + event,
				success: function (data) {
					saveForm(user, event, data);
				}
			});
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