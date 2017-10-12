/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />


mainApp.controller('buscarMovilesCtrl', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

            // Declaraciones:
            $scope.moviles = {};

            $scope.ObtenerMoviles = function () {
                ShowLoader();

                $http.get(GetUrlForService("/Moviles/ObtenerMoviles"), {})
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            $scope.moviles = data.moviles;
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };

            // Métodos:
            $scope.Init = function () {
                $scope.moviles = $scope.ObtenerMoviles();
            };

            $scope.EliminarMovil = function (id) {
                ShowLoader();

                $http.post(GetUrlForService('/Moviles/DeleteMovil'), {
                    id: id
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();
                            $scope.moviles = $scope.ObtenerMoviles();

                        } else {
                            HideLoader();
                        }
                    })
                    .error(function (data, status, headers, config) {
                        HideLoader();
                    });
            };

            $scope.EditarMovil = function (pMovil, pAccion) {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/moviles/editarMovil.html',
                    controller: 'editarMovilController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        movil: function () { return pMovil; },
                        accion: function () { return pAccion; },
                    }
                });
                modal.result.then(function () {
                    
                   $scope.ObtenerMoviles();
                }
                , function () {
                });
            };

            $scope.Init();
        }]);

mainApp.controller('editarMovilController', ['$scope', '$http', 'movil', 'accion', '$uibModalInstance',
    function ($scope, $http, movil, accion, $uibModalInstance) {

        // Declaraciones:
        $scope.movil = movil;

        $scope.Init = function () {

            if (accion == 'edit') {
                $scope.mostrarId = true;
                $scope.tituloAccion = "Modificar Móvil";
            }
            else {
                $scope.mostrarId = false;
                $scope.tituloAccion = "Nuevo Móvil";
            }

            $http.get(GetUrlForService('/Moviles/GetDataForEdit'), {
                params: {
                    movilId: $scope.movil==null? 0 : $scope.movil.id
                }
            }).success(function (data, status, headers, config) {

                if (data.error == 0) {
                    
                    $scope.usuarios = data.usuarios;
                    $scope.estadosMovil = data.estadosMovil;
                    $scope.movil = data.movil;
                }

            }).error(function (data, status, headers, config) { });
        };

        $scope.ValidateCamposMovil = function () {
            var msj = "";
                        
            if ($scope.movil != undefined) {               
                if ($scope.movil.descripcion == null || $scope.movil.descripcion == "")
                    msj = msj + "Debe ingresar una descripción. ";

                if ($scope.movil.numeroTelefono == null || $scope.movil.numeroTelefono == "")
                    msj = msj + "Debe ingresar el número de teléfono. ";

                if ($scope.movil.activo == null || $scope.movil.activo == "")
                    msj = msj + "Debe ingresar el activo. ";

                //$scope.movil.repartidor_id = $scope.selectedEstado.id;
                if ($scope.movil.repartidor_id == null || $scope.movil.repartidor_id == "")
                    msj = msj + "Debe ingresar el repartidor. ";

                if ($scope.movil.codigoIdentificacionDeMovil == null || $scope.movil.codigoIdentificacionDeMovil == "")
                    msj = msj + "Debe ingresar el código de identificación. ";
            }
            else {
                msj = msj + "Debe ingresar los campos a continuación. ";
            }
            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {

            var validation = $scope.ValidateCamposMovil();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            }
            else {

                ShowLoader();
                $http.post(GetUrlForService('/Moviles/SaveMovil'),
                {
                    movil: $scope.movil
                })
                    .success(function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {
                            $uibModalInstance.close();
                        }
                        else {
                            ShowMessageBox(messageType_Error, "Error al Guardar", data.message);
                        }


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

