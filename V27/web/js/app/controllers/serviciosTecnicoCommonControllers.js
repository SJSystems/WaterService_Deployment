

mainApp.factory('dispensersService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.verMantenimientos = function (dispenserId, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/mantenimientosDeDispensers.html',
                controller: 'verMantenimientosDeDispensers',
                size: 'lg',
                resolve: {
                    dispenserId: dispenserId
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar(true);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false);
            });
        }

        service.seleccionarDispensers = function (soloDeCliente, clienteSeleccionado,
            dispenserExistentes, ocultarBloqueados, onSeleccionar, soloFuncionalesEnPlaya) {

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: '/js/app/views/serviciosTecnicos/seleccionarDispenser.html',
                controller: 'seleccionarDispenserController',
                size: 'lg',
                resolve: {
                    seleccionarDispensersDeCliente: function () {
                        return soloDeCliente;
                    },
                    clienteActual: function () {
                        return clienteSeleccionado;
                    },
                    dispensersSeleccionados: function () {
                        return dispenserExistentes;
                    },
                    ocultarBloqueados: function () {
                        return ocultarBloqueados;
                    },
                    soloFuncionalesEnPlaya: function () {
                        return soloFuncionalesEnPlaya;
                    }
                }
            });

            modalInstance.result.then(function (dispensersSeleccionados) {
                onSeleccionar(true, dispensersSeleccionados);
            }, function () {
                onSeleccionar(false);
            });
        };

        return service;
    }]);


mainApp.factory('servicioTecnicoService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.abrirNuevoMantenimiento = function (dispenserId, servicioTecnicoId, esTaller, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/nuevoMantenimientoDeDispenser.html',
                controller: 'nuevoMantenimientoController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    dispenserId: dispenserId,
                    servicioTecnicoId: servicioTecnicoId,
                    esTaller: esTaller
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar(true);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false);
            });
        };

        service.abrirReplanificacionDeServicioTecnico = function (servicioTecnicoId, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/replanificacionServicioTecnico.html',
                controller: 'replanificarServicioTecnicoController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    servicioTecnicoId: servicioTecnicoId,
                }
            });

            modal.result.then(function (servicioTecnico) {
                if (onCerrar != null)
                    onCerrar(true, servicioTecnico);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false, null);
            });
        };

        service.abrirFichaDeDispenser = function (dispenserId, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/fichaDeDispenser.html',
                controller: 'fichaDispenserController',
                size: 'lg',
                resolve: {
                    dispenserId: dispenserId,
                }
            });

            modal.result.then(function (servicioTecnico) {
                if (onCerrar != null)
                    onCerrar(true);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false);
            });
        };

        service.iniciarReparacionDeDispenser = function (dispenser, onSuccess, onError) {

            bootbox.confirm("Desea iniciar la reparación del dispenser seleccionado?", function (result) {

                if (result) {

                    ShowLoader();
                    $http.post(GetUrlForService('/ServiciosTecnicos/IniciarReparacion'),
                        {
                            dispenserId: dispenser.id

                        }).then(function (resp, status, headers, config) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Confirmación", "El dispenser está ahora en proceso de reparación");
                                if (onSuccess != null) onSuccess();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                                if (onError != null) onError();
                            }

                        }, function (data, status, headers, config) {
                            HideLoader();
                            if (onError != null) onError();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al iniciar la reparación.");
                        });
                }
            });

        };

        service.iniciarObservacionDeDispenser = function (dispenser) {


        };

        service.transferirDispenser = function (dispenser, onSuccess, onError) {

            bootbox.confirm("Desea establecer el dispenser seleccionado como transferido a otro proveedor para reparar?", function (result) {

                if (result) {

                    ShowLoader();
                    $http.post(GetUrlForService('/ServiciosTecnicos/TransferirDispenser'),
                        {
                            dispenserId: dispenser.id

                        }).then(function (resp, status, headers, config) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Confirmación", "El dispenser está ahora fuera de la fábrica y en proceso de reparación");
                                if (onSuccess != null) onSuccess();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                                if (onError != null) onError();
                            }

                        }, function (data, status, headers, config) {
                            HideLoader();
                            if (onError != null) onError();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al transferir el dispenser.");
                        });
                }
            });

        };

        service.moverDispenserANoFuncional = function (dispenser, onSuccess, onError) {

            bootbox.confirm("Desea establecer el dispenser seleccionado como no funcional?", function (result) {

                if (result) {

                    ShowLoader();
                    $http.post(GetUrlForService('/ServiciosTecnicos/MoverANoFuncional'),
                        {
                            dispenserId: dispenser.id

                        }).then(function (resp) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Confirmación", "El dispenser está ahora en NO funcional");
                                if (onSuccess != null) onSuccess();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                                if (onError != null) onError();
                            }

                        }, function (data, status, headers, config) {
                            HideLoader();
                            if (onError != null) onError();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al establecer al dispenser como no funcional.");
                        });
                }
            });
        };

        service.abrirNuevaMedicionDeDispenser = function (dispenserId, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/medicionesDeDispenser.html',
                controller: 'medicionesController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    dispenserId: dispenserId,
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar();
            });
        }

        return service;
    }]);

