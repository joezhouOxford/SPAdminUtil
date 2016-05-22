'use strict';
/**
 * Created by zhou on 07/05/2016.
 */
angular.module('myApp.view2', ['ngRoute','ngMaterial'])

.config(['$routeProvider','$mdIconProvider','$mdDateLocaleProvider', function($routeProvider,$mdIconProvider,$mdDateLocaleProvider) {
  $routeProvider.when('/view2', {
    templateUrl: siteRootRelativePath+'view2/view2.html'/*,
    controller: 'View2Ctrl'*/
  });
  $mdIconProvider
      .icon('plusAction',siteRootRelativePath+'img/icons/ic_playlist_add_black_24px.svg',24);
 /* $mdDateLocaleProvider.formatDate = function(date) {
    return date ? moment(date).format('DD/MM/YYYY'):'';

  };
  $mdDateLocaleProvider.parseDate=function(date){
    var m = moment(date, 'DD/MM/YYYY', true);
    return m.isValid() ? m.toDate() : new Date(NaN);
  };*/
}])

.controller('View2Ctrl', ['$scope','$q','$log','$timeout','$mdDialog','$window',function($scope,$q,$log,$timeout,$mdDialog,$window) {
  var goLive=false;
  var listColumnTitleArray=["Client CIS","Operational Point Zero Date","All Accounts On Buses","New Bank Accounts Setup","L4Client Indicated Cash Date","L4Client Indicated Trade Date","Client Mandated New Bank","Detailed Onboarding Plan In Place"];
  var listColumnInternalNameArray=[];

    angular.forEach(listColumnTitleArray,function(listTitle){
          var internalName=listTitle.replace(/\s/g, "");
          switch(internalName)
          {
            case "Client CIS":
              internalName="Title";
                  break;

          }

      listColumnInternalNameArray.push(internalName);
    });


  var gridData=[];


 var columnDefs=[{name:'id',visible:false},
   {name:'ListTitle',visible:true,headerTooltip:"List Title",width:100}];
    $timeout( function() {
        angular.forEach(listColumnTitleArray,function(columnTitle){
            var def={
                name:columnTitle,
                headerTooltip:columnTitle,
                width: columnTitle.length*10
            };

            columnDefs.push(def);
        });
    });


  $scope.gridOptions={
    data :gridData,
    enableFiltering: true,
    enableRowSelection: true,
    enableSelectAll: true,
    enableColumnMenus: true,
    gridMenuShowHideColumns:false,
    showGridFooter: true,

   // enableFullRowSelection:true
    columnDefs:columnDefs



  };

  $scope.gridOptions.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.core.on.rowsRendered($scope,function(){
      resizeGrid();
    });
//single row selection
   /* gridApi.selection.on.rowSelectionChanged($scope,function(row){
      recordRow(row);
    });

    gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
      angular.forEach(rows,function(row){
        recordRow(row);
      });
    });*/


  };

function recordRow(row){

  var isSelected=row.isSelected;

  var item=row.entity;

  switch(isSelected){
    case true:
      //add item to if not exist
      if(findObjectIndexInArrayByFieldValue(self.BulkChangeSet.selectedItems,"id",item.id)<0)
      {

        self.BulkChangeSet.selectedItems.push(item);
      }
      break;
    case false:
      //remove item if exit
      var foundItemIndex=findObjectIndexInArrayByFieldValue(self.BulkChangeSet.selectedItems,"id",item.id);
      if(foundItemIndex>-1)
        self.BulkChangeSet.selectedItems.splice(foundItemIndex,1);
      break;
  }
  $log.log("you have "+self.BulkChangeSet.selectedItems.length+" selected");

}

  var dfd;
  var collListItem;

  function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    dfd.reject(args);
  }



  function onGetListItemBypersonalReferenceQuerySucceeded()
  {
    dfd.resolve(collListItem);
  }

  function getListItemByPersonalReference(listTitle,personalReference,columnList){

    dfd=$q.defer();
    var clientContext =  new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listTitle);

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'PersonalReference\'/>' +
        '<Value Type=\'text\'>'+personalReference+'</Value></Eq></Where></Query><RowLimit>5499</RowLimit></View>');
    collListItem = oList.getItems(camlQuery);

    clientContext.load(collListItem,'Include('+columnList+')');

    clientContext.executeQueryAsync(onGetListItemBypersonalReferenceQuerySucceeded, onQueryFailed);

    return dfd.promise;

  }



  function findL1L4(personalReference){
    //get L4 from All five L4 lists

    /*var personalReference="ABSciex";*/
    var columnList="ID,"+listColumnInternalNameArray.join();
    var findL1L4Defer=$q.defer();
    var listArray;
    if(goLive)
    {
      listArray=["L4UK","L4NL","L4EMEA","L4FBL","L4Global"];
    }
    else{
      listArray=["L4Dev"];
    }
    searchL4List(listArray,0,personalReference,columnList,findL1L4Defer);
    return findL1L4Defer.promise;
  };

  function searchL4List(listTitleArray,listIndex,personalReference,columnList,findL1L4Defer){
    if(listIndex<listTitleArray.length) {
      getListItemByPersonalReference(listTitleArray[listIndex], personalReference, columnList).then(
          function (items) {
            appendItemsIntoGrid(items, listTitleArray[listIndex]);
            //search the next list
            searchL4List(listTitleArray, listIndex + 1, personalReference, columnList, findL1L4Defer);
          }).catch(function(err){
        findL1L4Defer.reject(err);
        $log.log(err);
      });
    }
    else{
      findL1L4Defer.resolve();
    }
  }

  function appendItemsIntoGrid(items,listTitle){
    var listItemEnumerator = collListItem.getEnumerator();

    while (listItemEnumerator.moveNext())
    {
      var currentItem = listItemEnumerator.get_current();
      appendItemIntoGrid(currentItem,listTitle);
    }
  }
  function appendItemIntoGrid(listItem,listTitle)
  {
    var id=listItem.get_item('ID');
    var gridItem= {"id":id,"ListTitle":listTitle};
    var arrayIndex=0;
    angular.forEach(listColumnInternalNameArray,function(colInternalName){

      var colTitle=listColumnTitleArray[arrayIndex];
      gridItem[colTitle]=listItem.get_item(colInternalName);
      arrayIndex++;
    });

    gridData.push(gridItem);

  }


  function loadDummyData(){
    $log.log("load dummy data");


    for(var i=1;i<21;i++)
    {
      var testItem= {"id":i,"ListTitle":"L4Dev"};
      var arrayIndex=0;
      angular.forEach(listColumnInternalNameArray,function(colInternalName){

        var colTitle=listColumnTitleArray[arrayIndex];
        testItem[colTitle]="Test data for"+colInternalName;
        arrayIndex++;
      });


      gridData.push(testItem);
    }

  }

 var self=this;
  self.showResult=false;
  self.BulkChangeSet={
    "Status":"",

    "L4LegalDate":null,
    "selectedItems":[]
  }
  var initialData={
    statusOptions:['1. Completed',
      '2. KYC Off-Boarding Complete',
      '3. Internal / Nostro Only',
      '4. Non-GTS Only',
      '5. Trade/Outstanding Guarantees Only',
      '6. Open (Active Cash Accounts)'
    ],
    oversight:['1. Client Office',
      '2. Client Services',
      '3. CPB',
      '4. FI (Banks)',
      '5. Luxembourg Transfer',
      '6. PBA - RBS managed',
      '7. PBA - AAB managed',
      '8. Sale Country',
      '9. Shipping'
    ],
    AllAccountsOnBuses:['Yes',
      'No',
      'Special'
    ],
    NewBankAccountsSetup:["Yes","No"],
    DetailedOnboardingPlanInPlace:['Yes',
      'No',
      'NP'
    ]
  }
  self.BulkChangeSet.initData=initialData;
  


  self.BulkChangeSet.updateQueue={
    "data":[],
    "readonly":false
  }
  self.BulkChangeSet.AddAction=function(fieldName,ev){
    //check if self.BulkChangeSet[fieldName] is not empty
    if(!self.BulkChangeSet[fieldName])
    {
      self.BulkChangeSet.emptyInput(ev);
      return;
    }
    var existUpdateItem=getExistUpdateItem(fieldName);
    var valuetoAdd=self.BulkChangeSet[fieldName];
    //if it is a date, format it to string as dd/mm/yyyy

    if(valuetoAdd instanceof Date )
    {
      var thisDate= moment(valuetoAdd);
      valuetoAdd=thisDate.format("YYYY-MM-DD");

    }


    if(existUpdateItem)
    {
      existUpdateItem.value=valuetoAdd;
    }
    else{
      self.BulkChangeSet.updateQueue.data.push({"name":fieldName,"value":valuetoAdd});
    }
    //disable add more same field value
   // self.BulkChangeSet[fieldName+"ButtonDisabled"]=true;
  }

  function getExistUpdateItem(fieldName) {
    return findObjectInArrayByFieldValue(self.BulkChangeSet.updateQueue.data,"name",fieldName);
    /*return self.BulkChangeSet.updateQueue.data.find(function(updateItem){
      return updateItem.name===fieldName;
    });*/
  }
  function findObjectAndIndexInArrayByFieldValue(searchArray,fieldName,fieldValue){


    for(var i=0;i<searchArray.length;i++)
    {
      if(searchArray[i][fieldName]==fieldValue){
        return [searchArray[i],i];
      }
    }

  }

  function findObjectInArrayByFieldValue(searchArray,fieldName,fieldValue){
    var itemFound=findObjectAndIndexInArrayByFieldValue(searchArray,fieldName,fieldValue);
    if (itemFound)
      return itemFound[0];
    return null;
  }

  function findObjectIndexInArrayByFieldValue(searchArray,fieldName,fieldValue){
     var itemFound=findObjectAndIndexInArrayByFieldValue(searchArray,fieldName,fieldValue);
    if (itemFound)
    return itemFound[1];
    return -1;
  }

  self.BulkChangeSet.emptyInput = function(ev) {
    $mdDialog.show(
        $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Value is empty')
            .textContent('Please input value before  add to bulk update queue')
            .ariaLabel('Input value is empty')
            .ok('Got it')
            .targetEvent(ev)
          
          
    );
  }

  function printObjectArray(arr){
    var resultString="";
    angular.forEach(arr,function(obj){
      resultString+=obj.name+"="+obj.value+";"

    });
    return resultString;
  }
  self.BulkChangeSet.bulkUpdate=function(ev){
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to commit the bulk update?')
        .textContent('You are going to update '+$scope.gridApi.selection.getSelectedRows().length+' record with value: '+ printObjectArray(self.BulkChangeSet.updateQueue.data))
        .ariaLabel('confirm update')
        .targetEvent(ev)
        .cancel('Cancel')
        .ok('Please do it!');
    $mdDialog.show(confirm).then(function() {
      showLoadingScreen();
      bulkUpdateL4s($scope.gridApi.selection.getSelectedRows(),self.BulkChangeSet.updateQueue.data);
    }, function() {
      $log.log("action cancelled");
    });

  }
