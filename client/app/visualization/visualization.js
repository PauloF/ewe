'use strict';

angular.module('eweApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/visualization', {
        templateUrl: 'app/visualization/visualization.html',
        controller: 'VisualizationCtrl'
      });
  });