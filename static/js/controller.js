var app = angular.module('Aloft', ['angularUserSettings', 'minicolors'])
	.service('configService', function ($userSettings) {
		this.setConfig = function (prefs) {
			$userSettings.set('fontFamily', prefs.fontFamily);
			$userSettings.set('fontSize', prefs.fontSize);
			$userSettings.set('lineHeight', prefs.lineHeight);
			$userSettings.set('fgColor', prefs.fgColor);
			$userSettings.set('bgColor', prefs.bgColor);
			$userSettings.set('fonts', prefs.fonts);
			$userSettings.set('hasBeenHere', true);
		}
		this.saveConfig = function (setting, value) {
			$userSettings.set(setting, value);
		}
		this.createConfig = function (name, settings) {
			$userSettings.set(name, settings)
		}
	})
	.controller('AloftController', function ($scope, $http, $userSettings, configService) {
		var defaults = {
			fontFamily: {name: 'Europa Regular', id: 'Europa Regular'},
			fontSize: '4.5',
			lineHeight: '150',
			fgColor: '#261242',
			bgColor: '#faffff',
			fonts: [
				{name: 'Chivo', id: 'Chivo', type: 'default'},
				{name: 'Europa Regular', id: 'Europa Regular', type: 'default'},
				{name: 'Fira Sans Light', id: 'Fira Sans Light', type: 'default'},
				{name: 'Fira Sans Regular', id: 'Fira Sans Regular', type: 'default'},
				{name: 'Fira Sans Medium', id: 'Fira Sans Medium', type: 'default'},
				{name: 'Fira Sans SemiBold', id: 'Fira Sans SemiBold', type: 'default'},
				{name: 'Inconsolata', id: 'Inconsolata', type: 'default'},
				{name: 'Lato', id: 'Lato', type: 'default'},
				{name: 'Noway Regular', id: 'Noway Regular', type: 'default'},
				{name: 'Open SansRegular', id: 'OpenSans-Regular', type: 'default'},
				{name: 'Roboto', id: 'Roboto', type: 'default'},
				{name: 'Raleway-Regular', id: 'Raleway-Regular', type: 'default'},
				{name: 'Sintony', id: 'Sintony', type: 'default'},
				{name: 'Source Code Pro Light', id: 'Source Code Pro Light', type: 'default'},
				{name: 'Source Code Pro Medium', id: 'Source Code Pro Medium', type: 'default'},
				{name: 'Source Code Pro Regular', id: 'Source Code Pro Regular', type: 'default'},
				{name: 'Source Code Pro Semibold', id: 'Source Code Pro Semibold', type: 'default'},
			]
		};

		$scope.activeEventURL = '';
		$scope.activeEventTitle = '';

		$scope.minicolorsSettings = {
    		control: 'hue',
    		theme: 'bootstrap',
    		position: 'bottom right',
    		changeDelay: 200,
    		hide: null
  		};

  		// Saves foreground color
  		$scope.saveFg = function () {
  			configService.saveConfig('fgColor', $scope.fgColor);
  		}

  		// Saves background color
  		$scope.saveBg = function () {
  			configService.saveConfig('bgColor', $scope.bgColor);
  		}

  		// Saves font
  		$scope.saveFontFamily = function () {
  			configService.saveConfig('fontFamily', $scope.fontFamily);
  		}

		if ($userSettings.get('hasBeenHere')) {
			$scope.fontFamily = $userSettings.get('fontFamily');
			$scope.fontSize = $userSettings.get('fontSize');
			$scope.lineHeight = $userSettings.get('lineHeight');
			$scope.fgColor = $userSettings.get('fgColor');
			$scope.bgColor = $userSettings.get('bgColor');
			$scope.fonts = $userSettings.get('fonts');
			console.log('I\'ve been here!');
		} else {
			configService.setConfig(defaults);
			location.reload();
			console.log('I haven\'t been here!');
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