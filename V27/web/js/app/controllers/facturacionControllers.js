/// <reference path="../../General_OnLoad.js" />
var facturacionControllers = angular.module('facturacionControllers', []);

facturacionControllers.controller('procesosCtrl', ['$http',
    function ($http) {
        
        var model = {
            fecha: "",
            fechaDeFacturacion: null,
            procesandoMasivamente:false,
            cantidadTotalProcesos:null,
            cantidadExitosos:null,
            cantidadConError:null,
            cantidadProcesados:null,
            estado: {},
            indexItemProcesado:0,
            seleccionadosTodos: false,
            procesando: false,
            detenerProceso:false,
            procesosAProcesar:[],
            ObtenerProcesos: function() {
                
                var self = this;

                ShowLoader();
                $http.post(GetUrlForService('/Facturacion/ObtenerProcesos'),
                    {
                        fecha: this.fecha,
                        estadoProceso: this.estado.value,
                        repartoId: (this.repartoSeleccionado.id == 0 ? null : this.repartoSeleccionado.id),
                        diaId: (this.diaSeleccionado.valor_ids == 0 ? null : this.diaSeleccionado.valor_ids),
                        tipoClienteId : this.tipoClienteId
                    }).
                    success(function(data, status, headers, config) {

                        if (data.error) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", data.message);
                            return;
                        }


                        $.each(data, function (index, value) {

                            //Inicializo nuvas propiedades
                            value.isSelected = false;
                            value.procesando = false;
                            value.resultadoProceso = null;
                        });

                        self.procesosResultado = data;
                        self.seleccionadosTodos = false;
                        HideLoader();
                    }).
                    error(function(data, status, headers, config) {
                        HideLoader();
                        alert('Error');
                    });

            },
            SeleccionarTodos: function() {

                var self = this;

                $.each(self.procesosResultado, function (index, value) {
                    if (value.procesando || value.estadoProcesoFacturacion_ids == 3) {
                        value.isSelected = false;
                    } else {
                        value.isSelected = !self.seleccionadosTodos;
                    }
                    
                });
            },
            ProcesarSeleccionados: function() {

                var self = this;
                ShowLoader();
                $http.get(GetUrlForService('/Facturacion/VerificarFechaDeFacturacion'),
                {
                    params: {
                        fecha: self.fechaDeFacturacion
                    }
                }).then(function(resp) {
                    HideLoader();
                    if (resp.data.error == 0) {
                        self.ConfirmarSiProcesa();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (resp) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error.");
                });

               
            },
            ConfirmarSiProcesa: function () {

                var self = this;

                var mensaje;

                if (self.fechaDeFacturacion == null || self.fechaDeFacturacion == '')
                    mensaje = "Desea facturar los procesos de facturación seleccionados sin fecha de facturación? Se asignará la fecha actual.";
                else
                    mensaje = "Desea facturar los procesos de facturación seleccionados con la fecha de facturación: " + self.fechaDeFacturacion;

                bootbox.confirm(mensaje, function (result) {

                    if (result) {

                        self.procesosAProcesar = [];
                        self.procesando = true;
                        self.indexItemProcesado = 0;

                        $.each(self.procesosResultado, function (index, value) {
                            if (value.isSelected === true && (value.estadoProcesoFacturacion_ids == 1
                                || value.estadoProcesoFacturacion_ids == 4)) {
                                self.procesosAProcesar.push(value);
                            }
                        });

                        //Inicia el proceso con el primer item
                        if (self.procesosAProcesar.length > 0) {
                            self.ProcesarFacturacion(self.procesosAProcesar[self.indexItemProcesado]);
                        } else {
                            self.procesando = false;
                        }
                    }
                });

            },
            ProcesarFacturacion: function (proceso) {

                var self = this;
                proceso.procesando = true;
                var procesoActual = proceso;

                $http.post(GetUrlForService('/Facturacion/ProcesarFacturacion'),
                {
                    procesoId: procesoActual.id,
                    fecha: self.fechaDeFacturacion
                }).success(function(data, status, headers, config) {

                    //TODO: Lógica necesaria para cuando vuelve del proceso de la facturación
                    procesoActual.procesando = false;
                    procesoActual.resultadoProceso = data.message;

                    if (data.error == "0") { //Si fue existoso
                        procesoActual.estado = "procesado";
                    } else {
                        procesoActual.estado = "error";
                    }

                    //Se termina el proceso
                    if ((self.procesosAProcesar.length - 1 == self.indexItemProcesado) || self.detenerProceso) {

                        self.procesando = false;

                    } else {

                        self.indexItemProcesado++;
                        self.ProcesarFacturacion(self.procesosAProcesar[self.indexItemProcesado]);
                    }

                }).error(function(data, status, headers, config) {

                    procesoActual.procesando = false;

                    //Se termina el proceso
                    if (self.procesosAProcesar.length - 1 == self.indexItemProcesado || !self.detenerProceso) {

                        self.procesando = false;

                    } else {
                        self.ProcesarFacturacion(self.procesosAProcesar[self.indexItemProcesado + 1]);
                    }
                });
            },
            obtenerAvanceDeProcesoMasivo : function(modelo) {
              
                var self = modelo;

                $http.get(GetUrlForService('/Facturacion/ObtenerAvanceDeProcesoDeFacturacion')).then(function(resp) {

                           if (resp.data.error == 0) {

                               var avance = resp.data.avance;
                               self.procesandoMasivamente = avance.estado == 2;
                               self.cantidadTotalProcesos = avance.totalClientes;
                               self.cantidadExitosos = avance.exitosos;
                               self.cantidadConError = avance.errores;
                               self.cantidadProcesados = avance.totalProcesados;
                           } else {
                               self.procesandoMasivamente = false;
                           }

                       }, function(resp) {});
                
            },
            iniciarProcesoMasivoDeFacturacion : function() {

                var self = this;

                var mensaje = "Está seguro de iniciar el proceso masivo de Facturación con la fecha seleccionada ("+self.fechaDeFacturacion+") ?";

                bootbox.confirm(mensaje, function(result) {

                    if (result) {

                        $http.post(GetUrlForService('/Facturacion/InicarProcesoDeFacturacion'),
                        {
                            fecha: self.fechaDeProcesos,
                            fechaFacturacion: self.fechaDeFacturacion,

                        }).then(function(resp) {

                        }, function(resp) {});
                    }
                });
            },
            ops_estados: [],
            procesosResultado: []
            };
        
      
        var init = function() {
            //Estados posibles
            model.ops_estados.push({ display: 'Todos', value: 0 });
            model.ops_estados.push({ display: 'Pendientes', value: 1 });
            model.ops_estados.push({ display: 'Finalizados', value: 2 });
            model.ops_estados.push({ display: 'Error', value: 4 });

            model.fecha = getToday();
            model.estado = model.ops_estados[0];
            model.tipoClienteId = "1";

            RePrepareView($("#div_formBuscarProcesos"));

            $http.get(GetUrlForService("/Facturacion/GetDataForProcesos"), {}).success(
              function (data, status, headers, config) {

                  if (data.error == 0) {

                      model.repartos = data.repartos;
                      model.repartos.splice(0, 0, { id: 0, nombreReparto: "-- Todos --" });
                      model.repartoSeleccionado = data.repartos[0];

                      model.dias = data.dias;
                      model.dias.splice(0, 0, { valor_ids: 0, valorTexto: "-- Todos --" });
                      model.diaSeleccionado = data.dias[0];

                  }

              }

          );

            window.setInterval(function() {
                model.obtenerAvanceDeProcesoMasivo(model);
            }, 5000);
        };

        init();

        model.mostrarItemsAFacturar = function (proceso) {

            if (proceso.itemsAFacturar != null) {
                proceso.mostrarItems = !proceso.mostrarItems;
                return;
            }

            var procesoActual = proceso;

            $http.post(GetUrlForService('/Facturacion/ObtenerItemsAFacturar'),
               {
                   procesoId: procesoActual.id
               }).
               success(function (data, status, headers, config) {

                   if (data.error == "0") {//Si fue existoso
                       procesoActual.itemsAFacturar = data.itemsAFacturar;
                       proceso.mostrarItems = !proceso.mostrarItems;
                   } else { }

               }).
               error(function (data, status, headers, config) {

               });

        };
        
        return model;

    }]);