mainApp.directive('detalleServicioTecnico',
    function ($http, $compile, $templateCache, servicioTecnicoService) {

        return {
            restrict: 'E',
            scope: {
                servicioTecnicoId: "=",
                fechaDeVisitaActual: "=",
                allowEdit: "@"
            },
            templateUrl: "/js/app/views/serviciosTecnicos/detalleServicioTecnico.html",
            link: function (scope, element, attrs) {

                scope.allowEdit = scope.allowEdit === "true";

                var init = function () {

                    scope.dispensersAsociadosDeCliente = [];
                    scope.dispensersAsociadosDeFabrica = [];

                    $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerServicioTecnico'),
                        {
                            params: {
                                servicioTecnicoId: scope.servicioTecnicoId
                            }
                        }).then(function (resp) {

                            HideLoader();

                            if (resp.data.error == 0) {

                                scope.servicioTecnico = resp.data.servicioTecnico;
                                scope.dispensersAsociados = resp.data.dispensersAsociados;

                                for (var i = 0; i < scope.dispensersAsociados.length; i++) {

                                    if (scope.dispensersAsociados[i].mantenimientoAsociado) {
                                        scope.dispensersAsociados[i].mantenimientoAsociado.mostrar = false;
                                    }

                                    if (scope.dispensersAsociados[i].deCliente) {
                                        scope.dispensersAsociadosDeCliente.push(scope.dispensersAsociados[i]);
                                    } else {
                                        scope.dispensersAsociadosDeFabrica.push(scope.dispensersAsociados[i]);
                                    }
                                }
                            }

                        }, function (resp) {
                            HideLoader();
                        });

                };

                scope.replanificar = function () {

                    servicioTecnicoService.abrirReplanificacionDeServicioTecnico(scope.servicioTecnicoId,
                        function (confirmado, servicioTecnico) {
                            if (confirmado === true) {
                                scope.servicioTecnico = servicioTecnico;
                            }
                        });
                };

                init();
            }
        };
    });

