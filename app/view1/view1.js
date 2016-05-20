'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: siteRootRelativePath+'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope',function($scope) {
  /**
   * Created by zhou on 07/05/2016.
   */
  var noOfRecrodToRestore=10;

  var itemState=1;
  $scope.live=false;
  $scope.myData = [{"title":"test title","dirName":"Test dir name","deletedDate":"test"}];


  function onQuerySucceeded()
  {
    //display titles in grid
    displayAllItems(recycleItemCollection);
    //loopThroughRecycleItems(recycleItemCollection);
  }
  function displayAllItems(recycleItemCollection){
    var recycleItemArray=[];
    var recycleBinItem;

    if (recycleItemCollection.get_count() > 0) {
      if(noOfRecrodToRestore>recycleItemCollection.get_count()) {
        noOfRecrodToRestore=recycleItemCollection.get_count();
      }

      recycleItemArray.push()
      for (var i=0;i<noOfRecrodToRestore;i++)
      {
        recycleBinItem=recycleItemCollection.itemAt(i);
        if(itemFilter(recycleBinItem))
        {
          var itemToRestore={"title":recycleBinItem.get_title(),
                           "dirName":recycleBinItem.get_dirName(),
                           "deletedDate":recycleBinItem.get_deletedDate(),
                           "deletedBy":recycleBinItem.get_deletedBy()
          }
         // console.log("pushed one item");
       /*   console.log(itemToRestore);
          console.log($scope.myData.length);*/

          $scope.myData.push(itemToRestore);

        }
        $scope.$digest();

      }

    }

   // $scope.myData = recycleItemArray;
  }
  function loopThroughRecycleItems(recycleItemCollection) {
    if (recycleItemCollection.get_count() > 0) {
     // console.log("has recycle item");
      processNextRecord(recycleItemCollection,0);

    }
    else {
      alert("The Recycle Bin is empty.");
    }
  }
  function itemFilter(recycleBinItem){
    var id = recycleBinItem.get_id();
    var title = recycleBinItem.get_title();
    var itemState=recycleBinItem.get_itemState();
    // console.log('Title: ' + title + ';' + 'Item ID: ' + id);
    return itemState==1;
  }
  function processNextRecord(recycleItemCollection,nextIndex)
  {
    if(nextIndex<noOfRecrodToRestore&&nextIndex<recycleItemCollection.get_count()){
      var item = recycleItemCollection.itemAt(nextIndex);
      var id = item.get_id();
      var title = item.get_title();
      var itemState=item.get_itemState();

      if(itemFilter(item))
      {
        jQuery.when(addAudit(item)).done(function(){
         // console.log("audit done");
          return restoreItem(item);
        }).done(function(){
         // console.log("retore item done");
          processNextRecord(recycleItemCollection,nextIndex+1);
        }).fail(promiseFail);
      }
      else{
        processNextRecord(recycleItemCollection,nextIndex+1);
      }

    }


  }
  function addAudit(item){
    var dfd=jQuery.Deferred();
    //add audit trial
    setTimeout(function(){dfd.resolve();},0);
    return dfd.promise();

  }

  function restoreItem(item){
    var dfd=jQuery.Deferred();
    //retore item

    /*if($scope.live)
    {
      item.restore();
      var itemContext=item.get_context();
      itemContext.load(item);
      itemContext.executeQueryAsync(function(){dfd.resolve();},onQueryFailed);
    }
    else
    {*/
      setTimeout(function(){dfd.resolve();},30);
    /*}*/

    return dfd.promise();

  }
  function promiseFail(error){
    alert(error);
  }
  function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
  }
  var recycleItemCollection;
  function runCode() {
   var clientContext = new SP.ClientContext.get_current();

    var site = clientContext.get_site();
    recycleItemCollection = site.get_recycleBin();

    clientContext.load( recycleItemCollection);
    clientContext.executeQueryAsync(Function.createDelegate(this, onQuerySucceeded), Function.createDelegate(this, onQueryFailed));


  }
  if(typeof ExecuteOrDelayUntilScriptLoaded != 'undefined'){
    ExecuteOrDelayUntilScriptLoaded(runCode,"sp.js");
  }
  else
  {
    var testItem= {"title":"test title","dirName":"Test dir name","deletedDate":"test"};
    for(var i=1;i<noOfRecrodToRestore;i++)
    {
     // $scope.myData.push(testItem);
    }
  }

}]);