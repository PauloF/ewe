'use strict';

angular.module('eweApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/sample', {
        templateUrl: 'app/sample/sample.html',
        controller: 'SampleCtrl'
      });
  });