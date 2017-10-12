/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="~/Web.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />
/// <reference path="../../mapas.js" />

mainApp.controller('hojasDeRutaCtrl', ['$scope', '$http','$uibModal',
    function ($scope, $http, $uibModal) {

        $scope.fechaHojaDeRuta = getToday();
        $scope.repartosDisponibles = [];
        $scope.repartoSeleccionado = null;
        $scope.hojasDeRutas = [];

        $scope.clientesVisitados = true;
        $scope.clientesNoVisitados = true;
        $scope.clientesSinGestiones = true;
        $scope.clientesAusentes = true;
        $scope.clientesVentasEntregas = true;
        $scope.clientesCobrosConsumos = true;
        $scope.clientesCobrosFacturas = true;
        $scope.clientesDevolucionesEnvases = true;
        $scope.clientesPrestamosEnvases = true;
        $scope.clientesCambiosArticulos = true;

        $scope.seleccionarTodos = false;
        $scope.accionSeleccionada = "0";

        $scope.clienteAgregado = {
            nombreRepartoAgregar: "",
            hojaDeRutaId: "",
            textoClienteBuscar: "",
            clienteSelected:null,
            autoCompleteModel:null,
        };
        $scope.operaciones = null;

        $scope.hojaDeRutaActualId = null;

        $scope.BuscarHojaDeRuta = function () {

            ShowLoader();

            $http.get(GetUrlForService('/HojasDeRuta/ObtenerHojaDeRutaYClientes'), {
                params: {
                    fecha: $scope.fechaHojaDeRuta,
                    reparto: $scope.repartoSeleccionado!=null? $scope.repartoSeleccionado.id : null
                }
            }).
            then(function (resp, status, headers, config) {

                $scope.hojaDeRutaActualId = null;

                if (resp.data.error == null) {

                    $scope.hojasDeRutas = resp.data;

                    mostrarErroresDeProceso();

                    HideLoader();

                    setTimeout(function () {
                        setTooltip();
                    }, 300);

                } else {
                    HideLoader();
                }

            }, function (data, status, headers, config) {
                HideLoader();
            });

            $scope.operaciones = null;

            if ($scope.repartoSeleccionado != null) {

                $http.get(GetUrlForService('/HojasDeRuta/ObtenerOperacionesEnHojaDeRuta'), {
                        params: {
                            fecha: $scope.fechaHojaDeRuta,
                            reparto: $scope.repartoSeleccionado != null ? $scope.repartoSeleccionado.id : null
                        }
                    }).
                    then(function (resp, status, headers, config) {

                        if (resp.data.error == 0) {
                            $scope.operaciones = resp.data.operaciones;
                        }

                    }, function (data, status, headers, config) { });
            }
        };

        $scope.mostrarClientesDeHojaDeRuta = function (hojadeRuta) {

            hojadeRuta.mostrarClientes = !hojadeRuta.mostrarClientes;

            if (hojadeRuta.Clientes == null) {
             
                ShowLoader();

                $http.get(GetUrlForService('/HojasDeRuta/ObtenerClientesDeHojaDeRuta'), {
                        params: {
                            hojaDeRutaId: hojadeRuta.id
                        }
                    }).
                    then(function(resp) {

                        HideLoader();

                        if (resp.data.error == 0) {

                            hojadeRuta.Clientes = resp.data.clientes;

                            mostrarErroresDeProceso();
                            setTimeout(function() {
                                setTooltip();
                            }, 300);

                        }

                    }, function(resp) {
                        HideLoader();
                    });

                $scope.operaciones = null;

                $http.get(GetUrlForService('/HojasDeRuta/ObtenerOperacionesEnHojaDeRuta'), {
                    params: {
                        fecha: $scope.fechaHojaDeRuta,
                        reparto: hojadeRuta.reparto_id
                    }
                }).
                  success(function (data, status, headers, config) {

                      if (data.error == 0) {
                          $scope.operaciones = data.operaciones;
                      }

                  }).error(function (data, status, headers, config) { });
                
            }
        };

        //Obtiene los repartos disponibles
        $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles'), {}).
            success(function (data, status, headers, config) {
                $scope.repartosDisponibles = data.repartos;
                //$scope.repartoSeleccionado = $scope.repartosDisponibles[0];
            }).error(function (data, status, headers, config) { });
        
        //Solo si ya tiene una hoja de ruta ya en parámetro
        var par_hojaRutaId = getParameterByName("hojaDeRutaId");
        $scope.hojaDeRutaActualId = par_hojaRutaId;
        
        if (par_hojaRutaId != null && par_hojaRutaId != "") {

            GLOBAL_CONFIG.finishLoading = false;

            $http.get(GetUrlForService('/HojasDeRuta/ObtenerHojaDeRutaYClientesPorId'), {
                params: {
                    hojaDeRuta_id: par_hojaRutaId
                }
            }).
            success(function (data, status, headers, config) {

                if (data != 1) {
                    $scope.hojasDeRutas = data;
                  
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
        }

        $scope.RegistrarMontoDeclarado = function (hojaDeRuta) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/RegistrarMontoDeclarado'),
                {
                    montoDeclarado: hojaDeRuta.montoDeclaradoRegistrado,
                    hojaDeRuta_id: hojaDeRuta.id
                }
            ).success(function (data, status, headers, config) {

                if (data != 1) {
                    hojaDeRuta.montoEfectivoDeclarado = hojaDeRuta.montoDeclaradoRegistrado;
                    HideLoader();

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

        $scope.confirmarHojaDeRutaEnReparto = function (hojaDeRutaId) {

            $scope.cambiarEstadosHojasDeRutas([hojaDeRutaId], 20);
        };
        
        $scope.confirmarHojaDeRutaDescargada = function (hojaDeRutaId) {

            $scope.cambiarEstadosHojasDeRutas([hojaDeRutaId], 30);
        };
        
        $scope.confirmarRepartoFinalizado = function (hojaDeRutaId) {

            $scope.cambiarEstadosHojasDeRutas([hojaDeRutaId], 40);
        };
        
        $scope.cambiarEstadoHojaDeRuta = function (hojaDeRutaId, nuevoEstadoId) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/CambiarDeEstadoHojaDeRuta'),
                {
                    hojaDeRuta_id: hojaDeRutaId,
                    nuevoEstado: nuevoEstadoId
                }
            ).success(function (data, status, headers, config) {
                
                if (data.error == 0) {

                    if (isNumeric($scope.hojaDeRutaActualId))
                        window.location.reload();
                    else
                        $scope.BuscarHojaDeRuta();

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });

        };

        $scope.verOperacionesConCliente = function (cliente) {

            cliente.mostrarOperaciones = !cliente.mostrarOperaciones;
            if (!cliente.mostrarOperaciones || cliente.operacionesCargadas) return;

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/ObtenerOperacionesTempConCliente'),
                {
                    cliente_id: cliente.cliente_id,
                    hojaDeRuta_id: cliente.hojaDeRuta_id
                }
            ).success(function(data, status, headers, config) {

                HideLoader();

                if (data.error == 0) {

                    cliente.operaciones = data.data;
                    cliente.operacionesCargadas = true;

                } else {
                    HideLoader();
                }

            });

        };

        $scope.showCliente = function (cliente) {

            if ($scope.clientesVisitados && cliente.visitado)
                return true;
            
            if ($scope.clientesNoVisitados && !cliente.visitado)
                return true;
            
            if ($scope.clientesSinGestiones && (cliente.visitado && !cliente.ausente && !cliente.ventaEntrega && !cliente.cobroConsumo && !cliente.cobroFactura && !cliente.devolucionEnvases && !cliente.prestamoEnvases && !cliente.devolucionArticulo))
                return true;
            
            if ($scope.clientesAusentes && cliente.ausente)
                return true;
            
            if ($scope.clientesVentasEntregas && cliente.ventaEntrega)
                return true;
            
            if ($scope.clientesCobrosFacturas && cliente.cobroFactura)
                return true;
            
            if ($scope.clientesCobrosConsumos && cliente.cobroConsumo)
                return true;
            
            if ($scope.clientesDevolucionesEnvases && cliente.devolucionEnvases)
                return true;
            
            if ($scope.clientesPrestamosEnvases && cliente.prestamoEnvases)
                return true;
            
            if ($scope.clientesCambiosArticulos && cliente.devolucionArticulo)
                return true;

            return false;
        };

        $scope.agregarClienteVentaExtra = function (nombreReparto, hojaDeRutaId) {
            
            $scope.clienteAgregado.nombreRepartoAgregar = nombreReparto;
            $scope.clienteAgregado.hojaDeRutaId = hojaDeRutaId;
            
            //$("#div_agregarClienteVentaExtra").dialog('open');
            
            $('#popup').show("slow");
            $("#txt_buscarClienteAgregar").focus();
        };

        $scope.confirmarAgregarClienteVentaExtra = function(cliente) {

            //$("#div_agregarClienteVentaExtra").dialog('close');
            
            $('#popup').hide("slow");

            $scope.clienteAgregado.clienteSelected = cliente;

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/AgregarClienteAHojaDeRuta'),
                {
                    cliente_id: $scope.clienteAgregado.clienteSelected.cliente_id,
                    hojaDeRuta_id: $scope.clienteAgregado.hojaDeRutaId
                }
            ).success(function (data, status, headers, config) {

                HideLoader();

                if (data.error == 0) {

                    var url = "/TransaccionesTemporales/Create?clienteId=" + $scope.clienteAgregado.clienteSelected.cliente_id + "&hojaDeRutaId=" + $scope.clienteAgregado.hojaDeRutaId;
                    var win = window.open(url, '_blank');
                    win.focus();
                } 

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.confirmarCierreDeHojaDeRuta = function (hojaDeRuta_id) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/ConfirmarCierreDeHojaDeRuta'),
                {
                    hojaDeRuta_id: hojaDeRuta_id
                }
            ).success(function (data, status, headers, config) {

                if (data.error == 0) {
                    
                    if (isNumeric($scope.hojaDeRutaActualId))
                        window.location.reload();
                    else
                        $scope.BuscarHojaDeRuta();

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };
        
        $scope.cargarHojaDeRutaAMovil = function (hojaDeRuta_id) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/CargarHojaDeRutaMobile'),
                {
                    hojaDeRuta_id: hojaDeRuta_id
                }
            ).success(function (data, status, headers, config) {

                if (data.error == 0) {

                    if (isNumeric($scope.hojaDeRutaActualId))
                        window.location.reload();
                    else
                        $scope.BuscarHojaDeRuta();

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.DescargarHojaDeRutaAMovil = function (hojaDeRuta_id) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/DescargarHojaDeRutaMobile'),
                {
                    hojaDeRuta_id: hojaDeRuta_id
                }
            ).success(function (data, status, headers, config) {

                if (data.error == 0) {

                    if (isNumeric($scope.hojaDeRutaActualId))
                        window.location.reload();
                    else
                        $scope.BuscarHojaDeRuta();

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.cerrarPopup = function() {

            $('#popup').hide("slow");
        };

        $scope.quitarVentaExtra = function (cliente, hojaDeRuta_id) {
            
            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/EliminarClienteDeHojaDeRuta'),
                {
                    cliente_id: cliente.cliente_id,
                    hojaDeRuta_id: hojaDeRuta_id
                }
            ).success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.BuscarHojaDeRuta();

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.generarHojaDeRuta = function() {

            var mensaje = "Confirma generar la hoja de ruta para el " +
                $scope.repartoSeleccionado.nombreReparto + " fecha " + $scope.fechaHojaDeRuta;

            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService('/HojasDeRuta/GenerarHojaDeRuta'),
                       {
                           fechaGeneracion: $scope.fechaHojaDeRuta,
                           repartoId: $scope.repartoSeleccionado.id
                       }).
                       success(function (data, status, headers, config) {

                           HideLoader();

                           if (data.error == 0) {

                               ShowMessageBox(messageType_Success, "Exitoso", data.message);
                               $scope.BuscarHojaDeRuta();

                           } else {
                               ShowMessageBox(messageType_Error, "Error", data.message);
                           }

                       }).error(function (data, status, headers, config) {
                           HideLoader();
                           ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al generar la hoja de ruta.");
                       });
                }
            });

        };

        //Init
        GLOBAL_FUNCTIONS.runTimer(function() {

            $("#div_agregarClienteVentaExtra").dialog
            (
                {
                    autoOpen: false,
                    height: 400,
                    width: 1200,
                    modal: true
                }
            );

        }, 300);
        
        var autoCompleteModel = {};
        var aux_ultimoTexto = "";
        autoCompleteModel.urlTemplate = "/js/app/views/shared/template_autocomplete_clienteHojaDeRuta.html";
        autoCompleteModel.searchItems = function () {
            return {
                success: function (f) {

                    if (aux_ultimoTexto == $scope.clienteAgregado.textoClienteBuscar)
                        return;

                    $scope.clienteAgregado.clienteSelected = null;
                    aux_ultimoTexto = $scope.clienteAgregado.textoClienteBuscar;

                    if ($scope.clienteAgregado.textoClienteBuscar.length < 3) {
                        return;
                    }

                    $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'),
                        {
                            modelo: {
                                datosCliente: $scope.clienteAgregado.textoClienteBuscar
                            }
                        }
                    ).success(
                        function (data, status, headers, config) {

                            if (data.error === 0) {
                                f(data.data);
                            }
                        }
                    );

                }
            };
        };
        autoCompleteModel.onItemSelected = function (item, index) {

            $scope.confirmarAgregarClienteVentaExtra(item);
        };
        //After you have completed the object set up, give it to the scope to send it to the view
        $scope.clienteAgregado.autoCompleteModel = autoCompleteModel;

        $scope.mostrarSeleccion = function(hojaDeRuta) {

            //hojaDeRuta.seleccionada = false;

            switch (hojaDeRuta.estadoHojaDeRuta_ids) {
                case 10:

                    if ($scope.accionSeleccionada == 20)
                        return true;
                    break;

                case 20:
                    if ($scope.accionSeleccionada == 30)
                        return true;
                    break;

                case 30:
                    if ($scope.accionSeleccionada == 100)
                        return true;
                    break;

                case 40:
                    if ($scope.accionSeleccionada == 50 || $scope.accionSeleccionada == 100)
                        return true;
                    break;

                case 50:
                    if ($scope.accionSeleccionada == 50 || $scope.accionSeleccionada == 100)
                        return true;
                    break;

                default:
                    return false;
                    break;
            }
            return false;
        };
        
        $scope.seleccionTodos = function(seleccionados) {

            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                $scope.hojasDeRutas[i].seleccionada = seleccionados;
            }

        };
        
        $scope.ejecutarAccion = function() {

            var hojasDeRutasIds = [];

            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                var hr = $scope.hojasDeRutas[i];
                if (hr.seleccionada && $scope.mostrarSeleccion(hr)) {
                    hojasDeRutasIds.push(hr.id);
                }
            }

            $scope.cambiarEstadosHojasDeRutas(hojasDeRutasIds, $scope.accionSeleccionada);
        };

        $scope.cambiarEstadosHojasDeRutas = function (hojasDeRutas_ids, nuevoEstadoId) {

            ShowLoader();

            $http.post(GetUrlForService('/HojasDeRuta/CambiarDeEstadoHojaDeRuta'),
                {
                    hojasDeRutas_ids: hojasDeRutas_ids,
                    nuevoEstado: nuevoEstadoId
                }
            ).success(function (data, status, headers, config) {

                resultadosUltimoProceso=data;

                HideLoader();
                $scope.BuscarHojaDeRuta();

                //if (data.error == 0) {

                //    if (isNumeric($scope.hojaDeRutaActualId))
                //        window.location.reload();
                //    else
                //        $scope.BuscarHojaDeRuta();

                //} else {
                //    HideLoader();
                //}

            }).error(function (data, status, headers, config) {
                HideLoader();
            });

        };

        var hojaDeRuta_aEliminar = 0;
        var nombreHojaDeRuta_aEliminar = '';

        $scope.resetearVentas = function(nombreHojaDeRuta, hojaDeRutaId) {

            hojaDeRuta_aEliminar = hojaDeRutaId;

            bootbox.confirm("Confirma que desea volver al estado anterior y eliminar todas las ventas temporales (" + nombreHojaDeRuta_aEliminar + ")? " +
                "Deberá descargarlas nuevamente.", function (result) {
                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService('/TransaccionesTemporales/ResetearDeHojaDeRuta'),
                       {
                           hojaDeRutaId: hojaDeRuta_aEliminar
                       }).
                       success(function (data, status, headers, config) {

                           HideLoader();

                           if (data.error == 0) {

                               ShowMessageBox(messageType_Success, "Exitoso", data.message);
                               $scope.BuscarHojaDeRuta();

                           } else {
                               ShowMessageBox(messageType_Error, "Error", data.message);
                           }

                       }).error(function (data, status, headers, config) {
                           HideLoader();
                           ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
                       });
                }
            });

        }

        var resultadosUltimoProceso = [];

        var mostrarErroresDeProceso = function ()
        {
            var result = resultadosUltimoProceso;

            for (var i = 0; i < result.length; i++) {
                if (result[i].error == 1) {
                    mostrarErrorEnHojaDeRuta(result[i].message, result[i].hojaDeRuta_id);
                } else {
                    mostrarExitosoEnHojaDeRuta(result[i].message, result[i].hojaDeRuta_id);
                }
            }
        };

        var mostrarErrorEnHojaDeRuta = function(mensajeError, hojaDeRutaId) {
            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                if ($scope.hojasDeRutas[i].id == hojaDeRutaId)
                    $scope.hojasDeRutas[i].proccessError = mensajeError;
            }
        };

        var mostrarExitosoEnHojaDeRuta = function (mensajeExito, hojaDeRutaId) {
            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                if ($scope.hojasDeRutas[i].hojaDeRuta_id == hojaDeRutaId)
                    $scope.hojasDeRutas[i].proccessSuccess = mensajeExito;
            }
        };

        var limpiarMensajesDeError = function() {
            resultadosUltimoProceso = [];
            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                $scope.hojasDeRutas[i].proccessError = null;
            }
        };

        $scope.buscarClientesEnHojaDeRuta = function() {

            if ($scope.hojasDeRutas == null)
                return;

            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {

                var hojaDeRuta = $scope.hojasDeRutas[i];

                if (hojaDeRuta.Clientes != null) {

                    var hojaDeRutaMostrada = false;

                    for (var j = 0; j < hojaDeRuta.Clientes.length; j++) {

                        var cliente = hojaDeRuta.Clientes[j];

                        cliente.visible = cliente.nombreCliente.toUpperCase().indexOf($scope.clienteBuscado.toUpperCase()) > -1;

                        if (cliente.visible && !hojaDeRutaMostrada && !hojaDeRuta.mostrarClientes) {
                            hojaDeRutaMostrada = true;
                            $scope.mostrarClientesDeHojaDeRuta(hojaDeRuta);
                        }
                    }
                }
            }
        };

        $scope.mostrarTodosLosClientes = function () {

            if ($scope.hojasDeRutas == null)
                return;

            for (var i = 0; i < $scope.hojasDeRutas.length; i++) {
                var hojaDeRuta = $scope.hojasDeRutas[i];

                for (var j = 0; j < hojaDeRuta.Clientes.length; j++) {
                    var cliente = hojaDeRuta.Clientes[j];

                    cliente.visible = true;
                }

            }
        };

        $scope.generarResumenesDeCuenta = function(hojadeRuta) {

            if (hojadeRuta.Clientes == null) {
                ShowMessageBox(messageType_Error, "Error", "Debe obtener los clientes para poder generar los resumenes de cuenta");
                return;
            }

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/js/app/views/resumenDeCuenta/generacionDeResumenDeCuenta.html',
                controller: 'generacionDeResumenDeCuentaController',
                size: 'lg',
                backdrop:'static',
                resolve: {
                    clientes: function () {
                        return hojadeRuta.Clientes;
                    }
                }
            });

            //modalInstance.result.then(function (dispensersSeleccionados) {


        };

        $scope.generarFacturas = function (hojadeRuta) {

            hojadeRuta.generandoFacturas = true;

            $http.post(GetUrlForService('/Reportes/GenerarPDFDeFacturasDeHojaDeRuta'),
                {
                    hojaDeRutaId: hojadeRuta.id
                }
            ).then(function(resp) {

                hojadeRuta.generandoFacturas = false;

                if (resp.data.error == 0) {
                    window.open(resp.data.pathDelReporte);
                } else {
                    ShowMessageBox(messageType_Error, "Error al generar las facturas", resp.data.message);
                }

            },function (resp) {hojadeRuta.generandoFacturas = false;});

        };

        $scope.asignarMovilAHojaDeRuta = function (hojadeRuta) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/js/app/views/hojasDeRuta/asignarMovil.html',
                controller: 'asignarMovilAHojaDeRutaController',
                size: 'lg',
                resolve: {
                    hojaDeRuta: function () {
                        return hojadeRuta;
                    }
                }
            });

            //modalInstance.result.then(function (dispensersSeleccionados) {


        };

        $scope.verAlertas = function(hojaDeRuta) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/js/app/views/hojasDeRuta/alarmas.html',
                controller: 'alertasDeHojaDeRutaController',
                size: 'lg',
                resolve: {
                    hojaDeRuta: function () {
                        return hojaDeRuta;
                    }
                }
            });

        };

        $scope.verAlertasDeCliente = function(cliente, hojaDeRuta) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/js/app/views/hojasDeRuta/alarmasDeCliente.html',
                controller: 'alertasDeClienteController',
                size: 'lg',
                resolve: {
                    hojaDeRuta: function () {
                        return hojaDeRuta;
                    },
                    cliente: function () {
                        return cliente;
                    }
                }
            });

        };
    }]);