facturacionControllers.controller('comandosCtrl', ['$http',
    function ($http) {

        var model = {
            titulo: "",
            mensaje: "",
            procesando: false,
            processId:0,

            ejecutarImputacionesAbono: function () {

                var self = this;
                self.titulo = "Ejecutando proceso diario.....";
                self.procesando = true;
                //self.processId = utiles.randomXToY(10000, 90000);
                self.processId = 10000;

                var _fecha = $("#txt_fechaImputacionAbonos").val();

                $http.get(GetUrlForService('/Facturacion/EjecutarProcesoDiario'), {
                    params: { fecha: _fecha, procesoId: self.processId }
                }).
                   success(function (data, status, headers, config) {

                       self.processId = data;
                       self.titulo = "Proceso diario ejecutado";
                       self.mensaje = data.message;
                       self.procesando = false;


                   }).
                   error(function (data, status, headers, config) {

                       self.titulo = "Error";
                       self.mensaje = "Se ha producido un error al ejecutar el proceso diario.";
                       self.procesando = false;
                   });
            },
            ejecutarGeneradorDeProcesos: function () {
                
                var self = this;

                self.titulo = "Generando procesos de facturación.....";
                self.procesando = true;

                $http.get(GetUrlForService('/Facturacion/GenerarProcesosFacturacionHoy'), {}).
                   success(function (data, status, headers, config) {

                       self.titulo = "Generador de Procesos de Facturación";
                       self.mensaje = data.message;
                       self.procesando = false;

                   }).
                   error(function (data, status, headers, config) {

                       self.titulo = "Error";
                       self.mensaje = "Se ha producido un error al ejecutar el generador de procesos de facturación.";
                       self.procesando = false;
                   });
            },
            GenerarHojasDeRutas: function () {

                var fecha = $("#txt_fechaHojasDeRutas").val();
                var self = this;
                self.titulo = "Generando hojas de rutas.....";
                self.procesando = true;
                
                $http.get(GetUrlForService('/HojasDeRuta/GenerarHojasDeRutas') + "&fechaGeneracion="+fecha).
                   success(function (data, status, headers, config) {

                       if (data.error == "0") {
                           self.titulo = "Generación de hojas de rutas exitosa";
                           self.mensaje = data.message;
                           self.procesando = false;
                       } else {
                           self.titulo = "Error al generar hojas de rutas";
                           self.mensaje = data.message;
                           self.procesando = false;
                       }
                   }).
                   error(function (data, status, headers, config) {
                       self.titulo = "Error al generar hojas de rutas";
                       self.mensaje = "Error genérico";
                       self.procesando = false;
                   });
            },
            consultarProgreso: function() {
                
                $http.get(GetUrlForService('/Misc/ObtenerProgreso'), {
                    params: { processId: 10000 }
                }).
                     success(function (data, status, headers, config) {

                         model.progreso = data;

                     }).
                     error(function (data, status, headers, config) {

                         self.titulo = "Error";
                         self.mensaje = "Se ha producido un error al ejecutar el proceso diario.";
                         self.procesando = false;
                     });
            },
        };

        RePrepareView($("#div_comandosBatch"));

        return model;

    }]);