mainApp.directive('dispensersAsociadosAServicioTecnico',
    function ($http, $compile, $templateCache, dispensersService, servicioTecnicoService) {

        return {
            restrict: 'E',
            scope: {
                servicioTecnico: "=",
                dispensers: "=",
                deCliente: "@",
                soloLectura: "@",
                permitirEdicion: "="
            },
            templateUrl: "/js/app/views/serviciosTecnicos/dispensersAsociadosAServicioTecnico.html",
            link: function (scope, element, attrs) {

                var init = function () {

                    scope.soloDeCliente = scope.deCliente == "true";
                    scope.soloLectura = scope.soloLectura == "true";
                };

                scope.agregarDispenser = function () {

                    if (scope.soloDeCliente == true && scope.servicioTecnico.clienteSeleccionado == null) {
                        ShowMessageBox(messageType_Error, "Error", "Primero debe seleccionar un cliente");
                        return;
                    }

                    var onSeleccionarDispensers = function (haConfirmado, dispensersSeleccionados) {

                        if (haConfirmado && dispensersSeleccionados != null) {
                            for (var i = 0; i < dispensersSeleccionados.length; i++) {
                                dispensersSeleccionados[i].deCliente = scope.deCliente;
                                scope.dispensers.push(dispensersSeleccionados[i]);
                            }
                        }
                    };

                    dispensersService.seleccionarDispensers(scope.soloDeCliente, scope.servicioTecnico.clienteSeleccionado,
                        scope.dispensersAsociados, true, onSeleccionarDispensers, true);
                };

                scope.quitarDispenserAsociado = function (dispenser, index) {
                    scope.dispensers.splice(index, 1);
                };

                scope.agregarMantenimientoDispenserAsociado = function (dispenser) {

                    var onCerrar = function (confirmado) {

                        if (!confirmado) return;

                        window.location.reload();
                    };

                    servicioTecnicoService.abrirNuevoMantenimiento(dispenser.id, scope.servicioTecnico.id, false, onCerrar);
                };

                scope.mostrarMantenimientos = function (dispenser, value) {
                    dispenser.mantenimientoAsociado.mostrar = value;
                };

                scope.verHistorial = function (dispenserId) {
                    dispensersService.verMantenimientos(dispenserId, null);
                };

                init();
            }
        };
    });

mainApp.directive('mantenimientosConDetalles',
    function ($http, $compile, $templateCache) {

        return {
            restrict: 'E',
            scope: {
                mantenimientos: "="
            },
            templateUrl: "/js/app/views/serviciosTecnicos/mantenimientosConDetalles.html",
            link: function (scope, element, attrs) {

                var init = function () {

                };

                scope.verMantenimiento = function (mantenimiento) {

                    if (mantenimiento.detalles != null) {
                        mantenimiento.mostrarMantenimiento = !mantenimiento.mostrarMantenimiento;
                        return;
                    }

                    $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerMantenimientoDeDispenser'),
                        {
                            params: {
                                mantenimientoId: mantenimiento.id
                            }
                        }).
                        then(function (resp) {

                            if (resp.data.error == 0) {
                                mantenimiento.detalles = resp.data.mantenimiento.detalles;
                                mantenimiento.mediciones = resp.data.mantenimiento.mediciones;

                                mantenimiento.mostrarMantenimiento = true;
                            }
                        });

                };

                init();
            }
        };
    });

mainApp.directive('serviciosTecnicosCliente', function ($http) {

    return {
        restrict: 'E',
        scope: {
            desde: "=",
            hasta: "=",
            onObtenerDatos: "=",
            clienteId: "@",
            allowEdit: "@"
        },
        templateUrl: "/js/app/views/serviciosTecnicos/serviciosTecnicosClientes.html",
        link: function (scope, element, attrs) {

            scope.allowEdit = scope.allowEdit === "true";

            var init = function () {

            };

            scope.onObtenerDatos = function () {

                scope.cargandoDatos = true;

                $http.get(GetUrlForService('/UsuariosClientes/ObtenerServiciosTecnicos'),
                    {
                        params: {
                            desde: scope.desde,
                            hasta: scope.hasta,
                            clienteId: scope.clienteId
                        }
                    }).then(
                    function (resp) {

                        scope.cargandoDatos = false;

                        if (resp.data.error == 0) {
                            scope.serviciosTecnicos = resp.data.serviciosTecnicos;
                        }

                    }, function (resp) {
                        scope.cargandoDatos = false;
                    });
            };

            init();
        }
    };

});