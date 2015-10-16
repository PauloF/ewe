'use strict';

angular.module('eweApp')
  .controller('SampleCtrl', function ($scope, $modal, $http, ngTableParams, socket, $log) {
    $scope.tableParams = new ngTableParams ({
        page: 1,
        count: 10,
      }, {
        total: 0,
        getData: function($defer, params) {
          $http.get('/api/samples/search',
            {params: {
              filter: params.filter(),
              page: params.page(),
              limit : params.count(),
              sort: params.sorting()              
              }})            
          .success(function(samples, status) {
            params.total(samples.total);
            $defer.resolve(samples.samples);
          });          
        }
      });
      $scope.open = function(sampleID) {
        var modalInstance = $modal.open({
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
  
  $scope.selected = [];
  
  $scope.query = {
    order: 'specie',
    limit: 5,
    page: 1,
    label: {
      text: ''
    }
  };
  
  $scope.samples = {};
  $http.get('/api/samples')            
          .then (function (result) {
            console.log(result.data.length);
            $scope.samples = {
              "count": result.data.length,
              "data": result.data
            };              
            console.log($scope.resSamples);
          });          
       
  
  /*
  $scope.getTypes = function () {
    return ['Candy', 'Ice cream', 'Other', 'Pastry'];
  };
  */
  $scope.onpagechange = function(page, limit) {
    var deferred = $q.defer();
    
    $timeout(function () {
      deferred.resolve();
    }, 2000);
    
    return deferred.promise;
  };
  
  $scope.onorderchange = function(order) {
    var deferred = $q.defer();
    
    $timeout(function () {
      deferred.resolve();
    }, 2000);
    
    return deferred.promise;
  };
});