self.personalRefSearch={
  "searchText":"",
  "inSearch":false
}
  function bulkUpdateL4s(itemsToUpdate,valueToUpdate){
    var updateDFD=$q.defer();
     bulkUpdateL4Loop(0,itemsToUpdate,valueToUpdate,updateDFD);
     updateDFD.promise.then(function(){
       showLoadingScreen();
       $mdDialog.show(
           $mdDialog.alert()
               .clickOutsideToClose(true)
               .title('Bulk update completed')
               .textContent('Bulk upload has been completed. New data will be shown in the search result')
               .ariaLabel('Bulk update completed')
               .ok('OK')

       );
       //refresh data
       self.personalRefSearch.search(self.personalRefSearch.searchText);

     });

  }
  function bulkUpdateL4Loop(index,itemsToUpdate,valueToUpdate,updateDFD){
    if(index<itemsToUpdate.length)
    {
      UpdateL4(itemsToUpdate[index],valueToUpdate).then(function(){
       bulkUpdateL4Loop(index+1,itemsToUpdate,valueToUpdate,updateDFD);
    }).catch(function(err){
       $log.error(err);
       updateDFD.reject(err);
     });

    }
    else
    {
      updateDFD.resolve();
    }

  }

  function UpdateL4fake(item,valueToUpdate)
  {
    var fakeListItem={};
    fakeListItem.set_item=function(fieldName,fieldValue){
      this[fieldName]=fieldValue
    }
    var updatedListItem=setListItem(fakeListItem,valueToUpdate);
    return $timeout(function(){
      $log.log("updated listItem:"+item.id+";listTitle:"+item.ListTitle+";--updated");
      $log.log(updatedListItem);

    },100)
  }
  function UpdateL4(item,valueToUpdate){
    if(!IsInProd())
    {
      return UpdateL4fake(item,valueToUpdate);
    }
    var updateDFD=$q.defer();
    var itemID=item.id;
    var listTitle=item.ListTitle;

    var clientContext = new SP.ClientContext.get_current();

    var oList = clientContext.get_web().get_lists().getByTitle(listTitle);

    var oListItem = oList.getItemById(itemID);
    setListItem(oListItem,valueToUpdate);
    oListItem.update();

    clientContext.executeQueryAsync(function(){updateDFD.resolve();}, function(err,args){
      $log.error(args);
      updateDFD.reject(args);});

    return updateDFD.promise;
  }

  function setListItem(listItem,valueToUpdate)
  {
    angular.forEach(valueToUpdate,function(valuePair){
      var fieldName=valuePair.name.replace(/\s/g, "");
      var fieldValue=valuePair.value;
      listItem.set_item(fieldName, fieldValue);
    });
    return listItem;
  }

  self.personalRefSearch.search=function(searchText){
    if(searchText.trim()=="")
    {
      $mdDialog.show(
          $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('Personal Reference missing')
              .textContent('Please input the personal reference you want to search')
              .ariaLabel('Personal Reference is empty')
              .ok('OK')
      );
      //abort
      return;
    }
    self.showResult=true;
    $log.log("search triggered");

    //clear existing result
    gridData.length=0;
    showLoadingScreen();
    var findL1L4Promise;
    if(IsInProd()) {
      findL1L4Promise=findL1L4(searchText);
    }
    else{
      //load
      findL1L4Promise= findL1L4fake(searchText);
    }
    findL1L4Promise.then(function(){
      showLoadingScreen();

    });
  };
  function showLoadingScreen(){
    self.personalRefSearch.inSearch=!self.personalRefSearch.inSearch;
  };

  function findL1L4fake(searchText)
  {
    return $timeout (loadDummyData,10);
  }
 function IsInProd(){
   return(checkEnvironment()=="prod")
 }
  function checkEnvironment()
  {
    if (typeof ExecuteOrDelayUntilScriptLoaded != 'undefined')
    {
      return "prod";
    }
    else
    {
      return "dev";
    }
  }
    var resizeGrid = function () {


      //get left nav width
      var leftNavWidth=document.querySelectorAll(".lefNav")[0].clientWidth;
      $log.log("windows width:"+$window.innerWidth);
      $log.log("leftNavWidth:"+leftNavWidth);
      var offSet=13;
      var gridWidth=$window.innerWidth-leftNavWidth-offSet;
      $log.log("gridWidth:"+gridWidth);
        angular.element(document.getElementsByClassName('myGrid')[0]).css('width', gridWidth + 'px');

      var gridHeight=document.querySelectorAll(".lefNav")[0].offsetHeight-offSet;
      $log.log("gridHeight:"+gridHeight);
        angular.element(document.getElementsByClassName('myGrid')[0]).css('height', gridHeight + 'px');
    };

}]);