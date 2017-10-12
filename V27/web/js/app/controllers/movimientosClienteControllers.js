/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('movimientosCtrl', ['$scope', '$http', '$timeout', 'envasesService', '$uibModal',
    function ($scope, $http, $timeout, envasesService, $uibModal) {

        $scope.modeloMovimientos = {
            clienteId: idClienteActual
        };

        //Modelo buscar envases
        $scope.ModeloBuscarEnvases = {};
        $scope.ModeloBuscarEnvases.desde = getToday();
        $scope.ModeloBuscarEnvases.hasta = getToday();
        $scope.ModeloBuscarEnvases.envasesResultado = [];

        //Modelo buscar pedidos
        $scope.ModeloBuscarPedidos = {};
        $scope.ModeloBuscarPedidos.desde = getToday();
        $scope.ModeloBuscarPedidos.hasta = getToday();
        $scope.ModeloBuscarPedidos.pedidosResultado = [];

        //Visitas
        $scope.ModeloBuscarVisitas = {};
        $scope.ModeloBuscarVisitas.desde = getToday();
        $scope.ModeloBuscarVisitas.hasta = getToday();
        $scope.ModeloBuscarVisitas.visitasResultado = [];

        //Pedidos
        $scope.validarBusquedaPedidos = function () {

            var _message = "";

            if ($scope.ModeloBuscarPedidos.desde == null || $scope.ModeloBuscarPedidos.desde == "")
                _message = "Debe seleccionar una fecha desde. ";

            if ($scope.ModeloBuscarPedidos.hasta == null || $scope.ModeloBuscarPedidos.hasta == "")
                _message = "Debe seleccionar una fecha hasta. ";

            return { isValid: (_message == ""), message: _message };
        };
        $scope.buscarPedidos = function() {

            var _validation = $scope.validarBusquedaPedidos();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
                return;
            }

            ShowLoader();

            $http.post(GetUrlForService("/Pedidos/BucarPedidos"), {
                pedidoId: null,
                clienteId: MovimientosModelo.clienteActual_id,
                tipoPedidoId: null,
                desde: $scope.ModeloBuscarPedidos.desde,
                hasta: $scope.ModeloBuscarPedidos.hasta
            } ).
            success(
                function (data, status, headers, config) {

                    HideLoader();
                    
                    if (data.error == 0) {

                        $scope.ModeloBuscarPedidos.pedidosResultado = data.data;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error","Se ha producido un error");
                });
        };
        
        //Envases
        $scope.validarBusquedaEnvases = function () {

            var _message = "";

            if ($scope.ModeloBuscarEnvases.desde == null || $scope.ModeloBuscarEnvases.desde == "")
                _message = "Debe seleccionar una fecha desde. ";

            if ($scope.ModeloBuscarEnvases.hasta == null || $scope.ModeloBuscarEnvases.hasta == "")
                _message = "Debe seleccionar una fecha hasta. ";

            return { isValid: (_message == ""), message: _message };
        };
        $scope.buscarEnvases = function () {

            var _validation = $scope.validarBusquedaEnvases();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
                return;
            }

            ShowLoader();

            $http.post(GetUrlForService("/Envases/ObtenerPrestamosDevolucionesDeCliente"), {
                cliente_id: MovimientosModelo.clienteActual_id,
                desde: $scope.ModeloBuscarEnvases.desde,
                hasta: $scope.ModeloBuscarEnvases.hasta
            }).
            success(
                function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.ModeloBuscarEnvases.envasesResultado = data.data;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.crearNuevaSolicitud = function(articulo) {
            envasesService.abrirDialogoCrearSolicitud(articulo, $("#ClienteModelo_id").val() * 1, onConfirmarCrearSolicitud);
        };
        var onConfirmarCrearSolicitud=function() {
            obtenerDatosParaEnvases();
        }
        var obtenerDatosParaEnvases = function() {

            $http.get(GetUrlForService('/Envases/ObtenerDatosDeEnvasesParaMovimientos'), {
                params: {
                    clienteId: $("#ClienteModelo_id").val()*1
                }
            }).then(function (resp) {

                if (resp.data.error == 0) {

                    $scope.prestamosPendientes = resp.data.prestamosPendientes;
                    $scope.prestamosAcumulados = resp.data.prestamosAcumulados;
                    $scope.comodatos = resp.data.comodatos;
                }

            });
        };
        
        //Visitas
        $scope.validarBusquedaVisitas = function () {

            var _message = "";

            if ($scope.ModeloBuscarVisitas.desde == null || $scope.ModeloBuscarVisitas.desde == "")
                _message = "Debe seleccionar una fecha desde. ";

            if ($scope.ModeloBuscarVisitas.hasta == null || $scope.ModeloBuscarVisitas.hasta == "")
                _message = "Debe seleccionar una fecha hasta. ";

            return { isValid: (_message == ""), message: _message };
        };
        $scope.buscarVisitas = function () {

            var _validation = $scope.validarBusquedaVisitas();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
                return;
            }

            ShowLoader();

            $http.post(GetUrlForService("/Movimientos/ObtenerVisitasJson"), {
                cliente_id: MovimientosModelo.clienteActual_id,
                fechaDesde: $scope.ModeloBuscarVisitas.desde,
                fechaHasta: $scope.ModeloBuscarVisitas.hasta
            }).
            success(
                function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.ModeloBuscarVisitas.visitasResultado = data.data;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.verOperacionesConClientePorVisita = function (visita) {

            if (!visita.mostrarOperaciones) {
                visita.mostrarOperaciones = true;
            } else {
                visita.mostrarOperaciones = false;
                return;
            }

            if (visita.operacionesCargadas)
                return;

            ShowLoader();

            $http.post(GetUrlForService('/Movimientos/ObtenerOperacionesDeClientePorVisita'),
                {
                    visita_id: visita.id
                }
            ).success(function (data, status, headers, config) {

                HideLoader();

                if (data.error == 0) {

                    visita.operaciones = data.data;
                    visita.operacionesCargadas = true;

                } else {
                    HideLoader();
                }

            });

        };

        //Ajustes
        $scope.ModeloBuscarAjustes = {};
        $scope.ModeloBuscarAjustes.buscar = function() {

            //var _validation = $scope.validarBusquedaEnvases();
            //if (!_validation.isValid) {
            //    ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
            //    return;
            //}

            ShowLoader();

            $http.post(GetUrlForService("/AjustesCuenta/BuscarAjustes"), {
                desde: $scope.ModeloBuscarAjustes.desde,
                hasta: $scope.ModeloBuscarAjustes.hasta,
                clienteId: MovimientosModelo.clienteActual_id
            }).
            success(
                function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.ModeloBuscarAjustes.ajustes = data.ajustes;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };
       
        //Consumos
        $scope.modeloConsumos = {};
        $scope.modeloConsumos.idClienteSeleccionado = 0;
        $scope.modeloConsumos.idArticuloSeleccionado = 0;
        $scope.modeloConsumos.ventas = [];
        $scope.modeloConsumos.buscar = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Movimientos/ObtenerVentasPorCliente"), {
                fechaDesde: $scope.modeloConsumos.desde,
                fechaHasta: $scope.modeloConsumos.hasta,
                cliente_id: MovimientosModelo.clienteActual_id
            }).
            success(
                function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.modeloConsumos.ventas = data.ventas;

                        $scope.modeloConsumos.clientesDisponibles = [];
                        $scope.modeloConsumos.articulosDisponibles = [];
                        
                        $scope.modeloConsumos.clientesDisponibles.push(
                            {
                                cliente_id: 0,
                                nombreCliente: '-- Todos --'
                            });

                        $scope.modeloConsumos.articulosDisponibles.push(
                            {
                                articulo_id: 0,
                                nombreArticulo: '-- Todos --'
                            });

                        angular.forEach($scope.modeloConsumos.ventas,
                        function (item, index){

                            //Cliente
                            var itemExisted = $scope.modeloConsumos.clientesDisponibles.filter(function (x) { return x.cliente_id == item.clienteEntrega_id }).length > 0;

                            if (!itemExisted) {
                                $scope.modeloConsumos.clientesDisponibles.push(
                                    {
                                        cliente_id: item.clienteEntrega_id,
                                        nombreCliente: item.clienteEntrega
                                    });
                            }

                            if (item.Articulos) {

                                //Artículo
                                angular.forEach(item.Articulos,
                                    function (art, i) {

                                        var articuloExisted = $scope.modeloConsumos.articulosDisponibles.filter(function (x) { return x.articulo_id == art.articulo_id }).length > 0;

                                        if (!articuloExisted) {
                                            $scope.modeloConsumos.articulosDisponibles.push(
                                                {
                                                    articulo_id: art.articulo_id,
                                                    nombreArticulo: art.nombreArticulo
                                                });
                                        }
                                    });
                            }
                            
                        });

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.modeloConsumos.obtenerSubtotal = function(articulo) {

            return utiles.redondear(articulo.cantidad * articulo.precioUnitario) * 1;
        };
        $scope.modeloConsumos.facturarVentas = function() {

            bootbox.confirm("Usted está enviando a facturar LAS VENTAS seleccionadas. Está seguro?", function (result) {

                if (!result) return;

                var ventasIds = [];

                for (var i = 0; i < $scope.modeloConsumos.ventas.length; i++) {
                    var venta = $scope.modeloConsumos.ventas[i];
                    if (venta.seleccionada === true) {
                        ventasIds.push(venta.id);
                    }
                }

                ShowLoader();

                $http.post(GetUrlForService("/Facturacion/FacturarVentas"), {
                    ventasIds: ventasIds,
                    clienteId: MovimientosModelo.clienteActual_id
                }).success(
                    function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {
                            ShowMessageBox(messageType_Success, "Exitoso", "Las ventas se han facturado exitosamente");
                            $scope.modeloConsumos.buscar();
                        } else {
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }

                    }).error(function (data) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
            });

        };
        $scope.modeloConsumos.facturarArticulosSeleccionados = function () {

            var articulosSeleccionados = [];

            for (var i = 0; i < $scope.modeloConsumos.ventas.length; i++) {

                var venta = $scope.modeloConsumos.ventas[i];

                angular.forEach(venta.Articulos, function (art, j) {

                    if (art.seleccionado === true) {
                        articulosSeleccionados.push(art);
                    }

                });
            }

            if (articulosSeleccionados.length == 0)
            {
                ShowMessageBox(messageType_Error, "Error", "Debe seleccionar al menos un artículo");
                return;
            }
            
            var modal = $uibModal.open({
                templateUrl: '/js/app/views/facturacion/facturarArticulosSeleccionados.html',
                controller: 'confirmarFacturacionArticulosSeleccionados',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    articulosSeleccionados: function () { return articulosSeleccionados}
                }
            });
            
            modal.result.then(function () {

            }, function () {

            });
            
        };
        $scope.modeloConsumos.obtenerTotalSeleccionado = function () {

            var total = 0;
                        
            angular.forEach($scope.modeloConsumos.ventas, function (venta) {

                if (venta == null || venta.Articulos == null) return;

                var seleccionarArticulos = venta.seleccionada == true;

                angular.forEach(venta.Articulos, function (articuloVendido) {

                    if (seleccionarArticulos || articuloVendido.seleccionado) {
                        total = total + $scope.modeloConsumos.obtenerSubtotal(articuloVendido);
                    }
                });
            });

            return total;
        }
        $scope.modeloConsumos.onSeleccionarArticuloVendido = function (venta) {

            venta.seleccionada = false;
        };
        $scope.modeloConsumos.onSeleccionarVenta = function (venta) {

            angular.forEach(venta.Articulos, function (art, i) {
                art.seleccionado = false;
            });
        };
        $scope.modeloConsumos.seleccionarTodosParaDescargaDeRemitos = function () {

            angular.forEach($scope.modeloConsumos.ventas, function (venta) {

                venta.descargarRemito = $scope.modeloConsumos.seleccionarTodosRemitos;
            });
        };
        $scope.modeloConsumos.descargarRemitosSeleccionados = function () {

            var idsVentas = $scope.modeloConsumos.ventas
                .filter(function (x) { return x.descargarRemito == true; })
                .map(function (x) { return x.id; });

            var parametros = utiles.obtenerParametroArrayUrl(idsVentas, "idsVentas");

            var url = "/VentasEntregas/ObtenerRemitosPorVentas?" + parametros;

            var win = window.open(url, '_blank');

            win.focus();
        };
        
        //Disponibles
        $scope.ModeloDisponibles = {};
        $scope.obtenerArticulosTodos = function() {

            ShowLoader();

            $http.get(GetUrlForService("/Articulos/ObtenerArticulosResumen")).
                then(function(resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        $scope.ModeloDisponibles.articulosTodos = resp.data.data;
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function(data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };
        $scope.agregarDisponible = function() {

            ShowLoader();

            $http.post(GetUrlForService("/AbonosCliente/GenerarDisponibles"), {
                articuloId: $scope.ModeloDisponibles.articuloSeleccionado.id,
                clienteId: idClienteActual,
                fechaDesde: $scope.ModeloDisponibles.fechaDesdeDisponible,
                fechaHasta: $scope.ModeloDisponibles.fechaHastaDisponible,
                cantidad: $scope.ModeloDisponibles.cantidadDisponible
            }).
                then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", "Se ha agregado la disponibilidad del artículo");
                        window.location.reload();

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.ModeloDisponibles.consumirDisponibles = function () {

            ShowLoader();

            $http.post(GetUrlForService("/AbonosCliente/ConsumirDisponibles"), {
                    clienteId: idClienteActual,
                    fechaImputacionVenta: $scope.ModeloDisponibles.fechaImputacionDisponibles
                }).
                then(function(resp, status, headers, config) {

                    if (resp.data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", "Se ha agregado la disponibilidad del artículo");
                        window.location.reload();

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function(data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.ModeloDisponibles.buscarDisponibles = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Movimientos/ObtenerDisponibles"), {
                    cliente_id: idClienteActual,
                    fechaDesde: $scope.ModeloDisponibles.fechaDesde,
                    fechaHasta: $scope.ModeloDisponibles.fechaHasta,
                }).
                then(function(resp, status, headers, config) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        $scope.ModeloDisponibles.articulosDisponibles = resp.data.disponibles;
                        setTimeout(function() {
                            setNumericControl();
                        }, 300);
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function(data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };
        $scope.ModeloDisponibles.modificarDisponible = function (disponible) {

            ShowLoader();

            $http.post(GetUrlForService("/AbonosCliente/ModificarDisponible"), {
                disponibleId:disponible.id,
                cantidad: disponible.nuevoDisponible
            }).
                then(function (resp, status, headers, config) {

                    HideLoader();

                    if (resp.data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", "Se ha modificado la disponibilidad del artículo");
                        $scope.ModeloDisponibles.buscarDisponibles();

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        //Facturas
        $scope.modeloFacturas = {};
        $scope.modeloFacturas.fechaDesde = null;
        $scope.modeloFacturas.fechaHasta = null;
        $scope.modeloFacturas.facturas = [];
        $scope.modeloFacturas.ajustes = [];
        $scope.modeloFacturas.buscarFacturas = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Facturacion/ObtenerHistorialDeFacturas"), {
                    cliente_id: idClienteActual,
                    fechaDesde: $scope.modeloFacturas.fechaDesde,
                    fechaHasta: $scope.modeloFacturas.fechaHasta,
                }).
                then(function(resp, status, headers, config) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        $scope.modeloFacturas.facturas = resp.data.facturas;
                        $scope.modeloFacturas.ajustes = resp.data.ajustes;
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function(data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        $scope.modeloFacturas.descargarReporteFacturasCobros = function () {
            
            var url = "/Reportes/ReporteFacturasYCobros?" +
                "desde=" + $scope.modeloFacturas.fechaDesde +
                "&hasta=" + $scope.modeloFacturas.fechaHasta +
                "&clienteId=" + idClienteActual;
            var win = window.open(url, '_blank');
            win.focus();
        };

        $scope.modeloFacturas.ObtenerDatosAfip = function (item) {
            MovimientosModelo.ObtenerDatosAfip(item.id);
        };

        $scope.modeloFacturas.generarFacturaElectronica = function (item) {
            MovimientosModelo.GenerarFacturaElectronica(item.id);
        };

        $scope.modeloFacturas.generarFacturaElectronicaAjuste = function (ajuste) {

            ShowLoader();

            $http.post(GetUrlForService("/Facturacion/SolicitarFacturaElectronicaAjuste"), {
                ajusteId: ajuste.id
            }).
                then(
                function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        $scope.modeloFacturas.buscarFacturas();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };

        $scope.modeloFacturas.obtenerEstiloParaFactura = function(item) {

            if (item.saldoPendiente == item.montoFacturaTotal) {
                return "background-color: #FFB9B9;";
            } else if (item.saldoPendiente > 0) {
                return "background-color: #FEFFB9;";
            } else {
                return "";
            }
        };
        $scope.modeloFacturas.verCobros = function (item) {

            item.mostrarCobros = !item.mostrarCobros;

            if (item.cobros==null) {
                
                ShowLoader();

                $http.get(GetUrlForService("/Facturacion/ObtenerCobrosDeFacturas"),
                    {
                        params: {
                            facturaId: item.id
                        }
                    })
                    .then(function(resp, status, headers, config) {

                        HideLoader();
                        if (resp.data.error == 0) {
                            item.cobros = resp.data.cobros;
                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }

                    }, function(data) {
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
            }
        };
        $scope.modeloFacturas.regenerarComprobante = function (factura) {

            bootbox.confirm("Al regenerar el comprobante, se actualizarán los datos del mismo con los datos actuales del cliente. Desea continuar?", function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService("/Facturacion/RegenerarComprobanteDeFactura"),
                        {
                            facturaId: factura.id
                        })
                        .then(function (resp, status, headers, config) {

                            HideLoader();
                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "El comprobante se ha regenerado");
                                $scope.modeloFacturas.buscarFacturas();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                        }, function (data) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        });
                }
            });

        };
        $scope.modeloFacturas.eliminarPdf = function (factura) {

            bootbox.confirm("¿Desea eliminar el PDF para volver a ser generado?", function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService("/Facturacion/EliminarPdfDeFactura"),
                        {
                            facturaId: factura.id
                        })
                        .then(function (resp, status, headers, config) {

                            HideLoader();
                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "El archivo pdf ha sido eliminado");
                                $scope.modeloFacturas.buscarFacturas();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                        }, function (data) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        });
                }
            });

        };
        $scope.modeloFacturas.convertirAFactura = function (factura) {

            bootbox.confirm("¿Desea convertir esta liquidación a un comprobante fiscal?", function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService("/Facturacion/ConvertirLiquidacionMensualAFactura"),
                        {
                            facturaId: factura.id
                        })
                        .then(function (resp, status, headers, config) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "El comprogante fiscal se ha generado. Debe actualizar los datos de la pantalla en unos segundos.");
                                $scope.modeloFacturas.buscarFacturas();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                        }, function (data) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        });
                }
            });

        };
        $scope.modeloFacturas.enviarFacturaPorMail = function (factura) {

            bootbox.confirm("¿Desea enviar la factura seleccionada?", function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService("/Facturacion/EnviarFacturaPorMail"),
                        {
                            facturaId: factura.id
                        })
                        .then(function (resp, status, headers, config) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "La factura ha sido enviada por mail a los " +
                                                                    "contactos que tiene el cliente en el sistema.");
                                $scope.modeloFacturas.buscarFacturas();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                        }, function (data) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        });
                }
            });

        };

        //Notas de créditos
        $scope.modeloNotasDeCredito = {};
        $scope.modeloNotasDeCredito.imputarNotasDeCreditos = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Facturacion/ImputarNotasDeCreditos"), {
                cliente_id: idClienteActual
            }).
                then(function (resp, status, headers, config) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        ShowMessageBox(messageType_Success, "Exitoso", "Se han imputado los cobros a cuenta.");
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        //General
        $scope.init = function () {

            var fechaDesde = getDateToShow(new Date().addMonths(-6));
            var fechaHasta = getDateToShow(new Date().addMonths(1));

            $scope.ModeloBuscarAjustes.desde = fechaDesde;
            $scope.ModeloBuscarAjustes.hasta = fechaHasta;

            $scope.ModeloDisponibles.fechaDesde = fechaDesde;
            $scope.ModeloDisponibles.fechaHasta = fechaHasta;

            $scope.modeloFacturas.fechaDesde = fechaDesde;
            $scope.modeloFacturas.fechaHasta = fechaHasta;

            $scope.modeloConsumos.desde = fechaDesde;
            $scope.modeloConsumos.hasta = fechaHasta;

            $scope.ModeloBuscarEnvases.desde = fechaDesde;
            $scope.ModeloBuscarEnvases.hasta = fechaHasta;

            $timeout(function() {
                RePrepareView($("#tabs-articulosdisponibles"));
            }, 300);

            $scope.obtenerArticulosTodos();

            obtenerDatosParaEnvases();

        };
        $scope.init();

    }]);