mainApp.controller('alertasDeHojaDeRutaController', ['$scope', '$http', 'hojaDeRuta', '$uibModalInstance',
    function ($scope, $http, hojaDeRuta, $uibModalInstance) {

        $scope.hojaDeRuta = hojaDeRuta;
        $scope.alertas = {};

        $scope.init = function () {

            $http.get(GetUrlForService('/HojasDeRuta/ObtenerAlarmas'), {
                    params: {
                        hojaDeRutaId: $scope.hojaDeRuta.id
                    }
                }).
            then(function (resp) {

                if (resp.data.error == 0) {

                    $scope.alertas.prestamos = resp.data.prestamos;

                    RunTimer(mostrarGraficos, 300);

                } else {

                }

            }, function(resp) {
                
            });
        };

        var mostrarGraficos = function() {

            $.resize.throttleWindow = false;

            var placeholder = $('#piechart-placeholder').css({ 'width': '90%', 'min-height': '150px' });

            var data = $scope.alertas.prestamos.map(function(item, index) {
                return { label: item.nombreArticulo, data: item.cantidadAdeudada, color: COLORES_NUMEROS[index + 1] }
            });
			
            function drawPieChart(placeholder, data, position) {
                $.plot(placeholder, data, {
                    series: {
                        pie: {
                            show: true,
                            tilt: 0.8,
                            highlight: {
                                opacity: 0.25
                            },
                            stroke: {
                                color: '#fff',
                                width: 2
                            },
                            startAngle: 2
                        }
                    },
                    legend: {
                        show: true,
                        position: position || "ne",
                        labelBoxBorderColor: null,
                        margin: [-30, 15]
                    },
                    grid: {
                        hoverable: true,
                        clickable: true
                    }
                });
            }
            drawPieChart(placeholder, data);

            /**
            we saved the drawing function and the data to redraw with different position later when switching to RTL mode dynamically
            so that's not needed actually.
            */
            placeholder.data('chart', data);
            placeholder.data('draw', drawPieChart);


        };

        $scope.init();
    }]
);

