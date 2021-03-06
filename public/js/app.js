'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/pres', {templateUrl: 'partials/partial1.html', controller: 'switcher'});
  $routeProvider.when('/journo', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/ingest', {templateUrl: 'partials/ingest.html', controller: 'MyCtrl1'});
  $routeProvider.otherwise({redirectTo: '/journo'});
}]);
