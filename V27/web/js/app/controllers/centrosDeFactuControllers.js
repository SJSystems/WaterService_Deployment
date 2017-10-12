/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />


mainApp.controller('buscarCentrosDeFactuCtrl', ['$scope', '$http', '$uibModal',
        function ($scope, $http, $uibModal) {

            // Declaraciones:
            $scope.centros = {};
            $scope.soloActivos = false;

            $scope.ObtenerCentros = function () {
                ShowLoader();

                $http.get(GetUrlForService("/CentrosDeFacturacion/GetDataForIndex"),
                    {
                        params: {
                            pSoloActivos: $scope.soloActivos
                        }
                    })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            $scope.centros = data.centros;
                        }

                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
            };

            // Métodos:
            $scope.Init = function () {

                $scope.ObtenerCentros();
            };

            $scope.EliminarCentrosDeFactu = function (id) {
                ShowLoader();

                $http.post(GetUrlForService('/CentrosDeFacturacion/Delete'), {
                    id: id
                })
                    .success(function (data, status, headers, config) {
                        if (data.error == 0) {
                            HideLoader();
                            //$scope.ciudades = $scope.ObtenerCiudades();
                            $scope.ObtenerCentros();
                        } else {
                            HideLoader();
                        }
                    })
                    .error(function (data, status, headers, config) {
                        HideLoader();
                    });
            };

            $scope.EditarCentrosDeFactu = function (pCentro, pAccion) {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/centrosDeFacturacion/editarCentros.html',
                    controller: 'editarCentrosDeFactuCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        centro: function () { return pCentro; },
                        accion: function () { return pAccion; },
                    }
                });
                modal.result.then(function () {

                    //$scope.ciudades = $scope.ObtenerCiudades();
                    $scope.ObtenerCentros();
                }
                , function () {

                });
            };

            $scope.Init();
        }]);

mainApp.controller('editarCentrosDeFactuCtrl', ['$scope', '$http', 'centro', 'accion', '$uibModalInstance',
    function ($scope, $http, centro, accion, $uibModalInstance) {

        // Declaraciones:
        $scope.centro = centro;
        $scope.centros = {};

        var formData = new FormData();


        // Métodos:

        $scope.Init = function () {

            if (accion == 'edit') {
                $scope.mostrarId = true;
                $scope.tituloAccion = "Editar Centro de Facturación";
            }
            else {
                $scope.mostrarId = false;
                $scope.tituloAccion = "Agregar Centro de Facturación";
            }

            $http.get(GetUrlForService('/CentrosDeFacturacion/GetDataForEdit'), {})
                .success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.tiposDeFactu = data.tiposDeFactu;

                        $scope.entornos = [
                            {
                                name: 'TESTING'
                            },
                            {
                                name: 'PRODUCCION'
                            }
                        ];
                    }
                }).error(function (data, status, headers, config) { });
        };

        $scope.ValidarCampos = function () {
            var msj = "";

            if ($scope.centro != undefined) {

                if ($scope.centro.razonSocial == null || $scope.centro.razonSocial == "")
                    msj = msj + "Debe ingresar la razon social. ";

                if ($scope.centro.nombreDeFantasia == null || $scope.centro.nombreDeFantasia == "")
                    msj = msj + "Debe ingresar el nombre de fantasía. ";

                if ($scope.centro.fechaInicioActividades == null || $scope.centro.fechaInicioActividades == "")
                    msj = msj + "Debe ingresar la fecha de Inicio. ";

                if ($scope.centro.condicionIva == null || $scope.centro.condicionIva == "")
                    msj = msj + "Debe ingresar la condición frente al Iva. ";

                if ($scope.centro.cuit == null || $scope.centro.cuit == "")
                    msj = msj + "Debe ingresar el cuit. ";

                if ($scope.centro.domicilio == null || $scope.centro.domicilio == "")
                    msj = msj + "Debe ingresar el domicilio. ";

                if ($scope.centro.emailEmpresa == null || $scope.centro.emailEmpresa == "")
                    msj = msj + "Debe ingresar el email. ";

                if ($scope.centro.sitioWebEmpresa == null || $scope.centro.sitioWebEmpresa == "")
                    msj = msj + "Debe ingresar el sitio Web. ";

                if ($scope.centro.telefonos == null || $scope.centro.telefonos == "")
                    msj = msj + "Debe ingresar los telefonos. ";

                if ($scope.centro.puntoDeVenta == null || $scope.centro.puntoDeVenta == "")
                    msj = msj + "Debe ingresar el punto de venta. ";

                if ($scope.centro.tipoFacturacion_ids == null || $scope.centro.tipoFacturacion_ids == "")
                    msj = msj + "Debe ingresar el tipo de facturacion. ";

                if ($scope.centro.entorno == null || $scope.centro.entorno == "")
                    msj = msj + "Debe ingresar el entorno. ";

                //if ($scope.centro.nombreArchivoCertificado == null || $scope.centro.nombreArchivoCertificado == "")
                //    msj = msj + "Debe ingresar el nombre de Archivo Certificado. ";

                if ($scope.centro.passwordCertificado == null || $scope.centro.passwordCertificado == "")
                    msj = msj + "Debe ingresar la clave de certificado. ";

                //if ($scope.centro.archivoLogo == null || $scope.centro.archivoLogo == "")
                    //msj = msj + "Debe ingresar el ARCHIVO DEL LOGO. ";

            }
            else {
                msj = msj + "Debe ingresar los campos a continuación. ";
            }
            return { isValid: (msj == ""), message: msj };
        };

        $scope.getTheFiles = function ($files, campo) {

            console.log($files);
            console.log($files[0].type);

            angular.forEach($files, function (value, key) {
                console.log(campo + ' ' + value.name);

                formData.append(campo, value);
            });


        };

        $scope.getModelAsFormData = function (data) {

            angular.forEach(data, function (value, key) {

                if (key == "fileCertificado" || key == "fileLogo") {
                    console.log(value);

                    for (var i = 0; i < value.length; i++) {
                        formData.append(value[i].name, value[i]);
                    }
                }
                else {
                    // Campos restantes del model
                    formData.append(key, value);
                }
            });
            return formData;
        };

        $scope.Save = function () {
            ShowLoader();

            var validation = $scope.ValidarCampos();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);

                HideLoader();
            }
            else {

                var request = {
                    method: 'POST',
                    url: GetUrlForService('/CentrosDeFacturacion/Save'),
                    data: $scope.getModelAsFormData($scope.centro),
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(request)
                    .success(function (data, status, headers, config) {

                        HideLoader();
                        if (data.error == 0) {
                            HideLoader();

                            $uibModalInstance.close();
                        }
                        else {

                            ShowMessageBox(messageType_Error, "Error al Guardar: ", data.message);
                        }


                    }).error(function (data, status, headers, config) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error al Guardar: ", "Se ha producido un error");
                    });
            }
        };

        $scope.Cerrar = function () {
            $uibModalInstance.dismiss();
        };

        $scope.Init();
    }]);