mainApp.controller('alertasDeClienteController', ['$scope', '$http', 'hojaDeRuta', 'cliente', '$uibModalInstance',
    function ($scope, $http, hojaDeRuta, cliente, $uibModalInstance) {

        $scope.hojaDeRuta = hojaDeRuta;
        $scope.cliente = cliente;

        $scope.alertas = {};

        $scope.init = function () {

            $http.get(GetUrlForService('/HojasDeRuta/ObtenerAlarmasDeCliente'), {
                params: {
                    hojaDeRutaId: $scope.hojaDeRuta.id,
                    clienteId: $scope.cliente.cliente_id
                }
            }).
            then(function (resp) {

                if (resp.data.error == 0) {

                    $scope.alertas = resp.data.alarmas;
                    
                } else {

                }

            }, function (resp) {

            });
        };

        $scope.init();
    }]
);


mainApp.controller('hojasDeRutaLiquidacionCtrl', ['$scope', '$http', '$rootScope', 'incidentesService',
        function ($scope, $http, $rootScope, incidentesService) {

            var setFlow = function () {
               
                $('#fuelux-wizard')
				.ace_wizard({
				    //step: 2 //optional argument. wizard will jump to step "2" at first
				})
				.on('finished', function (e) {

				    if ($scope.liquidacion.hojaDeRuta.estadoHojaDeRuta_ids== 30 || $scope.liquidacion.hojaDeRuta.estadoHojaDeRuta_ids== 20) {
				        bootbox.confirm("Confirma que realiza el cierre de esta liquidación?", function (result) {
				            if (result) {
				                $scope.RegistrarMontoDeclarado();
				            }
				        });
                    }
				}).on('stepclick', function (e) {
				    //e.preventDefault();//this will prevent clicking and selecting steps
				});


                //jump to a step
                $('#step-jump').on('click', function() {
                    var wizard = $('#fuelux-wizard').data('wizard');
                    wizard.currentStep = 3;
                    wizard.setState();
                });
                //determine selected step
                //wizard.selectedItem().step

            };

            var setDialogs = function() {
                $("#dialog_cheques").dialog(
            {
                          autoOpen: false,
                          height: 400,
                          width: 800,
                          modal: true
                      }
                  );

                $("#dialog_depositos").dialog(
                      {
                          autoOpen: false,
                          height: 400,
                          width: 800,
                          modal: true
                      }
                  ); 

                $("#dialog_totalRetenciones").dialog(
                        {
                            autoOpen: false,
                            height: 400,
                            width: 500,
                            modal: true
                        }
                    );

                $("#dialog_gastos").dialog
                   (
                       {
                           autoOpen: false,
                           height: 400,
                           width: 500,
                           modal: true
                       }
                   );

                $("#dialog_declaracionEfectivo").dialog
                       (
                           {
                               autoOpen: false,
                               height: 500,
                               width: 400,
                               modal: true
                           }
                       );
            };

            //declaraciones
            $scope.liquidacion =
            {
                hojaDeRuta_id: 0,
                hojaDeRuta: {},
                articulos: [],
                dinero: {},
                repartidor:null
            };

            $scope.pedidos = [];
            $scope.clientesNoVisitados = [];
            $scope.metricas =
            {
                pedidos: { cantidad: 0, visitados: 0, metrica: 0 },
                clientesNoVisitados: { cantidad: 0, noVisitados: 0, ausentes:0, metricaNoVisitados: 0 },
            };

            $scope.modelStep1 = {};

            $scope.repartidores = [];
            
            $scope.init = function () {
                
                $scope.mostrarCargas = true;
                $scope.motrarDescargas = true;
                $scope.mostrarVentas = true;
                $scope.mostrarEnvases = true;

                //Solo si ya tiene una hoja de ruta ya en parámetro
                var par_hojaRutaId = getParameterByName("hojaDeRutaId");
                if (par_hojaRutaId != null && par_hojaRutaId != "") {

                    GLOBAL_CONFIG.finishLoading = false;

                    $scope.liquidacion.hojaDeRuta_id = par_hojaRutaId;

                    $http.get(GetUrlForService('/HojasDeRuta/ObtenerLiquidacionDeHojaDeRuta'), {
                        params: {
                            hojaDeRuta_id: par_hojaRutaId
                        }
                    }).
                    success(function (data, status, headers, config) {

                        if (data.error == 0) {
                            $scope.liquidacion.articulos = data.data.Articulos;
                            $scope.liquidacion.hojaDeRuta = data.data.HojaDeRuta;
                            $scope.cierreLiquidacion = data.data;
                            $scope.repartidores = data.repartidores;
                            $scope.billetes = data.billetes;

                            for (var i = 0; i < $scope.repartidores.length; i++) {
                                if ($scope.repartidores[i].usuario_id == $scope.liquidacion.hojaDeRuta.repartidor_id) {
                                    $scope.liquidacion.repartidor = $scope.repartidores[i];
                                    break;
                                }
                            }

                            GLOBAL_FUNCTIONS.hideLoadingScreen();

                            setTimeout(function () {

                                setDialogs();
                                setTooltip();

                            }, 300);

                            $scope.obtenerMetrica();

                            //Init de Steps
                            initStep1();

                        } else {
                            GLOBAL_FUNCTIONS.hideLoadingScreen();
                        }

                    }).error(function (data, status, headers, config) {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    });


                    $http.get(GetUrlForService('/Reportes/ObtenerGestionesPorHojaDeRutaId'), {
                        params: {
                            hojaDeRutaId: par_hojaRutaId
                        }
                    }).
                        success(function (data, status, headers, config) {

                      if (data.error == 0) {
                          $scope.liquidacion.gestiones = data.reporte;
                      }
                  }).error(function (data, status, headers, config) {
                      GLOBAL_FUNCTIONS.hideLoadingScreen();
                  });

                    $http.get(GetUrlForService('/HojasDeRuta/ObtenerLiquidacionDeServicioTecnico'),
                        {
                            params:{
                                hojaDeRutaId:par_hojaRutaId
                            }
                        }).then(function(resp){

                            $scope.liquidacionServicioTecnico = resp.data.liquidacionServicioTecnico;
                            
                        });
                    
                    obtenerGestionDeEnvases();
                }

                RunTimer(setFlow, 1000);
            };

            var initStep1 = function () {

                //Cobros imputados
                $scope.modelStep1.cobrosEnEfectivo = $scope.cierreLiquidacion.TotalesCobrosXMediosConsumos.montoEfectivo +
                                                    $scope.cierreLiquidacion.TotalesCobrosXMediosFacturas.montoEfectivo;

                $scope.modelStep1.cobrosEnCheques = $scope.cierreLiquidacion.TotalesCobrosXMediosConsumos.montoCheques +
                                                   $scope.cierreLiquidacion.TotalesCobrosXMediosFacturas.montoCheques;

                $scope.modelStep1.cobrosEnDepositos = $scope.cierreLiquidacion.TotalesCobrosXMediosConsumos.montoDepositos +
                                                     $scope.cierreLiquidacion.TotalesCobrosXMediosFacturas.montoDepositos;

                $scope.modelStep1.cobrosEnRetenciones = $scope.obtenerTotalRetenciones();

                //Documentos recibidos
                $scope.modelStep1.recibidoEnCheques = $scope.obtenerTotalChequesRecibidos();
                $scope.modelStep1.recibidoEnDepositos = $scope.obtenerTotalDepositosRecibidos();
                $scope.modelStep1.recibidoEnRetenciones = $scope.obtenerTotalRetenciones();
                $scope.modelStep1.recibidoEnGastos = $scope.obtenerTotalGatos();
                $scope.modelStep1.totalRecibido = $scope.obtenerTotalChequesRecibidos() + $scope.obtenerTotalDepositosRecibidos()
                                                 - $scope.obtenerTotalGatos()
                                                 + $scope.obtenerTotalRetenciones() + $scope.cierreLiquidacion.TotalesCobrosXMediosConsumos.montoEfectivo 
                                                 + $scope.cierreLiquidacion.TotalesCobrosXMediosFacturas.montoEfectivo;

                $scope.modelStep1.tieneErrorCheques = $scope.modelStep1.cobrosEnCheques != $scope.modelStep1.recibidoEnCheques;
                $scope.modelStep1.tieneErrorDepositos = $scope.modelStep1.cobrosEnDepositos != $scope.modelStep1.recibidoEnDepositos;
            };

            $scope.abrirDialogo = function (divId) {
                $scope.editandoDeclaracionEfectivo = false;
                $("#" + divId).dialog("open");
            };

            $scope.RegistrarMontoDeclarado = function () {
                
                if ($scope.liquidacion.repartidor==null) {
                    ShowMessageBox(messageType_Error, "Error", "Debe seleccionar un repartidor");
                    return;
                }
                
                if (!isNumeric($scope.liquidacion.hojaDeRuta.montoEfectivoDeclarado)) {
                    ShowMessageBox(messageType_Error, "Error", "Debe ingresar un monto declarado");
                    return;
                }
                
                ShowLoader();

                $http.post(GetUrlForService('/HojasDeRuta/RegistrarMontoDeclarado'),
                    {
                        montoDeclarado: $scope.liquidacion.hojaDeRuta.montoEfectivoDeclarado,
                        repartidor_id: $scope.liquidacion.repartidor.usuario_id,
                        hojaDeRuta_id: $scope.liquidacion.hojaDeRuta_id
                    }
                ).success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        window.location.reload();

                    } else {
                        HideLoader();
                    }

                }).error(function (data, status, headers, config) {

                    HideLoader();
                    
                });

            };

            $scope.obtenerTotalRetenciones = function() {
                if ($scope.cierreLiquidacion == null || $scope.cierreLiquidacion.Retenciones==null)
                    return 0;

                var totalRetenciones = 0;

                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionIVA);
                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionIngresosBrutos);
                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionSUSS);
                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionGanancias);
                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionComInd);
                totalRetenciones += utiles.getNumber($scope.cierreLiquidacion.Retenciones.retencionOtras);

                return totalRetenciones;
            };

            $scope.obtenerTotalChequesRecibidos = function() {

                if ($scope.cierreLiquidacion == null)
                    return 0;

                var totalChequesRecibidos = 0;

                for (var i = 0; i < $scope.cierreLiquidacion.ChequesRegistrados.length; i++) {
                    var cheque = $scope.cierreLiquidacion.ChequesRegistrados[i];
                    totalChequesRecibidos += utiles.getNumber(cheque.importe);
                }

                return totalChequesRecibidos;
            };

            $scope.obtenerTotalGatos = function () {

                if ($scope.cierreLiquidacion == null)
                    return 0;

                var total = 0;

                for (var i = 0; i < $scope.cierreLiquidacion.Gastos.length; i++) {
                    var gasto = $scope.cierreLiquidacion.Gastos[i];
                    total += utiles.getNumber(gasto.monto);
                }

                return total;
            };

            $scope.obtenerTotalDepositosRecibidos = function () {

                if ($scope.cierreLiquidacion == null)
                    return 0;

                var totalDepositosRecibidos = 0;

                for (var i = 0; i < $scope.cierreLiquidacion.DepositosRegistrados.length; i++) {
                    var deposito = $scope.cierreLiquidacion.DepositosRegistrados[i];
                    totalDepositosRecibidos += utiles.getNumber(deposito.importe);
                }

                return totalDepositosRecibidos;
            };

            $scope.obtenerTotalCobrosEnEfectivo = function() {

                if ($scope.cierreLiquidacion == null)
                    return 0;

                return utiles.getNumber($scope.cierreLiquidacion.TotalesCobrosXMediosConsumos.montoEfectivo) +
                    utiles.getNumber($scope.cierreLiquidacion.TotalesCobrosXMediosFacturas.montoEfectivo);
            };

            $scope.obtenerMetrica = function() {

                $scope.metricas.pedidos.cantidad = $scope.cierreLiquidacion.ClientesPedidos.length;
                $scope.metricas.pedidos.visitados = obtenerPedidosVisitados();
                $scope.metricas.pedidos.metrica = $scope.metricas.pedidos.visitados / $scope.metricas.pedidos.cantidad * 100;

                $scope.metricas.clientesNoVisitados.cantidad = $scope.cierreLiquidacion.CantidadClientesHojaDeRuta;
                $scope.metricas.clientesNoVisitados.noVisitados = obtenerNoVisitados();
                $scope.metricas.clientesNoVisitados.metricaNoVisitados = $scope.metricas.clientesNoVisitados.noVisitados / $scope.metricas.clientesNoVisitados.cantidad * 100;
                $scope.metricas.clientesNoVisitados.ausentes = obtenerClientesAusentes();
            };

            $scope.verIncidente = function(cliente) {

                $http.post(GetUrlForService('/Incidentes/ObtenerIncidenteViewById'), {
                    id: cliente.incidente_id
                })
                .success(function (data, status, headers, config) {

                    if (data.error == 0) {
        
                        // $rootScope.$broadcast('verIncidenteClick', data.incidente);

                        incidentesService.verIncidente(data.incidente);

                    } else {
                    }

                }).error(function (data, status, headers, config) {
                    
                });

            };

            $scope.editarIncidente = function (cliente) {

                $http.post(GetUrlForService('/Incidentes/ObtenerIncidenteViewById'), {
                    id: cliente.incidente_id
                })
              .success(function (data, status, headers, config) {

                  if (data.error == 0) {

                      $rootScope.$broadcast('editarIncidenteClick', data.incidente);

                  } else {
                  }

              }).error(function (data, status, headers, config) {

              });

            };

            $scope.confirmarDeclaracionEfectivo = function() {

                ShowLoader();

                var declaracion = [];

                for (var i = 0; i < $scope.billetes.length; i++) {
                    var b = $scope.billetes[i];
                    if (b.cantidad > 0) {
                        declaracion.push(
                        {
                            billete_id: b.id,
                            cantidad: b.cantidad,
                            hojaDeRuta_id: $scope.liquidacion.hojaDeRuta_id
                        });
                    }
                }

                $http.post(GetUrlForService('/HojasDeRuta/RegistrarDeclaracionBilletes'),
                    {
                        billetes: declaracion,
                        hojaDeRuta_id: $scope.liquidacion.hojaDeRuta_id
                    }
                ).success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        window.location.reload();

                    } else {
                        HideLoader();
                    }

                }).error(function (data, status, headers, config) {

                    HideLoader();

                });

            };

            $scope.totalBilletes = function() {

                var totalBilletes = 0;
                
                if ($scope.billetes!=null)
                for (var i = 0; i < $scope.billetes.length; i++) {
                    var b = $scope.billetes[i];

                    if (b.cantidad == null)
                        b.cantidad = "";

                    totalBilletes = totalBilletes + ((b.cantidad*1) * b.valorNominal);
                }

                return totalBilletes;
            };

            $scope.obtenerDiferenciaLiquidacion = function() {

                try {
                    return ($scope.obtenerTotalCobrosEnEfectivo() - $scope.liquidacion.hojaDeRuta.montoEfectivoDeclarado - $scope.obtenerTotalGatos());
                } catch (e) {
                    return 0;
                } 
            }

            $scope.obtenerEstiloParaDevolucion = function(item) {

                return {
                     background: obtenerColorPorSuperior(item.porcentajeDeRecuperacion, 80, 40)
                };
            };

            $scope.obtenerEstiloParaDispenser = function (dispenser) {

                return {
                    background: dispenser.esError ? COLORES.ROJO : COLORES.VERDE
                };
            };

            $scope.obtenerEstiloParaRepuesto = function (repuesto) {

                return {
                    background: repuesto.esError ? COLORES.ROJO : COLORES.VERDE
                };
            };

            var obtenerGestionDeEnvases = function() {

                $http.get(GetUrlForService('/HojasDeRuta/ObtenerGestionDeEnvases'), {
                    params: {
                        hojaDeRuta_id: $scope.liquidacion.hojaDeRuta_id
                    }
                }).then(function(resp) {
                    $scope.gestionDeEnvases = resp.data.gestion;

                    RunTimer(dibujarGraficos, 300);

                }, function(resp) {});
            };

            var dibujarGraficos = function() {

                $('.easy-pie-chart.percentage').each(function() {
                    var $box = $(this).closest('.infobox');
                    var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
                    var trackColor = barColor == 'rgba(255,255,255,0.95)' ? 'rgba(255,255,255,0.25)' : '#E2E2E2';
                    var size = parseInt($(this).data('size')) || 50;
                    $(this).easyPieChart({
                        barColor: barColor,
                        trackColor: trackColor,
                        scaleColor: false,
                        lineCap: 'butt',
                        lineWidth: parseInt(size / 10),
                        animate: /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase()) ? false : 1000,
                        size: size
                    });
                });

                $('.sparkline').each(function () {
                    var $box = $(this).closest('.infobox');
                    var barColor = !$box.hasClass('infobox-dark') ? $box.css('color') : '#FFF';
                    $(this).sparkline('html',
									 {
									     tagValuesAttribute: 'data-values',
									     type: 'bar',
									     barColor: barColor,
									     chartRangeMin: $(this).data('min') || 0
									 });
                });
            };

            var obtenerPedidosVisitados = function() {
                var cantidad = 0;
                for (var i = 0; i < $scope.cierreLiquidacion.ClientesPedidos.length; i++) {
                    var cliente = $scope.cierreLiquidacion.ClientesPedidos[i];
                    if (cliente.visitado == true)
                        cantidad++;
                }
                return cantidad;
            };

            var obtenerClientesAusentes = function () {
                var cantidad = 0;
                for (var i = 0; i < $scope.cierreLiquidacion.ClientesAusentesNoVisitados.length; i++) {
                    var cliente = $scope.cierreLiquidacion.ClientesAusentesNoVisitados[i];
                    if (cliente.ausente == true)
                        cantidad++;
                }
                return cantidad;
            };

            var obtenerNoVisitados = function () {
                var cantidad = 0;
                for (var i = 0; i < $scope.cierreLiquidacion.ClientesAusentesNoVisitados.length; i++) {
                    var cliente = $scope.cierreLiquidacion.ClientesAusentesNoVisitados[i];
                    if (cliente.visitado == false)
                        cantidad++;
                }
                return cantidad;
            };

            $scope.init();

            MinimizarMenu();
        }]
);

