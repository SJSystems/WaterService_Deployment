
var homeApp = angular.module(
   'homeApp',
    [
        'homeControllers'
    ]
);

var homeControllers = angular.module('homeControllers', []);

homeControllers.controller('userBarController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.incidentes = [];
        $scope.cantidadIncidenes = null;
        
        var init = function() {

            consultarIncidentes();

            setInterval(function() {
                consultarIncidentes();
            }, 30000);

        };

        var consultarIncidentes = function() {


            $http.get(GetUrlForService('/Incidentes/ObtenerIncidentesAbiertosDelUsuario'), {}).
                success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.incidentes = data.incidentes;
                        $scope.cantidadIncidenes = data.incidentes.length;
                    }

                }).error(function (data, status, headers, config) {  });


        };

        init();

    }]);


angular.bootstrap(document.getElementById("div_userBar"), ['homeApp']);