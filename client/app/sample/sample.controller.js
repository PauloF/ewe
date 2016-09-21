/// <reference path="../../../typings/angularjs/angular.d.ts"/>

'use strict';

angular.module('eweApp')
  .controller('SampleCtrl', function ($scope, $uibModal, $window, $http, NgTableParams, socket, $log, $mdDialog, $mdSidenav, $mdUtil, $mdMedia, $timeout) {

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
    var self = this;

    $scope.showDetail = false;
    $scope.showMap = false;
    $scope.specieDetail = {};

    $scope.toggleDetail = function (specie) {
      $scope.showDetail = !$scope.showDetail;
      $scope.showMap = !$scope.showMap;
      if (specie !== $scope.specieDetail) {
        $scope.specieDetail = specie;
        $scope.showDetail = true;
        if (specie.passport.coordinates) {
          var lat = specie.passport.coordinates.lat;
          var lng = specie.passport.coordinates.lon;
          var message = "<i>" + specie.specieinfo.genus + " " + specie.specieinfo.specie + "</i> " + specie.specieinfo.authority;
          drawSpMap(lat, lng, message);
          $scope.showMap = true;
        } else {
          $scope.showMap = false;
        }
      }
    };


    $scope.toggleSidenav = function (menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.clearFilter = function () {
      $scope.tableParams.filter({})
    }

    self.changeFilter = changeFilter;

    function changeFilter(field, value) {
      var filter = {};
      filter[field] = value;
      angular.extend(self.tableParams.filter(), filter)
    };

    $scope.showFilter = function (ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
      $mdDialog.show({
        controller: DialogController,
        //        scope: $scope,
        templateUrl: 'app/sample/sampleFilter.tmpl.html',
        targetEvent: ev,
        clickOutsideToClose: true,
        parent: angular.element(document.body),
        fullscreen: useFullScreen
      })
        .then(function (filterForm) {
          $scope.changeFilter(filterForm);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
      $scope.$watch(function () {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function (wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    };

    $scope.showGraphs = function showGraphs() {
      var filter = {};
      if (typeof $scope.selectedNode != "undefined") {
        filter = { "specieinfo": $scope.selectedNode.samplesKey }
      };
      filter = JSON.stringify(filter)
      if (filter != "{}") {
        $window.location.href = "/visualization?filter=" + filter;
      } else {
        $window.location.href = "/visualization"
      }
    };





    //Specie tree
    var unflatten = function (array, parent, tree) {

      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : { id: 0 };

      var children = _.filter(array, function (child) { return child.parent == parent.id; });

      if (!_.isEmpty(children)) {
        if (parent.id == 0) {
          tree = children;
        } else {
          parent['children'] = children;
        }
        _.each(children, function (child) { unflatten(array, child) });
      } /*else { parent['children'] = []; }*/

      return tree;
    };

    $scope.items = [];
    $http.get('/api/samples/spTree').success(function (results) {
      $scope.treedata = unflatten(results);
      $scope.showSelected = function (sel) {
        var filter = {};
        $scope.selectedNode = sel;
        filter = { "specieinfo": $scope.selectedNode.samplesKey }
        angular.extend(self.tableSample.filter(), filter)
        //        console.log("Filtro: ", self.tableSample.filter());
      }
    });

    //end specie tree

    var parseSort = function (sortParams) {
      var sort = {};
      var keys = Object.keys(sortParams);
      var value = sortParams[keys[0]];
      var keysArray = keys[0].split(",");
      for (var i in keysArray) {
        sort[keysArray[i]] = value;
      };
      return sort;
    };

    //specie table
    self.tableSample = new NgTableParams({
      page: 1,
      count: 10,
      filter: {},
      sorting: { "specieinfo.genus,specieinfo.specie": "asc" }
      //        {"specieinfo":{"family":"","genus":"","specie":""},"ethnoinfo":{"commonname":""},"passport":{"biome":""},"usecategory":{"who":"","traditional":""},"partused":"","formofuse":""}
      //'{"passport.biome": "Caatinga", "usecategory.who": "DGS"}'
    }, {
        total: 0,
        counts: [],
        getData: function (params) {
          return $http.get('/api/samples/search',
            {
              params: {

                page: params.page(),
                limit: params.count(),
                filter: params.filter(),
                sort: parseSort(params.sorting())
              }
            })
            .then(function (results) {
              params.total(results.data.samples.total);
              //             console.log("Total: ", results.data.samples.total);
              //             console.log("Results: ", results.data.samples.docs);
              return results.data.samples.docs;
            });
        }
      }
    );
    //end specie table

    //Map selected specie controller
    function drawSpMap(lat, lng, message) {
      angular.extend($scope, {
        bsbCenter: {
          lat: -15.7797200,
          lng: -47.9297200,
          zoom: 4
        },
        markers: {
          specieMarker: {
            lat: lat,
            lng: lng,
            message: message,
            focus: true,
            draggable: false
          }
        },
        layers: {
          baselayers: {
            agsBase: {
					    	name: "AGSBase",
					        type: "agsBase",
					        layer: "Streets",
					        visible: true
				    	},
            xyz: {
              name: 'OpenStreetMap (XYZ)',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz',
              visible: false
            }
          },
          overlays: {
            biome: {
              name: "Biome",
              type: "agsFeature",
              //url: "http://mapasinterativos.ibge.gov.br/arcgis/rest/services/BIOMA/MapServer/0",
              url: "http://gis-gfw.wri.org/arcgis/rest/services/country_data/south_america/MapServer/4",
              visible: true,
              layerOptions: {
                simplifyFactor: 0.5,
                precision: 5,
                style: function (feature) {
                  if (feature.properties.name === "Amazônia") {
                    return { color: "olive", weight: 2 };
                  } else if (feature.properties.name === "Caatinga") {
                    return { color: "sandybrown", weight: 2 };
                  } else if (feature.properties.name === "Mata Atlântica") {
                    return { color: "green", weight: 2 };
                  } else if (feature.properties.name === "Cerrado") {
                    return {color: "yellow", weight: 2};
                  }  else if (feature.properties.name === "Pampa") {
                    return {color: "red", weight: 2};
                  }  else if (feature.properties.name === "Pantanal") {
                    return {color: "blue", weight: 2};
                  } else {
                    return {color:"gray", weight:2}
                  }
                }
              }
            }
          }
        },
        defaults: {
          scrollWheelZoom: false
        }
      });
    }



    //modal filter control
    function DialogController($scope, $mdDialog) {
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.submit = function (filterForm) {
        $mdDialog.hide(filterForm);
      };
    }
    //end modal filter control





    $scope.open = function (sampleID) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/sample/modalSample.html',
        controller: 'modalSampleCtrl',
        animation: false,
        backdrop: true
      });

      modalInstance.result.then(function (sample) {
        $scope.newSample = sample;
        $scope.addSample();
      }, function () {

      });
    };

    $scope.showSample = function (idList) {
      $scope.selectedSamples = [];
      var i;

      for (i in idList) {
        $http.get("/api/samples/" + idList[i])
          .then(function (result) {
            $scope.selectedSamples.push(result.data);
          });


      };


    };



    /*   
   
       $http.get('/api/samples').success(function(samples) {
         $scope.samples = samples;
               
         
         socket.syncUpdates('sample', $scope.samples);
         });
       });
   */




    $scope.addSample = function () {
      if ($scope.newSample === '') {
        return;
      }
      $http.post('/api/samples', $scope.newSample);
      $scope.newSample = '';
    };

    /*    $scope.deleteThing = function(thing) {
          $http.delete('/api/things/' + thing._id);
        };
    
        $scope.$on('$destroy', function () {
          socket.unsyncUpdates('thing');
        });
     */

  });


angular.module('eweApp')
  .controller('modalSampleCtrl', function ($scope, $uibModalInstance) {
    $scope.sample = {};
    /*    $scope.items = items;
        $scope.selected = {
          item: $scope.items[0]
        };
      */
    $scope.ok = function () {
      $uibModalInstance.close($scope.sample);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });

angular.module('eweApp')
  .controller('sampleTableCtrl', function ($q, $http, $scope, $timeout) {



    $scope.filteredSamples = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.maxSize = 5;

    $scope.query = {
      order: 'specie',
      limit: 5,
      page: 1,
      label: {
        text: ''
      }
    };

    var begin = (($scope.currentPage - 1) * $scope.numPerPage);
    var end = begin + $scope.numPerPage;

    $scope.filteredSamples = [];
    $scope.getSamples = function () {
      $http.get('/api/samples')
        .then(function (result) {
          //         console.log(result.data.length);
          return result.data;
        });

    };
    $scope.getSamples();


    $scope.$watch('currentPage + numPerPage', function () {
      begin = (($scope.currentPage - 1) * $scope.numPerPage);
      end = begin + $scope.numPerPage;
      //      console.log(begin, end, $scope.samples);
      $scope.filteredSamples = $scope.filteredSamples.slice(begin, end);

    });






    $scope.alerta = function () {
      //     console.log('click');
    };

    /*
    $scope.getTypes = function () {
      return ['Candy', 'Ice cream', 'Other', 'Pastry'];
    };
    */


  });