mainApp.controller('hojasDeRutaMapaCtrl', ['$scope', '$http',
        function ($scope, $http) {

            $scope.hojaDeRuta_id = 0;
            $scope.hojaDeRuta = {};

            $scope.init = function () {

                //Solo si ya tiene una hoja de ruta ya en parámetro
                var par_hojaRutaId = getParameterByName("hojaDeRutaId");
                if (par_hojaRutaId != null && par_hojaRutaId != "") {

                    GLOBAL_CONFIG.finishLoading = false;
                    $scope.hojaDeRuta_id = par_hojaRutaId;

                    //Mapas de clientes en reparto
                    $http.get(GetUrlForService('/HojasDeRuta/ObtenerHojaDeRutaDetalle'), {
                        params: {
                            hojaDeRuta_id: par_hojaRutaId
                        }
                    }).
                    success(function (data, status, headers, config) {

                        if (data.error !=1) {

                            $scope.hojaDeRuta = data.hojaDeRuta;

                            setTimeout(function () {
                                MostrarClientesEnMapa($scope.hojaDeRuta.Clientes);
                            }, 500);

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


                    //Recorrido real del reparto
                    $http.get(GetUrlForService('/Moviles/ObtenerUbicacionesDeHojaDeRuta'), {
                        params: {
                            hojaDeRutaId: par_hojaRutaId
                        }
                    }).then(function(resp) {

                        if (resp.data.error == 0) {

                            $scope.ubicacionesDeHojaDeRuta = resp.data.ubicaciones;

                            setTimeout(function() {
                                MostrarCaminoDeRepartoEnMapa($scope.ubicacionesDeHojaDeRuta);

                                setTimeout(function () {
                                    utiles.ajustarMapa();
                                }, 500);
                            }, 500);

                            GLOBAL_FUNCTIONS.hideLoadingScreen();

                            setTimeout(function() {
                                setTooltip();
                            }, 300);

                        } else {
                            GLOBAL_FUNCTIONS.hideLoadingScreen();
                        }

                    }, function(resp) {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    });
                }
            };

            $scope.init();
        }]
);

mainApp.controller('recorridoRealHojaDeRutaController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.hojaDeRuta_id = 0;
            $scope.hojaDeRuta = {};

            var mapaActual = null;

            $scope.init = function () {

                mapaActual = utilesMap.iniciarMapa("div_map_movil");

                //Solo si ya tiene una hoja de ruta ya en parámetro
                var par_hojaRutaId = getParameterByName("hojaDeRutaId");
                if (par_hojaRutaId != null && par_hojaRutaId != "") {

                    $scope.hojaDeRuta_id = par_hojaRutaId;
                    
                    //Recorrido real del reparto
                    $http.get(GetUrlForService('/Moviles/ObtenerUbicacionesDeHojaDeRuta'), {
                        params: {
                            hojaDeRutaId: par_hojaRutaId
                        }
                    }).then(function (resp) {

                        if (resp.data.error == 0) {

                            $scope.ubicacionesDeHojaDeRuta = resp.data.ubicaciones;

                            var items = $scope.ubicacionesDeHojaDeRuta.filter(
                                function(ubicacion) {
                                    return !(ubicacion.latitud == null || ubicacion.latitud == "" ||
                                        ubicacion.longitud == null || ubicacion.longitud == "");
                                }).map(
                                function(ubicacion) {
                                    return {
                                        lat: ubicacion.latitud,
                                        lng: ubicacion.longitud,
                                        metadata: ubicacion
                                    };
                                });

                            var setTitulo = function (itm, idx) {

                                var hora = GetDayTimeFromDate(itm.metadata.fechaHora);
                                return hora + "   - (" + itm.metadata.estadoDeMovil + ")";
                            };

                            var setIcono = function (itm, idx) {
                                var iconColor = "00FF00";
                                return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (idx + 1) + "|" + iconColor + "|000000";
                            };

                            utilesMap.trazarCamino(mapaActual, items, true, setTitulo, setIcono);

                        } else {
                            GLOBAL_FUNCTIONS.hideLoadingScreen();
                        }

                    }, function (resp) {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    });
                }
            };

            $scope.init();
        }]
);

mainApp.controller('detallesDeClientesController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.hojaDeRuta_id = 0;

            $scope.init = function () {

                //Solo si ya tiene una hoja de ruta ya en parámetro
                var par_hojaDeRutaId = getParameterByName("hojaDeRutaId");
                
                $http.get(GetUrlForService('/HojasDeRuta/ObtenerDetallesDeClientes'), {
                    params: {
                        hojaDeRutaId: par_hojaDeRutaId
                    }
                }).
                then(function (resp) {

                    var data = resp.data;

                    if (data.error == 0) {

                        $scope.hojaDeRuta = data.detalles.HojaDeRuta;

                    } else {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    }

                }, function (resp) {
                    GLOBAL_FUNCTIONS.hideLoadingScreen();
                });
            };
            
            $scope.init();
        }]
);

