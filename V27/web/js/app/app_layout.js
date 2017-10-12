/// <reference path="../General_OnLoad.js" />

var layoutApp = angular.module(
   'layoutApp',
    [
        'ngRoute'
        , 'layoutControllers'
    ]
);

var layoutControllers = angular.module('layoutControllers', []);

layoutControllers.controller('layoutController', ['$scope', '$http',
      function ($scope, $http) {

          $scope.init = function () {

              alert("sdas");
          };

          GLOBAL_FUNCTIONS.runTimer($scope.init, 300);
                   
      }
]);
