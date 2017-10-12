/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

//var mainApp = angular.module(
//   'app',
//    [
//        'repartosControllers'
//    ]
//);

//var repartosCtrl = angular.module('repartosControllers', []);

mainApp.controller('buscarRepartosCtrl', ['$scope', '$http', '$rootScope',
        function ($scope, $http, $rootScope) {
            // Declaraciones:
            $scope.repartos = null;
            $scope.mostrarId = true;

            // Métodos:
            $rootScope.ObtenerRepartos = function () {
                ShowLoader();

                $http.get(GetUrlForService("/Repartos/GetRepartosAll"), {})
                    .success(function (data, status, headers, config) {

                        if (data.error == 0) {
                            $scope.repartos = data.repartos;
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };

            $scope.EliminarReparto = function (id) {
                ShowLoader();

                $http.post(GetUrlForService('/Repartos/DeleteReparto'), {
                    id: id
                }).success(function (data, status, headers, config) {
                    if (data.error == 0) {

                        HideLoader();
                        $rootScope.ObtenerRepartos();

                        setTimeout(function () {
                            setTooltip();
                        }, 300);
                    } else {
                        HideLoader();
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
            };

            $scope.EditarReparto = function (reparto) {

                $scope.mostrarId = true;

                $rootScope.$broadcast('onEditarReparto', reparto);
                $("#dialog_repartos").dialog("open");
            };

            $scope.NuevoReparto = function () {

                $scope.reparto = {
                    id: null,
                    repartidor_id: null,
                    nombreReparto: null,
                    codigoReparto: null,
                    movil_id: null,
                    vehiculoPredeterminado_id: null
                };

                $scope.mostrarId = false;
                $rootScope.$broadcast('onNuevoReparto', $scope.reparto);
                $("#dialog_repartos").dialog("open");
            };

            var setDialogs = function () {
                $("#dialog_repartos").dialog(
                    {
                        autoOpen: false,
                        height: 400,
                        width: 800,
                        modal: false
                    }
                );
            };

            $scope.abrirDialogo = function (divId) {
                $("#" + divId).dialog("open");
            };

            $scope.init = function () {
                RunTimer(function () {
                    setDialogs();                
                }, 300);

                $rootScope.ObtenerRepartos();
            };

            $scope.init();

        }]);

mainApp.controller('nuevoRepartoCtrl', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        // Declaraciones:
        $scope.mostrarId = false;

        $scope.$on('onEditarReparto', function (event, data) {
            $scope.reparto = data;

            $rootScope.accion = "Editar Reparto";
            $scope.mostrarId = true;
        });

        $scope.$on('onNuevoReparto', function (event, data) {
            $scope.reparto = data;

            $rootScope.accion = "Registrar Reparto";
            $scope.mostrarId = false;
        });

        $scope.ValidateCamposReparto = function () {
            var msj = "";
            if ($scope.reparto.id == null && $scope.$rootScope == "Editar Reparto")
                msj = "Debe ingresar el número de reparto. ";

            if ($scope.reparto.repartidor_id == null)
                msj = msj + "Debe seleccionar un móvil. ";

            if ($scope.reparto.nombreReparto == null)
                msj = msj + "Debe ingresar el nombre del reparto. ";

            if ($scope.reparto.codigoReparto == null)
                msj = msj + "Debe ingresar el código. ";

            if ($scope.reparto.movil_id == null)
                msj = msj + "Debe seleccionar un móvil. ";

            if ($scope.reparto.vehiculoPredeterminado_id == null)
                msj = msj + "Debe seleccionar un vehículo. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {

            var validation = $scope.ValidateCamposReparto();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            }
            else {

                ShowLoader();
                $http.post(GetUrlForService('/Repartos/SaveReparto'),
                {
                    reparto: $scope.reparto
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();

                            $scope.reparto = {};                            
                        }
                        else {                            
                            ShowMessageBox(messageType_Error, "Error al Guardar");
                        }

                        HideLoader();
                        $("#dialog_repartos").dialog("close");

                        $rootScope.ObtenerRepartos();

                    }).error(function (data, status, headers, config) {
                        HideLoader();
                    });
            }
        };

        $scope.Init = function () {

            if ($scope.mostrarId) {            
                $rootScope.accion = "Editar Reparto";
            } else {
                $rootScope.accion = "Registrar Reparto";
            }

            $http.get(GetUrlForService('/Repartos/DataForNewReparto'), {})
            .success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.moviles = data.moviles;
                    $scope.vehiculos = data.vehiculos;
                    $scope.usuarios = data.usuarios;
                }

            }).error(function (data, status, headers, config) { });
        };
        
        $scope.Init();
    }]);