mainApp.controller('listaDeClientesDeHojaDeRutaController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.init = function () {

            };

            $scope.init();
        }]
);


mainApp.controller('asignarMovilAHojaDeRutaController', ['$scope', '$http', 'hojaDeRuta', '$uibModalInstance',
    function ($scope, $http, hojaDeRuta, $uibModalInstance) {

        $scope.hojaDeRuta = hojaDeRuta;

        $scope.init = function () {
                
            $http.get(GetUrlForService('/HojasDeRuta/GetDataForAsignarHojaDeRuta'), {}).
            success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.moviles = data.moviles;
                    $scope.vehiculos = data.vehiculos;
                    $scope.repartidores = data.repartidores;

                    if ($scope.hojaDeRuta.movil_id != null) {
                        
                        var movilSeleccionado = $scope.moviles.filter(x=>x.id==$scope.hojaDeRuta.movil_id);
                        if (movilSeleccionado.length>0)
                            $scope.movilSeleccionado = movilSeleccionado[0];
                    }

                    if ($scope.hojaDeRuta.vehiculo_id != null) {
                        var vehiculoSeleccionado = $scope.vehiculos.filter(x=>x.id==$scope.hojaDeRuta.vehiculo_id);
                        if (vehiculoSeleccionado.length>0)
                            $scope.vehiculoSeleccionado = vehiculoSeleccionado[0];
                    }

                    if ($scope.hojaDeRuta.repartidor_id != null) {
                        var repartidorSeleccionado = $scope.repartidores.filter(x => x.usuario_id == $scope.hojaDeRuta.repartidor_id);
                        if (repartidorSeleccionado.length > 0)
                            $scope.repartidorSeleccionado = repartidorSeleccionado[0];
                    }

                } else {
                       
                }

            }).error(function (data, status, headers, config) {
                    
            });
        };

        $scope.confirmarAsignacionDeMovil = function () {

            if ($scope.hojaDeRuta == null) {
                ShowMessageBox(messageType_Error, "Error", "Debe seleccionar un móvil del listado");
                return;
            }

            $scope.procesando = true;
                
            $http.post(GetUrlForService('/HojasDeRuta/AsignarMovilYVehiculo'),
                {
                    hojasDeRutasId: $scope.hojaDeRuta.id,
                    movilAsignadoId:$scope.movilSeleccionado.id,
                    vehiculoId: $scope.vehiculoSeleccionado.id,
                    repartidorId: $scope.repartidorSeleccionado.usuario_id
                }
            ).then(function (resp) {

                $scope.procesando = false;

                if (resp.data.error == 0) {
                        
                    ShowMessageBox(messageType_Success,
                        "Error", "Se ha asignado el móvil a la hoja de ruta");
                    $uibModalInstance.close(null);
                } else {
                    ShowMessageBox(messageType_Error,
                        "Error", resp.data.message);
                }

            }, function (resp) {
                ShowMessageBox(messageType_Error,
                        "Error", "Se ha producido un error");
            });
        };

        $scope.cancelar = function () {
            $uibModalInstance.close(null);
        };

        $scope.init();
    }]
);

