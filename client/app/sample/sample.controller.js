'use strict';

angular.module('eweApp')
  .controller('SampleCtrl', function ($scope, $http, ngTableParams, socket) {
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
      
    
    
 /*   

    $http.get('/api/samples').success(function(samples) {
      $scope.samples = samples;
            
      
      socket.syncUpdates('sample', $scope.samples);
      });
    });
*/



/*
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
 */
 
  });
