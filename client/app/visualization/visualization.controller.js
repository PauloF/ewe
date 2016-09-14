'use strict';

angular.module('eweApp')
  .controller('VisualizationCtrl', function ($scope, $location, $uibModal, $http, socket, $log, $mdDialog, $mdSidenav, $mdUtil, $mdMedia, $timeout) {

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



    var drawSpecie = function (filter) {
      //var filterSpecie = ((filterSp) ? JSON.parse(filterSp) : {});
      console.log("Filter Specie: ", filter);

      $http.get("/api/samples/spTreeMap", { params: { filter: filter } })
        .then(function (result) {
          //console.log(JSON.stringify(result));
          var dataTree = new google.visualization.DataTable(result.data);
          var chartSpecies = new google.visualization.TreeMap(document.getElementById('chartSpecies'));
          /*var selection= [{row:1}];
          console.log(selection);          
          var selectedItem = chartSpecies.setSelection(selection);*/
          //var filter = {};
          var specieinfo = {};
          var masterFilter = ((filter) ? JSON.parse(filter) : {});
          function selectHandler() {
            var selectedItem = chartSpecies.getSelection()[0];
            if (selectedItem) {
              var value = dataTree.getValue(selectedItem.row, 0);
              //alert('The user selected ' + value);
              var level = value.split("|")[0];
              var key = value.split("|")[1];

              var selFamily = key.split(":")[0];
              var selGenus = key.split(":")[1];
              var selSpecie = key.split(":")[2];
              var selAuthority = key.split(":")[3];
              masterFilter.specieinfo = ((masterFilter.specieinfo) ? masterFilter.specieinfo : {});

              if (!masterFilter.specieinfo.family) {
                if (selFamily) {
                  masterFilter.specieinfo.family = selFamily;
                };
              };

              if (!masterFilter.specieinfo.genus) {
                if (selGenus) {
                  masterFilter.specieinfo.genus = selGenus;
                };
              };
              if (!masterFilter.specieinfo.specie) {
                if (selSpecie) {
                  masterFilter.specieinfo.specie = selSpecie;
                  masterFilter.specieinfo.authority = selAuthority;
                };
              };
              //masterFilter['specieinfo'] = specieinfo;
              var filterSpStr = JSON.stringify(masterFilter);
              //console.log(filtro);
              drawWho(filterSpStr);
              drawBiome(filterSpStr);
              drawPartUsed(filterSpStr);
              drawFormofUse(filterSpStr);
            };
          };
          // Listen for the 'select' event, and call my function selectHandler() when
          // the user selects something on the chart.
          google.visualization.events.addListener(chartSpecies, 'select', selectHandler);
          chartSpecies.draw(dataTree, {
            minColor: '#33691E',
            midColor: '#8BC34A',
            maxColor: '#DCEDC8',
            headerHeight: 30,
            fontColor: 'black'
          });
          // The select handler. Call the chart's getSelection() method

          //Draw WHO graph
          var drawWho = function (filterSp) {
            console.log(filterSp);
            var filterWho = ((filterSp) ? JSON.parse(filterSp) : {});
            //var filterWho = ((filterSp) ? filterSp : {});
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
                  var filterWhoStr = JSON.stringify(filterWho);
                  console.log("FilterWho: ", filterWhoStr);
                  drawBiome(filterWhoStr);
                  drawPartUsed(filterWhoStr);
                  drawFormofUse(filterWhoStr);
                }
                google.visualization.events.addListener(chartWho, 'select', selectHandlerWho);
                chartWho.draw(dataWho, {
                  bar: {
                    groupWidth: 20
                  },
                  //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                  bars: 'horizontal',
                  colors: ['#B27020'],

                  legend: { position: 'none' }
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
                  var filterBiomeStr = JSON.stringify(filterBiome);
                  console.log("filterBiome: ", filterBiomeStr);
                  drawWho(filterBiomeStr);                  
                  drawPartUsed(filterBiomeStr);
                  drawFormofUse(filterBiomeStr);
                }
                google.visualization.events.addListener(chartBiome, 'select', selectHandler);
                chartBiome.draw(dataBiome, {
                  chartArea: { left: 10, top: 1, width: '100%', height: '100%' }
                })
              });
          }

          // Draw partUsed Graph
          //
          var drawPartUsed = function (filterSp) {
            console.log(filterSp);
            var filterPartUsed = ((filterSp) ? JSON.parse(filterSp) : {});
            var passport = {};
            $http.get('api/samples/spPartUsed', { params: { filter: filterSp } })
              .then(function (result) {
                var dataPartUsed = new google.visualization.DataTable(result.data);
                //            var chartBiome = new google.visualization.PieChart(document.getElementById('chartBiome'));
                var chartPartUsed = new google.charts.Bar(document.getElementById('chartPartUsed'));
                function selectHandler() {
                  var selectedPartUsed = chartPartUsed.getSelection()[0];
                  if (selectedPartUsed) {
                    var value = dataPartUsed.getValue(selectedPartUsed.row, 0);
                    //passport['biome'] = value;
                    filterPartUsed['partused'] = value;
                  } else {
                    filterPartUsed = ((filterSp) ? JSON.parse(filterSp) : {});
                  }
                  var filterPartUsedStr = JSON.stringify(filterPartUsed);
                  console.log("filterPartUsed: ", filterPartUsedStr);
                  drawWho(filterPartUsedStr);
                  drawBiome(filterPartUsedStr);
                  drawFormofUse(filterPartUsedStr);
                }
                google.visualization.events.addListener(chartPartUsed, 'select', selectHandler);
                chartPartUsed.draw(dataPartUsed, {
                  //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                  bar: {
                    groupWidth: 20
                  },
                  //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                  bars: 'horizontal',
                  colors: ['#B27020'],

                  legend: { position: 'none' }
                })
              });
          }
          // Draw FormofUsed Graph
          //
          var drawFormofUse = function (filterSp) {
            console.log(filterSp);
            var filterFormofUse = ((filterSp) ? JSON.parse(filterSp) : {});
            var passport = {};
            $http.get('api/samples/spFormofUse', { params: { filter: filterSp } })
              .then(function (result) {
                var dataFormofUse = new google.visualization.DataTable(result.data);
                //            var chartBiome = new google.visualization.PieChart(document.getElementById('chartBiome'));
                var chartFormofUse = new google.charts.Bar(document.getElementById('chartFormofUse'));
                function selectHandler() {
                  var selectedFormofUse = chartFormofUse.getSelection()[0];
                  if (selectedFormofUse) {
                    var value = dataFormofUse.getValue(selectedFormofUse.row, 0);
                    //passport['biome'] = value;
                    filterFormofUse['formofuse'] = value;
                  } else {
                    filterFormofUse = ((filterSp) ? JSON.parse(filterSp) : {});
                  }
                  var filterFormofUseStr = JSON.stringify(filterFormofUse);
                  console.log("filterFormofUse: ", filterFormofUseStr);
                  drawWho(filterFormofUseStr);
                  drawBiome(filterFormofUseStr);
                  drawPartUsed(filterFormofUseStr);
                }
                google.visualization.events.addListener(chartFormofUse, 'select', selectHandler);
                chartFormofUse.draw(dataFormofUse, {
                  //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                  bar: {
                    groupWidth: 20
                  },
                  //chartArea: { left: 10, top: 1, width: '100%', height: '100%' },
                  bars: 'horizontal',
                  colors: ['#B27020'],

                  legend: { position: 'none' }
                })
              });
          }

          drawWho(filter);
          drawBiome(filter);
          drawPartUsed(filter);
          drawFormofUse(filter);
        });
    };

    var search = $location.search();
    //var filterStr = Json.stringify(filter);
    //console.log ("filtro visual: ", search.filter);
    //if (filterStr != "{}") {



    drawSpecie(search.filter);
  });







