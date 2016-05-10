'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope','$q',function($scope,$q) {
  function retrieveListItems(){
    var listTitle="test";
    var queryString="$select=Title,Employee,Company";
    var endArray=[];
    getListItemViaREST("testlist1","$select=Title,Employee,Company").then(
        function(data){
          consolidateListData(endArray,data);
          return getListItemViaREST("testlist2","$select=Title,Employee,Company");
        }
    ).then(
        function(data){
          consolidateListData(endArray,data);
          return getListItemViaREST("testlist3","$select=Title,Employee,Company");
        }
    ).then(
        function(data){
          consolidateListData(endArray,data);
        }
    ).catch(function(data){cosole.error(data);alert("retrieve list item failed");});


  }


  function consolidateListData(endArray,listItems)
  {

    return endArray;
  }

  function getListItemViaREST(listTitle,queryString){
    var deferred = $q.defer();
    $http(
        {
          method: 'GET',
          url: _spPageContextInfo.webAbsoluteUrl +
          "/_api/web/lists/getByTitle('"+listTitle+"')/items?"+queryString,
          headers:
          {
            "Accept": "application/json;odata=verbose"
          }
        }).success(function(data, status,
                            headers, config)
    {

      deferred.resolve(data.d.results);
    }).error(function(data, status,
                      headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  }

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