var app = angular.module('AloftDash', ['angularUtils.directives.dirPagination'])
	.controller('ListingController', function ($scope, $http, $filter) {
		$scope.currentPage;
		$scope.pageSize = 6;
	
		$scope.$watch('username', function () {
			$http({
				method: 'GET',
				url: window.location.origin + '/publicJobs/' + $scope.username + '?perPage=' + $scope.pageSize + '&page=' + $scope.currentPage
			}).then(function (success) {
				$scope.events = success.data.events;
				$scope.total = success.data.total;
			}, function (err) {

			});
		});
		$scope.getEvents = function () {
			$http({
				method: 'GET',
				url: window.location.origin + '/publicJobs/' + $scope.username + '?perPage=' + $scope.pageSize + '&page=' + $scope.currentPage
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
		$scope.pageChangeHandler = function (num) {
			console.log('Page changed to ' + num + '!!');
			$scope.getEvents();
		}
	});