mainApp.controller('incidentesDeClienteController', ['$scope', '$http', 'incidentesService',
    function ($scope, $http, incidentesService) {
       
        var init = function () {

            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6));
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

            $http.get(GetUrlForService("/Incidentes/GetDataForBuscarIncidentes")).
               then(function (resp) {

                   $scope.tiposDeIncidentes = resp.data.tiposIncidentes;
                   if ($scope.tiposDeIncidentes == null) $scope.tiposDeIncidentes = [];
                   $scope.tiposDeIncidentes.insert(0, { valor_ids: 0, valorTexto: '-- Tipo de incidente --' });
                   $scope.tipoDeIncidenteId = 0;

               });
        };

        $scope.buscarIncidentes = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Incidentes/ObtenerIncidentes"), {
                cliente: MovimientosModelo.clienteActual_id * 1 ,
                fechaDesde: $scope.fechaDesde,
                fechaHasta: $scope.fechaHasta,
                ordenarDescendente: true,
            }).
            then(
                function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {

                        $scope.incidentes = resp.data.incidentes;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.obtenerClienteId = function () {
            return MovimientosModelo.clienteActual_id * 1;
        };

        $scope.VerIncidente = function (incidente) {

            incidentesService.verIncidente(incidente);
        };
        
        init();

    }]);