facturacionControllers.controller('facturasController', ['$http', '$scope',
    function ($http,$scope) {

        $scope.fechaDesde = null;
        $scope.fechaHasta = null;
        $scope.facturas = [];
        $scope.soloConErrores = false;

        $scope.init = function() {
            RePrepareView($("#div_formFacturas"));
        };

        $scope.buscarFacturas = function() {
            
            ShowLoader();
            $http.post(GetUrlForService('/Facturacion/BuscarFacturas'),
                {
                    soloConErrores:$scope.soloConErrores,
                    fechaDesde: $scope.fechaDesde,
                    fechaHasta: $scope.fechaHasta
                }).
                success(function (data, status, headers, config) {

                    HideLoader();
                    if (data.error===0) {
                        $scope.facturas = data.data;
                        $scope.ajustesFacturacion = data.ajustesFacturacion;
                        $scope.documentos=$scope.facturas.slice().concat($scope.ajustesFacturacion.slice());
                    }
                }).
                error(function (data, status, headers, config) {
                    HideLoader();
                    alert('Error');
                });
        };

        $scope.generarFacturasDigitalesPendientes = function() {
            
            ShowLoader();
            $http.get(GetUrlForService('/Facturacion/GenerarFacturasElectronicasPendientes'), {}).
                success(function (data, status, headers, config) {
                    HideLoader();
                }).
                error(function (data, status, headers, config) {
                    HideLoader();
                    alert('Error');
                });
        };

        $scope.generarPdfPendientes = function () {
            ShowLoader();
            $http.get(GetUrlForService('/Facturacion/GenerarFacturasPdfPendientes'), {}).
                success(function (data, status, headers, config) {
                    HideLoader();
                }).
                error(function (data, status, headers, config) {
                    HideLoader();
                    alert('Error');
                });
        };

        $scope.generarPdfPendientesLiquidaciones = function () {
            
            ShowLoader();
            
            $http.get(GetUrlForService('/Facturacion/GenerarPDFPendientesDeLiquidaciones'), {
                    params: {
                        desde:$scope.fechaDesde,
                        hasta:$scope.fechaHasta
                    }
                }).
                then(function(resp) {
                    
                    HideLoader();

                    if (resp.data.error == 0) {
                        ShowMessageBox(messageType_Success, "Proceso iniciado", "Espere varios minutos y verifique los PDFs que necesita.");
                    } else {
                        ShowMessageBox(messageType_Error, "Proceso iniciado anteriormente", resp.data.message);
                    }
                }, function() {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al intentar iniciar el proceso");
                    HideLoader();

                });
        };

        $scope.obtenerPDFs = function() {
            
            $http.get(GetUrlForService('/Reportes/GenerarPDFDeComprobantes'),
                {
                    params: {
                        desde: $scope.fechaDesde,
                        hasta: $scope.fechaHasta
                    }
                }).
                then(function (resp) {

                    $scope.generandoPdfs = false;

                    if (resp.data.error == 0) {
                        window.open("/"+resp.data.pathDelReporte);
                    } else {
                        ShowMessageBox(messageType_Error, "Error al generar las facturas", resp.data.message);
                    }
                }, function (resp) {
                    $scope.generandoPdfs = false;
                    alert('Error');
                });

            $scope.generandoPdfs = true;
        };

        $scope.init();
    }]);