mainApp.controller('ubicacionDeRepartosController', ['$scope', '$http',
        function ($scope, $http) {

            var markersActuales = [];
            var mapaActual = null;

            $scope.init = function () {

                mapaActual = utilesMap.iniciarMapa("div_map_repartos");
                
                setInterval(actualizarPosiciones, 8000);
            };
            
            var actualizarPosiciones = function () {

                $http.get(GetUrlForService('/HojasDeRuta/ObtenerUbicacionesDeRepartoActual'), {})
                    .then(function(resp) {

                        if (resp.data.error == 0) {

                            $scope.ubicaciones = resp.data.ubicaciones;

                            mostrarEnMapa();

                        } else {
                            GLOBAL_FUNCTIONS.hideLoadingScreen();
                        }

                    }, function(resp) {
                        GLOBAL_FUNCTIONS.hideLoadingScreen();
                    });
            };

            var mostrarEnMapa = function() {

                var items = $scope.ubicaciones.filter(
                    function(ubicacion) {
                        return !(ubicacion.ultimaUbicacionLatitud == null || ubicacion.ultimaUbicacionLatitud == "" ||
                            ubicacion.ultimaUbicacionLongitud == null || ubicacion.ultimaUbicacionLongitud == "");
                    }).map(
                    function (ubicacion) {
                        return {
                            lat: ubicacion.ultimaUbicacionLatitud,
                            lng: ubicacion.ultimaUbicacionLongitud,
                            icon: obtenerIcono(ubicacion),
                            title: ubicacion.nombreReparto,
                            metadata: ubicacion
                        };
                    });

                var comparar = function(_marker, _item) {
                    return _marker.metadata.reparto_id == _item.metadata.reparto_id;
                };

                markersActuales = utilesMap.actualizarPosiciones(mapaActual, markersActuales, items, comparar);
            };

            var obtenerIcono = function(ubicacion) {
                var iconColor = "";

                switch (ubicacion.estadoMovilId) {
                    case 1:
                        iconColor = "24CE39";
                        break;
                    case 2:
                        iconColor = "D1F700";
                        break;
                    case 3:
                        iconColor = "F79400";
                        break;
                    case 4:
                        iconColor = "F70000";
                        break;
                }
                //return "https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=truck|bb|" + ubicacion.nombreReparto + "|" + iconColor + "|000000";
                return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + ubicacion.nombreReparto + "|" + iconColor + "|000000";
            };
            
            $scope.init();
        }]
);