mainApp.controller('serviciosTecnicosDeClienteController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.onBuscarServiciosTecnicos = null;

        var init = function () {

            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6));
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

        };

        $scope.buscarServiciosTecnicos = function () {
            $scope.onBuscarServiciosTecnicos();
        };

        $scope.obtenerClienteId = function () {
            return MovimientosModelo.clienteActual_id * 1;
        };

        init();

    }]);


mainApp.directive('editarConsumo', function ($http, $uibModal) {

    return {
        restrict: 'E',
        scope: {
            itemVendido: "=?",
            idItemVendido: "=?",
            onConfirmarEdicion:"=?"
        },
        templateUrl: "/js/app/views/movimientos/editarConsumoDirective.html",
        link: function (scope, element, attrs) {

            scope.isVisible = false;

            var init = function () {
                scope.isVisible = scope.itemVendido.facturaDeItem_id == null && scope.itemVendido.factura_id == null;
            };

            scope.onEditarItemVendido = function () {

                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/movimientos/editarConsumoView.html',
                    controller: 'editarConsumoController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        itemVendido: function () { return scope.itemVendido;}
                    }
                });
                modal.result.then(function () {

                    if (scope.onConfirmarEdicion != null) scope.onConfirmarEdicion();

                }, function () {

                });

            };

            init();
        }
    };
});

mainApp.controller('editarConsumoController', ['$scope', '$http', 'itemVendido', '$uibModalInstance',
    function ($scope, $http, itemVendido, $uibModalInstance) {

        $scope.itemVendido = itemVendido;
        $scope.precioUnitario = itemVendido.precioUnitario;
        $scope.cantidad = itemVendido.cantidad;

        var init = function () {
            
        };

        $scope.guardarCambios = function () {

            ShowLoader();

            $http.post(GetUrlForService("/VentasEntregas/ModificarItemVendido"), {
                idItemVendido: $scope.itemVendido.id,
                precioUnitario: $scope.precioUnitario,
                cantidad: $scope.cantidad
            }).
                then(
                function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {

                        $scope.itemVendido.precioUnitario = $scope.precioUnitario;
                        $scope.itemVendido.cantidad = $scope.cantidad;

                        $uibModalInstance.close();

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.cerrar = function () {
            $uibModalInstance.dismiss();
        };

        init();

    }]);

mainApp.controller('confirmarFacturacionArticulosSeleccionados', ['$scope', '$http', '$uibModalInstance', 'articulosSeleccionados',
    function ($scope, $http, $uibModalInstance, articulosSeleccionados) {

        $scope.articulosSeleccionados = articulosSeleccionados;

        $scope.articulosResumen = [];
        $scope.total = 0;

        $scope.init = function () {

            RunTimer(function () {
                RePrepareView($("#divFacturarArticulosSeleccionados"));
            }, 100);

            angular.forEach($scope.articulosSeleccionados, function (item, i) {
                var itemExistente = $scope.articulosResumen.filter(function (x) { return x.articulo_id == item.articulo_id && item.precioUnitario == x.precioUnitario });
                if (itemExistente.length > 0) {
                    itemExistente[0].cantidad += item.cantidad; 
                } else {
                    $scope.articulosResumen.push({
                        articulo_id: item.articulo_id,
                        precioUnitario: item.precioUnitario,
                        nombreArticulo: item.nombreArticulo,
                        cantidad: item.cantidad
                    });
                }
            });

            angular.forEach($scope.articulosResumen, function (item, i) {
                item.subtotal = item.precioUnitario * item.cantidad;
                $scope.total += item.subtotal;
            });
        };
        
        $scope.confirmarFacturacion = function () {
            

            bootbox.confirm("Usted está enviando a facturar LOS ARTÍCULOS seleccionados. Está seguro?", function (result) {

                if (!result) return;

                var articulosVendidosIds = $scope.articulosSeleccionados.map(function (x) { return x.id;});;

                ShowLoader();

                $http.post(GetUrlForService("/Facturacion/FacturarArticulosVendidos"), {
                    articulosVendidosIds: articulosVendidosIds,
                    clienteId: MovimientosModelo.clienteActual_id,
                    fecha: $scope.fecha
                }).then(
                    function (resp) {

                        HideLoader();

                        if (resp.data.error == 0) {
                            ShowMessageBox(messageType_Success, "Exitoso", "Las items se han facturado exitosamente");
                            $scope.modeloConsumos.buscar();
                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }

                    }, function (data) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
            });

        };

        $scope.cerrar = function () {
            $uibModalInstance.dismiss();
        };

        $scope.init();
    }]);