facturacionControllers.controller('nuevoAjusteFacturacionController', ['$http', '$scope',
    function ($http, $scope) {

        $scope.ajuste = {
             anulacionDeFactura: false
        };
        $scope.conceptosNuevos = [];

        $scope.init = function () {

            ShowLoader();
            
            $scope.facturaId = getParameterByName("facturaId") * 1;

            //GetDataForCrearNuevoAjuste
            $http.get(GetUrlForService("/Facturacion/GetDataForCrearNuevoAjuste"),
                {
                    params: {
                        facturaId: $scope.facturaId
                    }
                })
                .success(function(data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {
                        $scope.factura = data.factura;
                        $scope.cliente = data.cliente;
                        $scope.tiposAjustes = data.tiposDeAjustes;
                        $scope.motivosAjustes = data.motivosAjustes;
                        $scope.articulos = data.articulos;
                        $scope.esConsumidorFinal = data.esConsumidorFinal;

                        $scope.factura.ItemsFactura.map(function(x) {
                            x.cantidad = 0;
                        });

                        $scope.ajuste.tipoAjuste_ids = 1;

                        RunTimer(function() {
                            RePrepareView($("#div_nuevoAjusteFacturacionController"));
                        }, 300);

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }
                })
                .error(function(data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };

        $scope.confirmar = function() {

            var validacion = validarAjuste();

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error de validaciones", validacion.message);
                return;
            }
            
            bootbox.confirm("Confirma la generación del ajuste de facturación?", function (result) {

                if (result) {
                    $scope.confirmado();
                }
            });
            
        };

        $scope.confirmado = function () {

            validarAjuste();

            ShowLoader();

            $scope.ajuste.ItemsFacturacion = [];
            $scope.ajuste.factura_id = $scope.facturaId;

            if ($scope.ajuste.tipoAjuste_ids == 1 && !$scope.ajuste.anulacionDeFactura) { // Si es una nota de crédito

                for (var i = 0; i < $scope.factura.ItemsFactura.length; i++) {

                    var item = $scope.factura.ItemsFactura[i];

                    if (item.selected) {

                        var itemAjuste = {
                            itemFactura_id: item.id,
                            articulo_id: item.articuloLista_id,
                            precioUnitario: item.precioUnitario,
                            cantidad: item.cantidad,
                            factorIVA: item.factorIVA,
                            descriptionItem: item.descriptionItem,
                            codigoInterno: item.codigoInterno
                        };

                        $scope.ajuste.ItemsFacturacion.push(itemAjuste);
                    }
                }

            } else if ($scope.ajuste.tipoAjuste_ids == 2) { //Si es una Nota de débito

                for (var i = 0; i < $scope.conceptosNuevos.length; i++) {

                    var item = $scope.conceptosNuevos[i];

                    if (item.selected) {

                        var articulo = obtenerArticulo(item.articulo_id);

                        var itemAjuste = {
                            articulo_id: articulo.id,
                            precioUnitario: item.precioUnitario,
                            cantidad: item.cantidad,
                            factorIVA: $scope.esConsumidorFinal ? articulo.factIVAConsF: articulo.factIVAFacA,
                            descriptionItem: articulo.nombreArticulo,
                            codigoInterno: articulo.codigoInterno
                        };

                        $scope.ajuste.ItemsFacturacion.push(itemAjuste);
                    }
                }
            }

            $http.post(GetUrlForService("/Facturacion/CrearNuevoAjusteFacturacion"),
                {
                    ajuste: $scope.ajuste
                })
                .success(function (data, status, headers, config) {

                    ShowLoader();

                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", "El ajuste ha sido guardado");
                        window.location.href = "/Clientes/HistorialMovimientos/" + $scope.factura.cliente_id + "?tab=facturas";

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }
                })
                .error(function (data, status, headers, config) {
                    ShowLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.onChangeTipoDeAjuste = function() {

            $scope.factura.ItemsFactura.map(function(x) {
                x.cantidad = 0;
            });

            $scope.conceptosNuevos.map(function(x) {
                x.cantidad = 0;
            });

            RunTimer(function() {
                RePrepareView($("#div_nuevoAjusteFacturacionController"));
            }, 300);

        };

        $scope.obtenerIvaItem = function(item) {

            if (!item.selected)
                return 0;

            var totalIva = utiles.obtenerMontoIva((item.cantidad * item.precioUnitario), item.factorIVA);

            return totalIva;
        };

        $scope.obtenerSutotalItem = function (item) {
            if (!item.selected)
                return 0;
            return utiles.redondear(item.cantidad * item.precioUnitario);
        };

        $scope.obtenerTotal = function () {

            if ($scope.factura == null)
                return 0;

            var total = 0;

            if ($scope.ajuste.tipoAjuste_ids == 2) {
                for (var j = 0; j < $scope.conceptosNuevos.length; j++) {
                    total += $scope.conceptosNuevos[j].precioUnitario * $scope.conceptosNuevos[j].cantidad;
                }
            } else if ($scope.ajuste.tipoAjuste_ids == 1) {
                for (var i = 0; i < $scope.factura.ItemsFactura.length; i++) {
                    total += $scope.obtenerSutotalItem($scope.factura.ItemsFactura[i]);
                }
            }

            return total;
        };

        $scope.obtenerPorcentajeIva=function(item) {
            return utiles.redondear((item.factorIVA - 1) * 100);
        }

        $scope.obtenerPorcentajeIvaNotaDeDebito = function (item) {

            if (!(item.articulo_id > 0))
                return "";

            var articuloSeleccionado = $scope.articulos.filter(x=>x.id == item.articulo_id)[0];

            return $scope.esConsumidorFinal ? 
                    articuloSeleccionado.porcIVAConsF : 
                    articuloSeleccionado.porcIVAFacA;

        };

        var validarAjuste = function() {

            var error = "";
            
            if ($scope.ajuste.textoEnMovimiento == null || $scope.ajuste.textoEnMovimiento == "")
                error += "Debe ingresar un valor en el campo 'Texto de registro'. ";

            if ($scope.ajuste.tipoAjuste_ids == null)
                error += "Debe seleccionar un valor en Tipo de Ajuste. ";

            if ($scope.ajuste.motivoAjuste_ids == null)
                error += "Debe seleccionar un valor en Motivo. ";

            if ($scope.obtenerTotal() <= 0 && !($scope.ajuste.tipoAjuste_ids == 1 && $scope.ajuste.anulacionDeFactura==true))
                error += "El monto total debe ser superior a $0";

            return { message: error, isValid: error === "" };
        };

        var obtenerArticulo = function(articuloId) {

            for (var i = 0; i < $scope.articulos.length; i++) {
                if ($scope.articulos[i].id == articuloId)
                    return $scope.articulos[i];
            }

            return null;
        };

        $scope.tieneError = function() {

            var validacion = validarAjuste();

            $scope.mensajeError = validacion.message;

            return !validacion.isValid;
        };

        $scope.cancelar = function () {
            window.location.href = "/Clientes/HistorialMovimientos/" + $scope.factura.cliente_id + "?tab=facturas";
        };
        
        $scope.agregarNuevoConcepto=function() {
            $scope.conceptosNuevos.push({});

            RunTimer(function() {
                RePrepareView($("#div_nuevoAjusteFacturacionController"));
            }, 300);
        }

        $scope.quitarNuevoConcepto = function (index) {
            utiles.quitarItem($scope.conceptosNuevos, index);
        }

        $scope.init();
    }]);