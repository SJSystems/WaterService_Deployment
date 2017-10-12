/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarMensajeEnComprobantesCtrl',
            ['$scope', '$http', 'abmServices',
    function ($scope, $http, abmServices) {


        $scope.onObtenerMensajes = null;

        $scope.clientes = [];
        $scope.filtros = {
            cliente_id: 0,
            paraRemitos: false,
            paraRecibos: false,
            paraFacturas: false,
            paraEmails: false,
            activo: false,
            esInformacion: false,
        };


        $scope.init = function () {

            var onClose = function (exitoso, arrayClientes) {
                if (exitoso) {
                    $scope.clientes = arrayClientes;
                }
            };
            abmServices.buscarAutoCompleteCliente(onClose);
        };

        $scope.buscarMensajes = function () {

            if ($scope.onObtenerMensajes != null) {

                $scope.filtros.cliente_id = ($scope.clienteSelected == null) ? null : $scope.clienteSelected.cliente_id;
                $scope.onObtenerMensajes($scope.filtros);
            }
        };

        $scope.abrirDialogoAgregar = function () {
            debugger;
            var templateUrl = '/js/app/views/MensajesEnComprobantes/editarMensajes.html';
            var controller = 'editarMensajeEnComprobantesCtrl';

            var onClose = function (exitoso) {
                if (exitoso)
                    $scope.buscarMensajes();
            };

            var resolve = {
                mensajeId: function () {
                    return mensajeId = 0;
                }
            }

            abmServices.abrirDialogo(templateUrl, controller, resolve, onClose);
        };


        // Invocacion:
        $scope.init();

    }]);

mainApp.controller('editarMensajeEnComprobantesCtrl', ['$scope', '$http', 'mensajeId', '$uibModalInstance', 'abmServices', '$filter',
function ($scope, $http, mensajeId, $uibModalInstance, abmServices, $filter) {

    $scope.mensaje = {};


    $scope.init = function () {

        var onClose = function (exitoso, arrayClientes) {
            if (exitoso) {
                $scope.clientes = arrayClientes;

                debugger;
                angular.forEach($scope.clientes, function (item) {
                    if (item.cliente_id == $scope.mensaje.cliente_id) {
                        $scope.clienteSelected = item;
                    }
                });
            }
        };
        abmServices.buscarAutoCompleteCliente(onClose);


        // Codigo para activar el calendario en los modal:
        setTimeout(function () {
            RePrepareView($("#div-nuevo-mensaje"));
        }, 300);


        if (mensajeId > 0) {
            $scope.tituloAccion = "Editar mensaje en comprobante: ";

            var url = GetUrlForService("/MensajesEnComprobanteFiscal/GetDataForEdit");

            $http.get(url, {
                params: {
                    mensaje_id: mensajeId
                }
            }).then(function (resp) {
                debugger;
                if (resp.data.error == 0) {

                    $scope.mensaje = resp.data.mensaje;

                    if ($scope.mensaje.fechaDesde != undefined || $scope.mensaje.fechaDesde != null) {
                        $scope.fechaDesde = GetDateTimeFromJson($scope.mensaje.fechaDesde);
                        $scope.fechaHasta = GetDateTimeFromJson($scope.mensaje.fechaHasta);

                        $scope.mensaje.fechaDesde = $scope.fechaDesde;
                        $scope.mensaje.fechaHasta = $scope.fechaHasta;

                    };
                }
            }, function (resp) { });

        }
        else {
            $scope.mensaje = {};
            $scope.tituloAccion = "Agregar mensaje en comprobante: ";
        }

    };

    $scope.validateCampos = function () {
        var msj = "";

        if ($scope.mensaje.mensaje == null || $scope.mensaje.mensaje == "")
            msj = msj + "Debe ingresar un mensaje. ";

        return { isValid: (msj == ""), message: msj };
    };

    $scope.guardar = function () {
        ShowLoader();

        var validation = $scope.validateCampos();

        if (!validation.isValid) {
            ShowMessageBox(messageType_Error, "Error de validación: ", validation.message);
            HideLoader();
        }
        else {

            var url = GetUrlForService('/MensajesEnComprobanteFiscal/Save');

            $scope.mensaje.cliente_id = ($scope.clienteSelected == null) ? null : $scope.clienteSelected.cliente_id;

            var fechaDesde = $scope.mensaje.fechaDesde != "" && $scope.mensaje.fechaDesde != null ? GetDateObjectFromStringFormat($scope.mensaje.fechaDesde) : null;
            var fechaHasta = $scope.mensaje.fechaHasta != "" && $scope.mensaje.fechaHasta != null ? GetDateObjectFromStringFormat($scope.mensaje.fechaHasta) : null;

            $scope.mensaje.fechaDesde = fechaDesde;
            $scope.mensaje.fechaHasta = fechaHasta;

            debugger;
            $http.post(url,
            {
                mensaje: $scope.mensaje
            })
             .then(function (resp) {

                 if (resp.data.error == 0) {
                     ShowMessageBox(messageType_Success, "Mensaje guardado con éxito.");

                     $scope.mensaje = {};
                 }
                 else {
                     ShowMessageBox(messageType_Error, "Error al Guardar");
                 }

                 HideLoader();
                 $uibModalInstance.close();

             }, function (resp) {
                 HideLoader();
                 $uibModalInstance.close();
             });
        }
    };

    $scope.cerrar = function () {
        $scope.mensaje = {};
        $uibModalInstance.close();
    };



    $scope.init();

}]);


