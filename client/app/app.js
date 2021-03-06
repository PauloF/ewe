/// <reference path="../../typings/angularjs/angular.d.ts"/>
'use strict';

google.charts.load('current', {
  packages: ['corechart', 'treemap', 'geochart', 'map', 'bar' ]
});

google.charts.setOnLoadCallback(function() {
  angular.bootstrap(document.body, ['eweApp']);
});

angular.module('eweApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'btford.socket-io',
  'ui.bootstrap',
  'ngMaterial',
  'ngTable',
  'ngMdIcons',  
  'treeControl',
  'nemLogging',
  'ui-leaflet'  
])
  .controller('eweAppCtrl', ['$scope', '$mdBottomSheet','$mdSidenav', '$mdDialog', function($scope, $mdBottomSheet, $mdSidenav, $mdDialog) {
  
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
 	$scope.menu = [
    {
      link : '/',
      title: 'Home',
      icon: 'home'
    },
    {
      link : '/sample',
      title: 'Search',
      icon: 'search'
    },
    {
      link : '',
      title: 'Add new records',
      icon: 'add'
    },
    {
      link : '/visualization',
      title: 'Visualize',
      icon: 'dashboard'
    },
    {
      link : '',
      title: 'Contact',
      icon: 'contacts'
    }
  ];
  }])
  .config(function ($routeProvider, $locationProvider, $httpProvider, $mdThemingProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('yellow');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });