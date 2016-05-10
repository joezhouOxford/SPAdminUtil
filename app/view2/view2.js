'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope',function($scope) {
  var myData = [
    {
     "firstName": "Cox",
     "lastName": "Carney",
     "company": "Enormo",
     "employed": true
     },
     {
     "firstName": "Lorraine",
     "lastName": "Wise",
     "company": "Comveyer",
     "employed": false
     },
     {
     "firstName": "Nancy",
     "lastName": "Waters",
     "company": "Fuelton",
     "employed": false
     }
  ];
  $scope.gridOptions = {
    data: myData,
    enableFiltering: true
  };

}]);