/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />


mainApp.controller('solicitudesDeStockController', ['$scope', '$http', 'envasesService',
        function ($scope, $http, envasesService) {

            $scope.solicitudesSeleccionadas = [];

            $scope.init = function() {

                runUiChanges();

                ShowLoader();

                $http.get(GetUrlForService('/Envases/GetDataForSolicitudesDeStock'))
                    .then(function(resp) {

                        $scope.estados = resp.data.estadosDeSolicitudes;
                        $scope.estadoId = 1;
                        $scope.idVerRelevamiento = "0";

                        $scope.repartos = resp.data.repartos;
                        $scope.repartos.insert(0, { id: null, nombreReparto: '-- Sin Reparto --' });
                        $scope.repartos.insert(0, { id: 0, nombreReparto: '-- Todos --' });

                        $scope.repartoId = null;

                        $scope.tiposDeSolicitud = resp.data.tiposDeSolicitud;
                        $scope.tiposDeSolicitud.insert(0, { valor_ids: null, valorTexto: '-- Todos --' });
                        $scope.tipoSolicitudId = null;

                        $scope.desde = getDateToShow(new Date().addMonths(-1));
                        $scope.hasta = getDateToShow(new Date());

                        $scope.buscar();

                        HideLoader();

                    }, function(resp) {
                        HideLoader();
                    });
            };

            var runUiChanges = function () {
                $('.input-daterange').datepicker({ autoclose: true, format: "dd/mm/yyyy" });
            };
            
            $scope.onConfirmarSolicitud = function (esConfirmacion) {

                $scope.buscar();
            };

            $scope.buscar = function() {
                
                if (($scope.desde == null || $scope.desde == '') || ($scope.hasta == null || $scope.hasta == '')) {

                    ShowMessageBox(messageType_Error, "Datos incompletos", "Debe seleccionar las fechas del periodo");
                    return;
                }

                ShowLoader();

                $http.get(GetUrlForService('/Envases/ObtenerSolicitudesDeStock'), {
                        params: {
                            clienteId: null,
                            desde: $scope.desde,
                            hasta: $scope.hasta,
                            estadoId: $scope.estadoId,
                            repartoId: $scope.repartoId,
                            tipoSolicitudId: $scope.tipoSolicitudId,
                            idVerRelevamiento: $scope.idVerRelevamiento == 0 ? null : $scope.idVerRelevamiento
                        }
                    })
                    .then(function (resp) {

                        $scope.solicitudes = resp.data.solicitudes;

                        HideLoader();

                    }, function (resp) {
                        HideLoader();
                    });

            }

            $scope.seleccionarTodos = function () {

                for (var i = 0; i < $scope.solicitudes.length; i++) {
                    $scope.solicitudes[i].seleccionado = $scope.todosSeleccionados;
                }
            };

            $scope.obtenerSolicitudesSeleccionadas = function() {

                var items = [];

                for (var i = 0; i < $scope.solicitudes.length; i++) {
                    if ($scope.solicitudes[i].seleccionado)
                        items.push($scope.solicitudes[i]);
                }

                return items.map(function(x) { return x.id; });
            };

            $scope.init();
        }]
);

mainApp.controller('crearSolicitudDeStockController', ['$scope', '$http', 'articulo', 'clienteId', '$uibModalInstance',
        function ($scope, $http, articulo, clienteId, $uibModalInstance) {

            $scope.clienteId = clienteId;
            $scope.articulo = articulo;

            $scope.init = function () {

                ShowLoader();

                $http.get(GetUrlForService('/Envases/GetDataForCreacionDeSolicitud'))
                .then(function (resp) {
                    HideLoader();
                    if (resp.data.error == 0) {
                        $scope.motivos = resp.data.motivos;

                        if ($scope.motivos.length > 0)
                            $scope.motivoSeleccionado = resp.data.motivos[0];

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (resp) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error.");
                });

                runUiChanges();
            };

            var runUiChanges = function () {

                RunTimer(function() {
                    RePrepareView($("#div_crearSolicitudDeStock"));
                }, 300);

            };

            $scope.guardar = function () {

                if ($scope.cantidad * 1 == 0) {
                    ShowMessageBox(messageType_Error, "Error", "Debe ingresar una cantidad correcta");
                    return;
                }

                ShowLoader();

                $http.post(GetUrlForService('/Envases/CrearSolicitudDeStockParaCompenzarPrestamo'), {
                    clienteId: $scope.clienteId,
                    articuloId: $scope.articulo.articulo_id,
                    cantidad: $scope.cantidad,
                    motivoId: $scope.motivoSeleccionado.valor_ids
                })
                    .then(function (resp) {

                        HideLoader();

                        if (resp.data.error == 0) {
                            ShowMessageBox(messageType_Success, "Exitoso", "La solicitud a sido creada.");
                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }

                        //Cerrar diálogo
                        $uibModalInstance.close(true);

                    }, function (resp) {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });

            }

            $scope.init();
        }]
);

mainApp.factory('envasesService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.abrirDialogoCrearSolicitud = function (articulo, clienteId, onConfirmar) {

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: '/js/app/views/envases/crearSolicitudDeStock.html',
                controller: 'crearSolicitudDeStockController',
                size: 'lg',
                resolve: {
                    articulo: function () {
                        return articulo;
                    },
                    clienteId: function () {
                        return clienteId;
                    }
                }
            });

            modalInstance.result.then(function (confirmado) {
                onConfirmar();
            });
            
        }

        return service;
    }]);


mainApp.directive('opcionesDeSolicitudDeStock', function ($http) {

    return {
        restrict: 'E',
        scope: {
            solicitud: "=",
            obtenerSolicitudesSeleccionadas: "=",
            onConfirmar: "="
        },
        templateUrl: "/js/app/views/envases/opcionesDeSolicitudDeStock.html",
        link: function (scope, element, attrs) {

            scope.confirmarSolicitud = function (aprobada) {

                var mensaje = "";

                if (aprobada === true)
                    mensaje = "Está seguro que desea APROBAR la solicitud?";
                else
                    mensaje = "Está seguro que desea CANCELAR la solicitud?";

                bootbox.confirm(mensaje, function (result) {

                    if (result) {

                        ShowLoader();

                        if (scope.solicitud != null) {

                            $http.post(GetUrlForService('/Envases/ConfirmarSolicitudDeStock'), {
                                    solicitudId: scope.solicitud.id,
                                    aprobada: aprobada
                                })
                                .then(function(resp) {

                                    HideLoader();

                                    if (resp.data.error == 0) {
                                        ShowMessageBox(messageType_Success, "Exitoso",
                                            "La solicitud a sido confirmada exitósamente.");
                                    } else {
                                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                                    }

                                    if (scope.onConfirmar != null)
                                        scope.onConfirmar(aprobada);

                                }, function(resp) {

                                    HideLoader();
                                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                                });

                        } else {
                            
                            $http.post(GetUrlForService('/Envases/ConfirmarSolicitudesDeStock'), {
                                idsSolicitudes: scope.obtenerSolicitudesSeleccionadas(),
                                aprobada: aprobada
                            })
                                .then(function (resp) {

                                    HideLoader();

                                    if (resp.data.error == 0) {
                                        ShowMessageBox(messageType_Success, "Exitoso",
                                            "Las solicitudes han sido confirmadas exitosamente.");
                                    } else {
                                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                                    }

                                    if (scope.onConfirmar != null)
                                        scope.onConfirmar(aprobada);

                                }, function (resp) {

                                    HideLoader();
                                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                                });

                        }

                    }
                });

            }
        }
    };
});