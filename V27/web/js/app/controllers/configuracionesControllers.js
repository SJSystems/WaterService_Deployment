/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />


mainApp.controller('buscarConfiguracionesCtrl', ['$scope', '$http', '$uibModal',
        function ($scope, $http, $uibModal) {

            // Declaraciones:
            $scope.configuraciones = {};

            // Métodos:
            $scope.ObtenerConfiguraciones = function () {
                ShowLoader();

                $http.get(GetUrlForService("/Configuraciones/GetDataForIndex"), {})
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            $scope.configuraciones = data.configuraciones;
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };


            $scope.Init = function () {
                $scope.ObtenerConfiguraciones();
            };


            $scope.eliminarConfiguracion = function (configuracion) {
              

                bootbox.confirm("Está seguro que desea eliminar la configuración '" + configuracion.key+"'", function (result) {
                    if (result)
                    {

                        ShowLoader();
                            $http.post(GetUrlForService('/Configuraciones/Delete'), {
                                id: configuracion.id
                            })
                            .success(function (data, status, headers, config) {
                                if (data.error == 0) {
                                    HideLoader();
                                    $scope.ObtenerConfiguraciones();

                                } else {
                                    HideLoader();
                                }
                            })
                            .error(function (data, status, headers, config) {
                                HideLoader();
                            });
                    }
                })
            };


            $scope.editarConfiguracion = function (pConfiguracion, pAccion) {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/configuraciones/editarConfiguraciones.html',
                    controller: 'editarConfiguracionController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        configuracion: function () { return angular.copy(pConfiguracion); },
                        accion: function () { return pAccion; },
                    }
                });
                modal.result.then(function () {

                    $scope.ObtenerConfiguraciones();
                }
                , function () {

                });
            };

            $scope.Init();
        }]);

mainApp.controller('editarConfiguracionController',
          ['$scope', '$http', 'configuracion', 'accion', '$uibModalInstance',
    function ($scope, $http, configuracion, accion, $uibModalInstance) {

        // Declaraciones:
        $scope.configuracionXEditar = configuracion;


        $scope.Init = function () {

            if (accion == 'edit') {
                $scope.mostrarId = true;
                $scope.tituloAccion = "Modificar Configuracion";
            }
            else {
                $scope.mostrarId = false;
                $scope.tituloAccion = "Nueva Configuracion";
            }

            //$http.get(GetUrlForService('/Configuraciones/GetDataForEdit'), {})
            //    .success(function (data, status, headers, config) {

            //        if (data.error == 0) {
            //        }
            //    })
            //    .error(function (data, status, headers, config) {
            //    });
        };


        $scope.ValidateCamposConfiguracion = function () {
            var msj = "";

            if ($scope.configuracionXEditar.key == null || $scope.configuracionXEditar.key == "")
                msj = msj + "Debe ingresar la key. ";

            return { isValid: (msj == ""), message: msj };
        };


        $scope.Save = function () {

            var validation = $scope.ValidateCamposConfiguracion();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            }
            else {

                ShowLoader();
                $http.post(GetUrlForService('/Configuraciones/Save'),
                {
                    configuracion: $scope.configuracionXEditar
                })
                  .success(function (data, status, headers, config) {

                      if (data.error == 0) {
                          ShowMessageBox(messageType_Success, "Configuración guardada con éxito.");
                      }
                      else {
                          ShowMessageBox(messageType_Error, "Error al Guardar");
                      }

                      HideLoader();
                      $uibModalInstance.close();
                  })
                    .error(function (data, status, headers, config) {
                        HideLoader();
                        $uibModalInstance.close();
                    });
            }
        };


        $scope.Cerrar = function () {
            $uibModalInstance.dismiss();
        };


        // Llamadas:
        $scope.Init();
    }]);




