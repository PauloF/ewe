'use strict';

angular.module('eweApp')
  .controller('VisualizationCtrl', function ($scope, $uibModal, $http, socket, $log, $mdDialog, $mdSidenav, $mdUtil, $mdMedia, $timeout) {
    
    /*$scope.toggleFilter = buildToggler('filtersn');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    /*    function buildToggler(navID) {
          var debounceFn =  $mdUtil.debounce(function(){
                $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                    $log.debug("toggle " + navID + " is done");
                  });
              },300);
    
          return debounceFn;
        };
    */


    $http.get("/api/samples/spTreeMap")
      .then(function (result) {
        //console.log(JSON.stringify(result));
        var dataTree = new google.visualization.DataTable(result.data);
        var tree = new google.visualization.TreeMap(document.getElementById('treemapSpecies'));
        function selectHandler() {
          var selectedItem = tree.getSelection()[0];
          if (selectedItem) {
            var value = dataTree.getValue(selectedItem.row, 0);
            alert('The user selected ' + value);
          }
        }
        // Listen for the 'select' event, and call my function selectHandler() when
        // the user selects something on the chart.
        google.visualization.events.addListener(tree, 'select', selectHandler);
        tree.draw(dataTree, {
          minColor: '#f00',
          midColor: '#ddd',
          maxColor: '#0d0',
          headerHeight: 30,
          fontColor: 'black',
          showScale: true
        });
        // The select handler. Call the chart's getSelection() method
        
        
        $http.get("api/samples/spWho")
          .then(function (result) {
            var dataWho = new google.visualization.DataTable(result.data);
            var pieWho = new google.visualization.PieChart(document.getElementById('pieChartWho'));
            pieWho.draw(dataWho, {
              chartArea: { left: 20, top: 10, width: '100%', height: '100%' }
            });
          })
      });
  });
   

   


  
    
  