mainApp.directive('mensajesEnComprobantes', function ($http, abmServices) {

    return {
        restrict: 'E',
        scope: {
            onObtenerMensajes: "="
        },
        templateUrl: "/js/app/views/MensajesEnComprobantes/mensajes.html",
        link: function (scope, element, attrs) {

            scope.init = function () {
            };

            scope.onObtenerMensajes = function (pFiltros) {

                $http.get(GetUrlForService('/MensajesEnComprobanteFiscal/Obtener'),
                    {
                        params: {
                            pActivos: pFiltros.activo,
                            pInformacion: pFiltros.esInformacion,

                            pCliente_Id: pFiltros.cliente_id,
                            pDesde: pFiltros.fechaDesde,
                            pHasta: pFiltros.fechaHasta,

                            pEmails: pFiltros.paraEmails,
                            pFacturas: pFiltros.paraFacturas,

                            pRecibos: pFiltros.paraRecibos,
                            pRemitos: pFiltros.paraRemitos,
                        }
                    }).then(function (resp) {

                        if (resp.data.error == 0) {
                            if (resp.data.mensajes.length == 0) {
                                ShowMessageBox(messageType_Info, "Información: ", " No hay resultados de búsqueda para los parámetros seleccionados.");
                            }
                            scope.mensajes = resp.data.mensajes;
                            scope.filtros = pFiltros;
                        }

                    }, function (resp) {
                    });
            };

            scope.abrirDialogoEditar = function (pMensaje) {

                var templateUrl = '/js/app/views/MensajesEnComprobantes/editarMensajes.html';
                var controller = 'editarMensajeEnComprobantesCtrl';

                var onClose = function (exitoso) {
                    if (exitoso)
                        scope.onObtenerMensajes(scope.filtros);
                };

                var resolve = {
                    mensajeId: function () {
                        return mensajeId = pMensaje.id;
                    }
                }

                abmServices.abrirDialogo(templateUrl, controller, resolve, onClose);
            };

            scope.eliminar = function (mensajeId) {

                var url = GetUrlForService('/MensajesEnComprobanteFiscal/Delete');

                var onClose = function (exitoso) {
                    if (exitoso)
                        scope.onObtenerMensajes(scope.filtros);
                };

                abmServices.eliminar(mensajeId, url, onClose);
            };


            scope.init();
        }
    };

});