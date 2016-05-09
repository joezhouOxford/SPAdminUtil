'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope',function($scope) {
  /**
   * Created by zhou on 07/05/2016.
   */
  var noOfRecrodToRestore=2;
  var live=true;
  var itemState=1;
  $scope.myData = [
    /*{
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
    }*/
  ];


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
                           "deletedBy":recycleBinItem.get_deletedBy(),
          }
          console.log("pushed one item");
          console.log($scope.myData.length);
          $scope.myData.push(itemToRestore);
        }
        $scope.$digest();
      }

    }
    $scope.myData
   // $scope.myData = recycleItemArray;
  }
  function loopThroughRecycleItems(recycleItemCollection) {
    if (recycleItemCollection.get_count() > 0) {
      console.log("has recycle item");
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
      this.item = recycleItemCollection.itemAt(nextIndex);
      var id = item.get_id();
      var title = item.get_title();
      var itemState=item.get_itemState();

      if(itemFilter(item))
      {
        jQuery.when(addAudit(item)).done(function(){
          console.log("audit done");
          return restoreItem(item);
        }).done(function(){
          console.log("retore item done");
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
    setTimeout(function(){dfd.resolve();},30);
    return dfd.promise();

  }

  function restoreItem(item){
    var dfd=jQuery.Deferred();
    //retore item

    if(this.live)
    {
      item.restore();
      var itemContext=item.get_context();
      itemContext.load(item);
      itemContext.executeQueryAsync(function(){dfd.resolve();},onQueryFailed);
    }
    else
    {
      setTimeout(function(){dfd.resolve();},30);
    }

    return dfd.promise();

  }
  function promiseFail(error){
    alert(error);
  }
  function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
  }
  function runCode() {
    this.clientContext = new SP.ClientContext.get_current();

    var site = clientContext.get_site();
    this.recycleItemCollection = site.get_recycleBin();

    clientContext.load(this.recycleItemCollection);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));


  }
  var recycleItemCollection;
  function setUp(){
    recycleItemCollection={};
    recycleItemCollection.get_count=function(){return 2;};
    recycleItemCollection.itemAt=function(index){

      var item={};
      item.get_id=function(){return 1};
      item.get_title=function(){return "my title"};
      item.get_itemState=function(){return 1};
      item.get_dirName=function(){return "my dirName"};
      item.get_deletedBy=function(){return "my deletedBy"};
      item.get_deletedDate=function(){return "my deletedDate"};
      return item;
    };

  }
// Anonymous "self-invoking" function
  (function() {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
      if (window.jQuery) {
        callback(jQuery);
      }
      else {
        window.setTimeout(function() { checkReady(callback); }, 100);
      }
    };

    // Start polling...
    checkReady(function(jQuery) {
      //runCode();
      setUp();
      onQuerySucceeded();
    });
  })();
}]);