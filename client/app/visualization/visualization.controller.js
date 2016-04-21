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
        var chartSpecies = new google.visualization.TreeMap(document.getElementById('chartSpecies'));
        var filter = {};
        $scope.filtro = "";
        var specieinfo = {};
        function selectHandler() {
          var selectedItem = chartSpecies.getSelection()[0];
          if (selectedItem) {
            var value = dataTree.getValue(selectedItem.row, 0);
            alert('The user selected ' + value);
            var level = value.split("|")[0];
            var key = value.split("|")[1];

            var family = key.split(":")[0];
            var genus = key.split(":")[1];
            var specie = key.split(":")[2];
            var authority = key.split(":")[3];

            if (family) {
              specieinfo['family'] = family;
            }
            if (genus) {
              specieinfo['genus'] = genus;
            }
            if (specie) {
              specieinfo['specie'] = specie;
              specieinfo['authority'] = authority;
            }
            filter['specieinfo'] = specieinfo;
            $scope.filtro = JSON.stringify(filter);
            console.log($scope.filtro);
            drawWho();
            drawBiome();
          }
        }
        // Listen for the 'select' event, and call my function selectHandler() when
        // the user selects something on the chart.
        google.visualization.events.addListener(chartSpecies, 'select', selectHandler);
        chartSpecies.draw(dataTree, {
          minColor: '#f00',
          midColor: '#ddd',
          maxColor: '#0d0',
          headerHeight: 30,
          fontColor: 'black',
          showScale: true
        });
        // The select handler. Call the chart's getSelection() method
        var drawWho = function () {
          console.log($scope.filtro);
          $http.get('api/samples/spWho', { params: { filter: $scope.filtro } })
            .then(function (result) {
              var dataWho = new google.visualization.DataTable(result.data);
              var chartWho = new google.charts.Bar(document.getElementById('chartWho'));
              chartWho.draw(dataWho, {
                //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                bars: 'horizontal',
                
                legend: {position: 'none'}
              });
            })
        }
        
        var drawBiome = function () {
          console.log($scope.filtro);
          $http.get('api/samples/spBiome', { params: { filter: $scope.filtro } })
            .then(function (result) {
              var dataBiome = new google.visualization.DataTable(result.data);
              var chartBiome = new google.visualization.PieChart(document.getElementById('chartBiome'));
              chartBiome.draw(dataBiome, {
                chartArea: { left: 10, top: 1, width: '100%', height: '100%' }
                })
              });
            }
        
        drawWho();
        drawBiome();
      });
  });
   

   


  
    
  