mainApp.controller('ordenarClientesDeHojaDeRutaController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var mapaActual = null;
        var markersActuales = [];

        $scope.init = function () {

            $scope.hojaDeRutaId = getParameterByName("hojaDeRutaId") * 1;

            ShowLoader();

            $http.get(GetUrlForService('/HojasDeRuta/ObtenerHojaDetalleDeRuta'), {
                params: {
                    hojaDeRutaId: $scope.hojaDeRutaId
                }
            }).
               then(function (resp) {

                   HideLoader();

                   var data = resp.data;

                   if (data.error == 0) {

                       $scope.hojaDeRuta = data.hojaDeRuta;
                       
                       for (i = 0; i < $scope.hojaDeRuta.Clientes.length; i++) {
                           $scope.hojaDeRuta.Clientes[i].orden = i + 1;
                       };
                   }

                   setTimeout(function () {

                       $scope.Nest();

                       mapaActual = utilesMap.iniciarMapa("div_map_clientes");
                       mostrarClientesEnMapa();

                   }, 400);

               }, function (resp) { HideLoader(); })
        };
     
        $scope.AsignarOrden = function () {
            bootbox.confirm("Desea confirmar el orden actual de visita?"
                , function (result) {

                    if (result) {

                        ShowLoader();

                        var clientesOrdenados = new Array();

                        for (var i = 0; i < $scope.hojaDeRuta.Clientes.length; i++) {

                            var objCliente = {
                                cliente_id: $scope.hojaDeRuta.Clientes[i].cliente_id,
                                orden: $scope.hojaDeRuta.Clientes[i].orden,
                                hojaDeRutaId: $scope.hojaDeRuta.id
                            }

                            clientesOrdenados.push(objCliente);
                        }

                        $http.post(GetUrlForService('/HojasDeRuta/OrdenarClientesDeHojaDeRuta'),
                           {
                               clientes: clientesOrdenados
                           }).
                           success(function (data, status, headers, config) {

                               HideLoader();

                               if (data.error == 0) {

                                   ShowMessageBox(messageType_Success, "Exitoso", data.message);
                                   //$scope.BuscarServiciosTecnicos();

                               } else {
                                   ShowMessageBox(messageType_Error, "Error", data.message);
                               }


                           }).error(function (data, status, headers, config) {
                               HideLoader();
                               ShowMessageBox(messageType_Error, "Error", "Se ha producido un error.");
                           });
                    }
                });
        };

        $scope.Nest = function () {
            $('.dd').nestable({ maxDepth: 1 });

            $('.dd-handle a').on('mousedown', function (e) {
                e.stopPropagation();
            });

            $('.dd').on('change', function () {

                var clientesOrdenados = $('.dd').nestable('serialize');

                for (var i = 0; i < clientesOrdenados.length; i++) {

                    for (var j = 0; j < $scope.hojaDeRuta.Clientes.length; j++) {

                        if ($scope.hojaDeRuta.Clientes[j].cliente_id == clientesOrdenados[i].id) {
                            $scope.$apply(function () {
                                $scope.hojaDeRuta.Clientes[j].orden = (i + 1);
                                $scope.hojaDeRuta.Clientes.splice(i, 0, $scope.hojaDeRuta.Clientes.splice(j, 1)[0]);
                                $scope.hojaDeRuta.Clientes[j].orden = (j + 1);
                            });
                        }
                    }

                }

                mostrarClientesEnMapa();
            });

        };

        var mostrarClientesEnMapa = function () {

            var comparar = function (_marker, _item) {
                return _marker.metadata.reparto_id == _item.metadata.reparto_id;
            };

            var items = $scope.hojaDeRuta.Clientes.filter(
                function (cliente) {
                    return !(cliente.altitud == null || cliente.altitud == "" ||
                        cliente.longitud == null || cliente.longitud == "");
                }).map(
                function (cliente) {
                    return {
                        lat: cliente.altitud,
                        lng: cliente.longitud,
                        icon: obtenerIcono(cliente),
                        title: cliente.nombreCliente,
                        metadata: cliente
                    };
                });

            markersActuales = utilesMap.actualizarPosiciones(mapaActual, markersActuales, items, comparar);

        };

        var obtenerIcono = function (cliente) {

            var iconColor = "24CE39";

            if (cliente.servicioTecnico_id != null)
                iconColor = "F70000";
            else if (cliente.esPedido)
                iconColor = "D1F700";
            else if (cliente.esVentaExtra)
                iconColor = "F79400";

            return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + cliente.orden + "|" + iconColor + "|000000";
        };

        $scope.init();

    }]);

