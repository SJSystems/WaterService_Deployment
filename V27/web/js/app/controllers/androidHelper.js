/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

var mainApp = angular.module(
   'mainApp',
    [
        'androidHelperControllers'
    ]
);

var androidHelperControllers = angular.module('androidHelperControllers', []);

androidHelperControllers.controller('androidHelper', ['$scope', '$http',
    function($scope, $http) {

        $scope.xmlContent = null;
        $scope.control = "TextView";
        $scope.root = "this";
        $scope.declaraciones = null;
        $scope.vistas = null;

        $scope.confirmar = function () {
            
            ShowLoader();
            
            $http.post(GetUrlForService('/Misc/AndroidHelper'),
               {
                   xml: $scope.xmlContent,
                   control: $scope.control,
                   root: $scope.root
               }).
               success(function (data, status, headers, config) {

                   HideLoader();

                   $scope.declaraciones = data.declaraciones;
                   $scope.vistas = data.views;
                   $scope.metodos = data.metodos;

               }).error(function (data, status, headers, config) {
                   HideLoader();
                   ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
               });
        };

    }]);