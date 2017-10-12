/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />


mainApp.controller('buscarCiudadesCtrl', ['$scope', '$http', '$uibModal',
        function ($scope, $http, $uibModal) {
            
            // Declaraciones:
            $scope.ciudades = {};

            $scope.ObtenerCiudades = function () {
                ShowLoader();

                $http.get(GetUrlForService("/Ciudades/GetDataForIndex"), {})
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            $scope.ciudades = data.ciudades;
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };

            // Métodos:
            $scope.Init = function () {
                $scope.ciudades = $scope.ObtenerCiudades();
            };

            $scope.EliminarCiudad = function (id) {
                ShowLoader();

                $http.post(GetUrlForService('/Ciudades/DeleteCiudad'), {
                    id: id
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();
                            $scope.ciudades = $scope.ObtenerCiudades();

                        } else {
                            HideLoader();
                        }
                    })
                    .error(function (data, status, headers, config) {
                        HideLoader();
                    });
            };

            $scope.EditarCiudad = function (pCiudad, pAccion) {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/ciudades/editarCiudad.html',
                    controller: 'editarCiudadController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        ciudad: function () { return pCiudad; },
                        accion: function () { return pAccion; },
                    }
                });
                modal.result.then(function () {
                    
                    $scope.ciudades = $scope.ObtenerCiudades();
                }
                , function () {
                    
                });
            };

            $scope.Init();
        }]);

mainApp.controller('editarCiudadController', ['$scope', '$http', 'ciudad', 'accion', '$uibModalInstance',
    function ($scope, $http, ciudad, accion, $uibModalInstance) {

        // Declaraciones:
        $scope.ciudad = ciudad;
        $scope.ciudades = {};

        $scope.Init = function () {

            if (accion == 'edit') {
                $scope.mostrarId = true;
                $scope.tituloAccion = "Modificar Ciudad";
            }
            else {
                $scope.mostrarId = false;
                $scope.tituloAccion = "Nueva Ciudad";
            }

            $http.get(GetUrlForService('/Ciudades/GetDataForEdit'), {})
                .success(function (data, status, headers, config) {
                    //if (data.error == 0) {
                    //    $scope.provincias = data.provincias;
                    //}

                    if (data.error == 0) {
                        
                        $scope.provincias = data.provincias;

                        if ($scope.ciudad != undefined && accion == 'edit') {
                            $scope.selectedProvincia = $scope.provincias[$scope.ciudad.provincia_ids - 1];
                        }
                    }

                }).error(function (data, status, headers, config) { });
        };

        $scope.ValidateCamposCiudad = function () {
            var msj = "";

            //if ($scope.ciudad.provincia_ids == null)
            //    msj = msj + "Debe seleccionar una provincia. ";
            if ($scope.ciudad != undefined) {
                //if ($scope.selectedProvincia != undefined) {
                //    $scope.ciudad.provincia_ids = $scope.selectedProvincia.valor_ids;
                //}
                if ($scope.ciudad.provincia_ids == null || $scope.ciudad.provincia_ids == "")
                    msj = msj + "Debe ingresar la provincia. ";


                if ($scope.ciudad.nombreCiudad == null || $scope.ciudad.nombreCiudad == "")
                    msj = msj + "Debe ingresar el nombre de la ciudad. ";

                if ($scope.ciudad.codigoExterno == null || $scope.ciudad.codigoExterno == "")
                    msj = msj + "Debe ingresar el código externo. ";
            }
            else {
                msj = msj + "Debe ingresar los campos a continuación. ";
            }
            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {

            var validation = $scope.ValidateCamposCiudad();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            }
            else {

                ShowLoader();
                $http.post(GetUrlForService('/Ciudades/SaveCiudad'),
                {
                    ciudad: $scope.ciudad
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();

                            $scope.ciudad = {};
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




