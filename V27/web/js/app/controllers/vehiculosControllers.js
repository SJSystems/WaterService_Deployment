/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />



mainApp.controller('buscarVehiculosCtrl', ['$scope', '$http', '$uibModal',
        function ($scope, $http, $uibModal) {
            
            // Declaraciones:
            $scope.vehiculos = {};

            $scope.GetVehiculos = function () {
                ShowLoader();

                $http.get(GetUrlForService("/Vehiculos/GetVehiculos"), {})
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            $scope.vehiculos = data.vehiculos;
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };

            // Métodos:
            $scope.Init = function () {
                $scope.vehiculos = $scope.GetVehiculos();
            };

            $scope.EliminarVehiculo = function (id) {
                ShowLoader();

                $http.post(GetUrlForService('/Vehiculos/DeleteVehiculo'), {
                    id: id
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();
                            $scope.vehiculos = $scope.GetVehiculos();

                        } else {
                            HideLoader();
                        }
                    })
                    .error(function (data, status, headers, config) {
                        HideLoader();
                    });
            };

            $scope.EditarVehiculo = function (pVehiculo, pAccion) {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/vehiculos/editarVehiculos.html',
                    controller: 'editarVehiculoController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        vehiculo: function () { return pVehiculo; },
                        accion: function () { return pAccion; },
                    }
                });
                modal.result.then(function () {
                    
                    $scope.vehiculos = $scope.GetVehiculos();
                }
                , function () {
                    
                });
            };

            $scope.Init();
        }]);

mainApp.controller('editarVehiculoController', ['$scope', '$http', 'vehiculo', 'accion', '$uibModalInstance',
    function ($scope, $http, vehiculo, accion, $uibModalInstance) {

        // Declaraciones:
        $scope.vehiculo = vehiculo;

        $scope.Init = function () {

            if (accion == 'edit') {
                $scope.mostrarId = true;
                $scope.tituloAccion = "Modificar Vehículo";
            }
            else {
                $scope.mostrarId = false;
                $scope.tituloAccion = "Nuevo Vehículo";
            }

            $http.get(GetUrlForService('/Vehiculos/GetDataForEdit'), {})
                .success(function (data, status, headers, config) {
                    if (data.error == 0) {
                        
                        $scope.marcasVehiculos = data.marcasVehiculos;
                        $scope.estadosVehiculos = data.estadosVehiculos;

                        if ($scope.vehiculo != undefined && accion == 'edit') {
                            $scope.selectedEstado = $scope.estadosVehiculos[$scope.vehiculo.estadoVehiculo_ids - 1];
                            $scope.selectedMarca = $scope.marcasVehiculos[$scope.vehiculo.marcaVehiculo_ids - 1];
                        }
                    }
                }).error(function (data, status, headers, config) { });
        };

        $scope.ValidateCamposVehiculo = function () {
            var msj = "";

            if ($scope.vehiculo != undefined) {               
                if ($scope.vehiculo.nombreVehiculo == null || $scope.vehiculo.nombreVehiculo == "")
                    msj = msj + "Debe ingresar un nombre. ";

                if ($scope.selectedEstado != undefined) {
                    $scope.vehiculo.estadoVehiculo_ids = $scope.selectedEstado.valor_ids;
                }
                if ($scope.vehiculo.estadoVehiculo_ids == null || $scope.vehiculo.estadoVehiculo_ids == "")
                    msj = msj + "Debe ingresar el estado del vehículo. ";

                if ($scope.selectedMarca != undefined) {
                    $scope.vehiculo.marcaVehiculo_ids = $scope.selectedMarca.valor_ids;
                }
                if ($scope.vehiculo.marcaVehiculo_ids == null || $scope.vehiculo.marcaVehiculo_ids == "")
                    msj = msj + "Debe ingresar la marca del vehículo. ";

                if ($scope.vehiculo.anio == null || $scope.vehiculo.anio == "")
                    msj = msj + "Debe ingresar el año del vehiculo. ";

                if ($scope.vehiculo.kilometrajeActual == null || $scope.vehiculo.kilometrajeActual == "")
                    msj = msj + "Debe ingresar el kilometraje actual del vehiculo. ";

                if ($scope.vehiculo.kilosDeCarga == null || $scope.vehiculo.kilosDeCarga == "")
                    msj = msj + "Debe ingresar los kilos de carga del vehiculo. ";

                if ($scope.vehiculo.activo == null || $scope.vehiculo.activo == "")
                    msj = msj + "Debe ingresar si el vehiculo esta activo. ";
            }
            else {
                msj = msj + "Debe ingresar los campos a continuación. ";
            }
            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {

            var validation = $scope.ValidateCamposVehiculo();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            }
            else {

                ShowLoader();
                $http.post(GetUrlForService('/Vehiculos/SaveVehiculo'),
                {
                    vehiculo: $scope.vehiculo
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();

                            $scope.vehiculo = {};
                        }
                        else {
                            ShowMessageBox(messageType_Error, "Error al Guardar");
                        }

                        HideLoader();
                        $uibModalInstance.close();

                    }).error(function (data, status, headers, config) {
                        HideLoader();
                        $uibModalInstance.close();
                    });
            }
        };

        $scope.Cerrar = function () {
            $uibModalInstance.dismiss();
        };

        $scope.Init();
    }]);

