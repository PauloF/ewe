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
        var specieinfo = {};
        function selectHandler() {
          var selectedItem = chartSpecies.getSelection()[0];
          if (selectedItem) {
            var value = dataTree.getValue(selectedItem.row, 0);
            //alert('The user selected ' + value);
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
            var filterSp = JSON.stringify(filter);
            //console.log(filtro);
            drawWho(filterSp);
            drawBiome(filterSp);
          }
        }
        // Listen for the 'select' event, and call my function selectHandler() when
        // the user selects something on the chart.
        google.visualization.events.addListener(chartSpecies, 'select', selectHandler);
        chartSpecies.draw(dataTree, {
          minColor: '#33691E',
          midColor: '#8BC34A',
          maxColor: '#DCEDC8',
          headerHeight: 30,
          fontColor: 'black',
          showScale: true
        });
        // The select handler. Call the chart's getSelection() method
        
        //Draw WHO graph
        var drawWho = function (filterSp) {
          console.log(filterSp);
          var filterWho = ((filterSp) ? JSON.parse(filterSp) : {});
          var usecategory = {};
           
          $http.get('api/samples/spWho', { params: { filter: filterSp } })
            .then(function (result) {
              var dataWho = new google.visualization.DataTable(result.data);
              var chartWho = new google.charts.Bar(document.getElementById('chartWho'));
              function selectHandlerWho() {
                var selectedWho = chartWho.getSelection()[0];
                if (selectedWho) {
                  var value = dataWho.getValue(selectedWho.row, 0);
                  usecategory['who'] = value;
                  filterWho['usecategory'] = usecategory;                  
                } else {
                  filterWho = ((filterSp) ? JSON.parse(filterSp) : {});                  
                }
                console.log(JSON.stringify(filterWho));
                drawBiome(JSON.stringify(filterWho));
              }
              google.visualization.events.addListener(chartWho, 'select', selectHandlerWho);
              chartWho.draw(dataWho, {
                bar: {
                  groupWidth: 20
                },
                //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                bars: 'horizontal',
                colors: ['#B27020'],
                
                legend: {position: 'none'}
              });
            })
        }
        
        
        // Draw Biome Graph
        //
        var drawBiome = function (filterSp) {
          console.log(filterSp);
          var filterBiome = ((filterSp) ? JSON.parse(filterSp) : {});
          var passport = {};
          $http.get('api/samples/spBiome', { params: { filter: filterSp } })
            .then(function (result) {
              var dataBiome = new google.visualization.DataTable(result.data);
  //            var chartBiome = new google.visualization.PieChart(document.getElementById('chartBiome'));
              var chartBiome = new google.charts.Bar(document.getElementById('chartBiome'));
              function selectHandler() {
                var selectedBiome = chartBiome.getSelection()[0];
                if (selectedBiome) {
                  var value = dataBiome.getValue(selectedBiome.row, 0);
                  passport['biome'] = value;
                  filterBiome['passport'] = passport;
                } else {
                  filterBiome = ((filterSp) ? JSON.parse(filterSp) : {});
                }                
                drawWho(JSON.stringify(filterBiome));
              }
              google.visualization.events.addListener(chartBiome, 'select', selectHandler);
              chartBiome.draw(dataBiome, {
                chartArea: { left: 10, top: 1, width: '100%', height: '100%' }
                })
              });
            }
        
        drawWho();
        drawBiome();
      });
  });
   

   


  
    
  