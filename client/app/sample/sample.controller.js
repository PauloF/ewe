'use strict';

angular.module('eweApp')
  .controller('SampleCtrl', function ($scope, $uibModal, $http, ngTableParams, socket, $log, $mdSidenav, $mdUtil, $timeout) {
    
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
    $scope.filterSpecies = {};
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    
    $scope.changeFilter = function (filterForm) {
//      var dot = require('dotobject');
//      var filter = dot.dot(filterForm);
      var filter = filterForm;
      console.log(filter);
      angular.extend($scope.tableParams.filter(), filter);   
      console.log($scope.tableParams.filter);      
    };  
    $scope.tableParams = new ngTableParams ({
        page: 1,
        count: 10,
        filter: {} //'{"passport.biome": "Caatinga", "usecategory.who": "DGS"}'
      }, {
        total: 0,
        counts: [],
        getData: function($defer, params) {
          $http.get('/api/samples/spFullName',
            {params: {
              
              page: params.page(),
              limit : params.count(),              
              filter : params.filter()             
              }})            
          .then(function(results) {
            params.total(results.data.total);
            $defer.resolve(results.data.samples);
          });          
        }
      });

/*    $scope.applyGlobalSearch = function applyGlobalSearch() {
      var term = $scope.globalSearchTerm;
      if (self.isInvertedSearch) {
        term = "!" + term;
      }
      $scope.tableParams.filter({ $: term });
    }

    $scope.changeFilter = function changeFilter(field, value) {
      var filter = {};
      filter[field] = value;
      angular.extend($scope.tableParams.filter(), filter);
    }*/
    
      $scope.open = function(sampleID) {
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
        var sample;
        for (i in idList) {
          $http.get("/api/samples/" + idList[i])
            .then(function (result) {
              $scope.selectedSamples.push(result.data);
            });


        };

        console.log($scope.selectedSamples);
      
      };
   

    
 /*   

    $http.get('/api/samples').success(function(samples) {
      $scope.samples = samples;
            
      
      socket.syncUpdates('sample', $scope.samples);
      });
    });
*/




    $scope.addSample = function() {
      if($scope.newSample === '') {
        return;
      }
      $http.post('/api/samples', $scope.newSample );
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
  .controller('modalSampleCtrl', function ($scope, $modalInstance ) {
    $scope.sample= {};
/*    $scope.items = items;
    $scope.selected = {
      item: $scope.items[0]
    };
  */
    $scope.ok = function () {
      $modalInstance.close($scope.sample);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
});

angular.module('eweApp')
  .controller('sampleTableCtrl', function($q, $http, $scope, $timeout) {
  
  
  
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
  
  var begin = (($scope.currentPage -1) * $scope.numPerPage); 
  var end = begin + $scope.numPerPage;
  
  $scope.filteredSamples = [];
  $scope.getSamples = function() {
    $http.get('/api/samples')            
          .then (function (result) {
            console.log(result.data.length);
            return result.data;                    
          });
                    
  };     
  $scope.getSamples();
  
  
  $scope.$watch('currentPage + numPerPage', function() {
    begin = (($scope.currentPage -1) * $scope.numPerPage); 
    end = begin + $scope.numPerPage;
    console.log(begin, end, $scope.samples);
    $scope.filteredSamples= $scope.filteredSamples.slice(begin, end);
    
  });
  
  
  var sample = {};
  
  
  
  $scope.alerta = function() {
    console.log('click');
  };
  
  /*
  $scope.getTypes = function () {
    return ['Candy', 'Ice cream', 'Other', 'Pastry'];
  };
  */
  
});