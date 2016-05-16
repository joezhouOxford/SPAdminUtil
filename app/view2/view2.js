'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: '/teams/EOCBM/admin/app/bulkUpdateByPersonalRef/view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope','$q',function($scope,$q) {
  /**
   * Created by zhou on 07/05/2016.
   */

  $scope.live=false;
  $scope.myData = [

  ];

  function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    dfd.reject(args);
  }

  var dfd;
  var collListItem;
  function getListItemByPersonalReference(listTitle,personalReference,columnList){

    dfd=$q.defer();
    var clientContext =  new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listTitle);

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'PersonalReference\'/>' +
        '<Value Type=\'text\'>'+personalReference+'</Value></Geq></Where></Query><RowLimit>5499</RowLimit></View>');
    collListItem = oList.getItems(camlQuery);

    clientContext.load(collListItem,'Include('+columnList+')');

    clientContext.executeQueryAsync(onGetListItemBypersonalReferenceQuerySucceeded, onQueryFailed);

    return dfd.promise;

  }

  function getListItemByPersonalReference (){
    dfd.resolve(collListItem);
  }

  function findL1L4(){
    //get L4 from All five L4 lists
    var personalReference="ABSciex";
    var columnList="ClientCIS,L4LegalName";
    getListItemByPersonalReference("L4UK",personalReference,columnList).then(function(items){
      appendItemsIntoGrid(items);
      return getListItemByPersonalReference("L4NL",personalReference,columnList);
    }).then(function(items){
      appendItemsIntoGrid(items);
      return getListItemByPersonalReference("L4EMEA",personalReference,columnList);
    }).then(function(items){
      appendItemsIntoGrid(items);
    }).fail(function(error){
       console.error(error);
    });

  };

  function appendItemsIntoGrid(items){
    
  }
  ExecuteOrDelayUntilScriptLoaded(findL1L4,"sp.js");
}]);