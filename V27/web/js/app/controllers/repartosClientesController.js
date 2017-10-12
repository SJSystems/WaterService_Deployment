/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

var mainApp = angular.module(
   'app',
    [
        'repartosClientesControllers'
    ]
);

var repartosClientesControllers = angular.module('repartosClientesControllers', []);

repartosClientesControllers.controller('repartosClientesCtrl', ['$scope', '$http',
        function ($scope, $http) {
            
            //declaraciones
            $scope.modelo = {};

            $scope.guardarCambios = function () {
                
                ShowLoader();

                $http.post(GetUrlForService("/Clientes/GuardarDiasDeVisita"), {
                    dia_lunes: $scope.modelo.dia_lunes,
                    dia_martes: $scope.modelo.dia_martes,
                    dia_miercoles: $scope.modelo.dia_miercoles,
                    dia_jueves: $scope.modelo.dia_jueves,
                    dia_viernes: $scope.modelo.dia_viernes,
                    dia_sabado: $scope.modelo.dia_sabado,
                    dia_domingo: $scope.modelo.dia_domingo,
                    cliente_id: $scope.cliente_id
                }).
                success(
                    function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Confirmación", data.message);
                            window.location.reload();

                        } else {
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }

                    }
                    ).error(function (data) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });

            };

            $scope.init = function () {
                
                GLOBAL_CONFIG.finishLoading = false;

                $scope.cliente_id = $("#ClienteModelo_id").val();

                $http.get(GetUrlForService('/Clientes/ObtenerClienteYDiasDeVisita'), {
                    params: {
                        cliente_id: $scope.cliente_id
                    }
                }).
                success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.modelo = data.data;

                        GLOBAL_FUNCTIONS.hideLoadingScreen();

                        setTimeout(function () {
                            setTooltip();
                        }, 300);

                    } else {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    }

                }).error(function (data, status, headers, config) {
                    GLOBAL_FUNCTIONS.hideLoadingScreen();
                });
            };

            $scope.init();

        }]
);