function MostrarClientesEnMapa(clientes) {
    
    //Maps
    geocoder = new google.maps.Geocoder();

    //Creo una localizacion en la Plaza San Martin
    var centro = new google.maps.LatLng(-31.4166082, -64.1866651);

    //Opciones del mapa
    var mapOptions = {
        zoom: 12,
        center: centro
    };
    
    //Creación del mapa
    map = new google.maps.Map(document.getElementById('div_map'), mapOptions);

    for (var i = 0; i < clientes.length; i++) {

        var cliente = clientes[i];
        
        if (cliente.altitud == null || cliente.altitud == "" ||
            cliente.longitud == null || cliente.longitud == "") {
            continue;
        }
        
        var latlng = new google.maps.LatLng(cliente.altitud, cliente.longitud);

        var iconColor;

        if (cliente.visitado) {
            if (cliente.ausente) {
                iconColor = "FFFF00";  //ausente
            } else {
                iconColor = "00FF00";  //visitado
            }
        } else {
            iconColor = "FF0000";  //no visitado
        }


        //Creo un marker localizado con el punto anterior
        var markerCliente = new google.maps.Marker({
            draggable: false,
            map: map,
            animation: google.maps.Animation.DROP,
            position: latlng,
            title: "[" + (i + 1) + "] - (" + cliente.cliente_id + ") " + cliente.nombreCliente + ". " + cliente.domicilioCompleto,
            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (i + 1) + "|" + iconColor + "|000000"
        });

        //markersClientes.push(markerCliente);
    }

}

function MostrarCaminoDeRepartoEnMapa(ubicaciones) {

    //Maps
    geocoder = new google.maps.Geocoder();

    //Creo una localizacion en la Plaza San Martin
    var centro = new google.maps.LatLng(-31.4166082, -64.1866651);

    //Opciones del mapa
    var mapOptions = {
        zoom: 12,
        center: centro
    };

    //Creación del mapa
    map = new google.maps.Map(document.getElementById('div_map_movil'), mapOptions);

    for (var i = 0; i < ubicaciones.length; i++) {

        var ubicacion = ubicaciones[i];

        if (ubicacion.latitud == null || ubicacion.latitud == "" ||
            ubicacion.longitud == null || ubicacion.longitud == "") {
            continue;
        }

        var latlng = new google.maps.LatLng(ubicacion.latitud, ubicacion.longitud);

        var iconColor = "00FF00";
        
        //Creo un marker localizado con el punto anterior
        var markerCliente = new google.maps.Marker({
            draggable: false,
            map: map,
            animation: google.maps.Animation.DROP,
            position: latlng,
            title: "[" + (i + 1) + "] - (" + ubicacion.estadoDeMovil + ")",
            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (i + 1) + "|" + iconColor + "|000000"
        });

        //markersClientes.push(markerCliente);
    }

}
