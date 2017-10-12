/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

mainApp.controller('nuevaTransaccionTemporalCtrl', ['$scope', '$http', '$rootScope',
      function ($scope, $http, $rootScope) {

          $scope.mostrarContenido = true;
          $scope.facturarVenta = false;
          $scope.ventaActual = {
              venta : null,
              clienteActual: null,
              saldosCliente:null,

              articulosVendidos: [],          
              cobrosFacturas: [],
              cobrosConsumos: [],
              envases: [],
              devoluciones: [],
              cobroConsumos: 0,
              deContado: false,
              
              nroRecibo:'',
              fechaHora:getToday(),
              altitud:'',
              longitud:'',

              ausente: false,
              sinGestiones:false,
              hojaDeRutaId: 0,

              formaDePago:null
          };

          $scope.articulos = {
              articulosAbonos: [],
              articulosComodatos: [],
              articulosLista: [],
              articulosTodos: [],
              
              articulosListaEntregados: [],
          };

          $scope.hojaDeRuta = null;
          $scope.posicionActual = null;

          //From venta existente
          var _articulosEntregados;
          var _cobrosFacturas;
          var _devoluciones;
          var _envases;
          var _cobrosConsumos;
          var _comprobantesFisicos;

          $scope.listas = {
              devoluciones_motivos: [],
              formasDePago:[],
              envases_tiposDeEventos: [{ texto: "Préstamo", id: 1 }, { texto: "Devolución", id: 2 }, { texto: 'Relevamiento', id: 3 }],              
          };

          $scope.$watch('ventaActual.deContado', function () {

              if ($scope.ventaActual.deContado)
                  $scope.ventaActual.cobroConsumos = $scope.ventaActual.saldosCliente.saldoCuentaConsumo +
                      $scope.obtenerTotalVentaActual();


          });
          
          $scope.init = function () {

              //Verificar si es una edición de una venta existente
              var ventaId = getParameterByName("ventaId");
              if (ventaId != null && ventaId != "")
              {
                  $scope.cargarVentaExistente(ventaId);  //Es una venta para editar
              }
              else
              {
                  var clienteId = getParameterByName("clienteId");
                  var hojaDeRutaId = getParameterByName("hojaDeRutaId");
                  $scope.hojaDeRutaId = hojaDeRutaId;

                  $scope.cargarDatosDelCliente(clienteId, hojaDeRutaId);
                  obtenerEnvasesPendientes(clienteId);
              }
              
          };
          
          $scope.cargarVentaExistente = function (ventaId) {

              GLOBAL_FUNCTIONS.runTimer(ShowLoader, 200);
              
              //Obtener venta actual
              $http.get(GetUrlForService('/TransaccionesTemporales/ObtenerVentaTemporal'), {
                  params: {
                      venta_id: ventaId
                  }
              }).
                success(function (data, status, headers, config)
                {
                    if (data.error == 0) {

                        _articulosEntregados = data.venta.ArticulosEntregados;
                        _cobrosFacturas = data.venta.CobrosFacturas;
                        _devoluciones = data.venta.Devoluciones;
                        _envases = data.venta.Envases;
                        _cobrosConsumos = data.venta.CobrosConsumos;
                        _comprobantesFisicos = data.venta.ComprobantesFisicos;

                        $scope.ventaActual.cobroConsumos = data.venta.montoCobroConsumos;
                        $scope.ventaActual.venta = data.venta;
                        $scope.ventaActual.nroRecibo = data.venta.nroReciboCobroConsumos;
                        $scope.ventaActual.montoCobroACuenta = data.venta.montoCobroACuenta;

                        asignarComprobantesFisicos();

                        $scope.cargarDatosDelCliente(data.cliente.cliente_id, data.venta.hojaDeRuta_id);
                        obtenerEnvasesPendientes(data.cliente.cliente_id);

                    } else {
                        HideLoader();
                    }

                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
              
          };

          $scope.cargarDatosDelCliente = function (clienteId, hojaDeRutaId) {

              $scope.ventaActual.hojaDeRutaId = hojaDeRutaId;

              GLOBAL_FUNCTIONS.runTimer(ShowLoader, 200);

              //Obtener datos del cliente actual
              $http.get(GetUrlForService('/TransaccionesTemporales/ObtenerVentaPorClienteHojaDeRuta'), {
                  params: {
                      cliente_id: clienteId,
                      hojaDeRutaId: hojaDeRutaId
                  }
              }).
                success(function (data, status, headers, config) {
                    
                    if (data.error == 0) {

                        $scope.ventaActual.clienteActual = data.data.cliente;
                        $scope.ventaActual.saldosCliente = data.data.saldos;
                        $scope.facturasPendientes = data.data.facturas;

                        $scope.articulos.articulosAbonos = data.data.abonos;
                        $scope.articulos.articulosComodatos = data.data.comodatos;
                        $scope.articulos.articulosLista = data.data.articulosListaDisponibles;
                        $scope.articulos.articulosTodos = data.data.articulosListaTodos;
                        
                        $scope.listas.devoluciones_motivos = data.data.motivosDevolucion;
                        $scope.listas.formasDePago = data.data.formasDePago;

                        $scope.listas.motivosDeSolicitud = data.data.motivosDeSolicitud;
                        $scope.listas.motivosDeSolicitud.insert(0, { valor_ids: 0, valorTexto: "--Solicitud de Stock--" });
                        
                        //Facturas
                        $.each($scope.facturasPendientes, function (index, item) {
                            item.montoCobrado = item.saldoPendiente;
                            item.formaDePago = $scope.listas.formasDePago[0];
                            item.cobrosFacturas = [{}];
                        });


                        //Venta existente
                        if (data.venta != null) {

                            if (data.venta.liquidada) {

                                $scope.mostrarContenido = false;
                                ShowMessageBox(messageType_Error, "Error", "No es posible acceder a una venta ya liquidada");
                                return;
                            }

                            $scope.ventaActual.venta = data.venta;
                            $scope.ventaActual.cheque_id = data.venta.cheque_id;
                            $scope.ventaActual.deposito_id = data.venta.deposito_id;

                            _articulosEntregados = data.venta.ArticulosEntregados;
                            _cobrosFacturas = data.venta.CobrosFacturas;
                            _devoluciones = data.venta.Devoluciones;
                            _envases = data.venta.Envases;
                            _cobrosConsumos = data.venta.CobrosConsumos;
                            _comprobantesFisicos = data.venta.ComprobantesFisicos;

                            $scope.ventaActual.cobroConsumos = data.venta.montoCobroConsumos;
                            $scope.ventaActual.venta = data.venta;
                            $scope.ventaActual.nroRecibo = data.venta.nroReciboCobroConsumos;
                          
                            $scope.asignarOperacionesDeVentaExistente();

                            GLOBAL_FUNCTIONS.runTimer(function () {

                                $(".collapse-button").trigger("click");

                                SetChosenSelect();

                            }, 100);

                        }

                        //Hoja de ruta
                        $scope.hojaDeRuta = data.datosHojaDeRuta.hojaDeRuta;

                        HideLoader();
                        
                        GLOBAL_FUNCTIONS.runTimer(setNumericControl, 200);

                    } else {
                        HideLoader();
                    }

                }).error(function (data, status, headers, config) {
                    GLOBAL_FUNCTIONS.hideLoadingScreen();
                });
          };

          $scope.asignarOperacionesDeVentaExistente = function () {
              
              //Articulos
              for (var i = 0; i < _articulosEntregados.length; i++) {
                  
                  var agregado = false;
                  var articuloEntregado = _articulosEntregados[i];

                  //De Abonos
                  $.each($scope.articulos.articulosAbonos, function (j, artAbono) {

                      if (articuloEntregado.articulo_id == artAbono.articulo_id && (articuloEntregado.abono_id==null || articuloEntregado.abono_id == artAbono.abono_id)) {
                          artAbono.cantidadEntregada = articuloEntregado.cantidad;
                          agregado = true;
                      }

                  });

                  if (agregado)
                      continue;

                  //De Comodatos
                  $.each($scope.articulos.articulosComodatos, function (j, artComodato) {

                      if (articuloEntregado.articulo_id == artComodato.articulo_id) {
                          artComodato.cantidadEntregada = articuloEntregado.cantidad;
                          agregado = true;
                      }
                  });
                  
                  if (agregado)
                      continue;

                  //De Lista
                  var art = operaciones.obtenerArticulo($scope.articulos.articulosLista, articuloEntregado.articulo_id);
                  $scope.articulos.articulosListaEntregados.push(
                      {
                          articulo: art,
                          cantidadEntregada: articuloEntregado.cantidad
                      });
              }

              //Cobros consumos
              $scope.ventaActual.cobrosConsumos = _cobrosConsumos;

              //Facturas
              for (var j = 0; j < $scope.facturasPendientes.length; j++) {
                  var factura = $scope.facturasPendientes[j];
                  factura.cobrosFacturas = [];
                  for (var k = 0; k < $scope.ventaActual.venta.CobrosFacturas.length ; k++) {
                      var cobroFactura = $scope.ventaActual.venta.CobrosFacturas[k];
                      if (cobroFactura.factura_id == factura.id) {

                          cobroFactura.montoCobrado = cobroFactura.monto;
                          factura.pagar = true;
                          cobroFactura.formaPagoId = cobroFactura.formaDePago_ids;

                          factura.cobrosFacturas.push(cobroFactura);
                      }
                  }

                  if (factura.cobrosFacturas.length == 0)
                      factura.cobrosFacturas.push({});
              }
              
              //Envases
              for (var i = 0; i < _envases.length; i++) {

                  var envase = _envases[i];

                  var _articulo = operaciones.obtenerArticulo($scope.articulos.articulosTodos, envase.articulo_id);

                  var env = {
                      articulo: _articulo,
                      cantidad: envase.cantidad,
                  };

                  if (envase.tipoEvento_ids == 1)
                      env.evento = $scope.listas.envases_tiposDeEventos[0];
                  else if (envase.tipoEvento_ids == 2)
                      env.evento = $scope.listas.envases_tiposDeEventos[1];
                  else if (envase.tipoEvento_ids == 3)
                      env.evento = $scope.listas.envases_tiposDeEventos[2];

                  env.motivoSolicitudDeStock_ids = envase.motivoSolicitudDeStock_ids == null ? 0 : envase.motivoSolicitudDeStock_ids;

                  $scope.ventaActual.envases.push(env);
              }
              
              //Devoluciones
              for (var i = 0; i < _devoluciones.length; i++) {

                  var devolucion = _devoluciones[i];

                  var _articulo = operaciones.obtenerArticulo($scope.articulos.articulosTodos, devolucion.articulo_id);
                  var _motivo = operaciones.obtenerMotivoDevolucion($scope.listas.devoluciones_motivos, devolucion.motivoDevolucion_ids);

                  $scope.ventaActual.devoluciones.push(
                      {
                          articulo: _articulo,
                          cantidad: devolucion.cantidad,
                          motivo: _motivo,
                          esCambioDirecto: devolucion.esCambioDirecto,
                          
                      }
                  );
              }

              //Comrpobantes  fisicos
              asignarComprobantesFisicos();
          };

          $scope.clienteAnterior = function () {

              var cliente = null;
              try {
                  cliente = $scope.hojaDeRuta.Clientes[$scope.posicionActual - 1];
              } catch(e) {} 

              if(cliente!=null)
                  window.location.href = "/TransaccionesTemporales/Create?clienteId=" + cliente.cliente_id + "&hojaDeRutaId=" + $scope.hojaDeRuta.id;

          };

          $scope.clientePosterior = function () {

              var cliente = null;
              try {
                  cliente = $scope.hojaDeRuta.Clientes[$scope.posicionActual + 1];
              } catch (e) { }

              if (cliente != null)
                  window.location.href = "/TransaccionesTemporales/Create?clienteId=" + cliente.cliente_id + "&hojaDeRutaId=" + $scope.hojaDeRuta.id;

          };

          $scope.isNumber = function(_value) {

              return _value * 1 == _value;
          };

          var obtenerEnvasesPendientes = function(clienteId) {

              $http.get(GetUrlForService('/Envases/ObtenerPrestamosPendientes'), {
                  params: {
                      clienteId: clienteId
                  }
              }).then(function(resp) {

                  if (resp.data.error == 0) {

                      $scope.envasesPendientes = resp.data.prestamos;
                      $scope.envasesDelCliente = resp.data.envasesDelCliente;
                  }

              });

          };

          var asignarComprobantesFisicos = function () {

              if (_comprobantesFisicos == null)
                  return;

              var comprobanteRemito = _comprobantesFisicos.filter(function (x) { return x.tipoDeComprobanteFisico_ids == 1 });
              var comprobanteRecibo = _comprobantesFisicos.filter(function (x) { return x.tipoDeComprobanteFisico_ids == 2 });

              if (comprobanteRemito.length > 0) {
                  $scope.ventaActual.remitoPrefijo = comprobanteRemito[0].nroPrefijo;
                  $scope.ventaActual.remitoNumero = comprobanteRemito[0].nroComprobante;
              }
              
              if (comprobanteRecibo.length > 0) {
                  $scope.ventaActual.reciboPrefijo = comprobanteRecibo[0].nroPrefijo;
                  $scope.ventaActual.reciboNumero = comprobanteRecibo[0].nroComprobante;
              }

          };

          //== Confirmaciones ===================================================================================

          $scope.confirmar = function (ausente, sinGestiones) {

              $scope.ventaActual.ausente = ausente;
              $scope.ventaActual.sinGestiones = sinGestiones;

              if ($scope.ventaActual.ausente)
                  $scope.registrarAusente();
              else if ($scope.ventaActual.sinGestiones)
                  $scope.registrarSinGestiones();
              else
                  $scope.registrarOperaciones();
          };

          $scope.registrarOperaciones = function () {

              try {

                  var validacion = $scope.validarDatos();
                  if (!validacion.isValid) {
                      ShowMessageBox(messageType_Error, "Error", validacion.message);
                      return;
                  }

                  ShowLoader();

                  //Artículos entregados
                  var articulosEntregados = [];
                  $.each($scope.articulos.articulosAbonos, function(index, item) {

                      if (item.cantidadEntregada > 0) {
                          articulosEntregados.push(
                              operaciones.newArticulosXVentasEntregas(item.articulo_id, item.cantidadEntregada, 0, item.abono_id)
                          );
                      }

                  });
                  $.each($scope.articulos.articulosComodatos, function(index, item) {

                      if (item.cantidadEntregada > 0) {
                          articulosEntregados.push(
                              operaciones.newArticulosXVentasEntregas(item.articulo_id, item.cantidadEntregada, item.precio)
                          );
                      }
                  });
                  $.each($scope.articulos.articulosListaEntregados, function(index, item) {

                      if (item.cantidadEntregada) {
                          articulosEntregados.push(
                              operaciones.newArticulosXVentasEntregas(item.articulo.id, item.cantidadEntregada, item.articulo.precioMaximo)
                          );
                      }
                  });

                  //Cobros consumos
                  var cobrosConsumos = [];
                  $.each($scope.ventaActual.cobrosConsumos, function(index, item) {
                      cobrosConsumos.push(operaciones.newCobroConsumos(item.monto,
                          item.formaDePago_ids, item.cheque_id, item.deposito_id));
                  });

                  //Cobros facturas
                  var cobrosFacturas = [];
                  $.each($scope.facturasPendientes, function(index, item) {

                      for (var i = 0; i < item.cobrosFacturas.length; i++) {

                          var cobroFactura = item.cobrosFacturas[i];

                          if (item.pagar && cobroFactura.montoCobrado >= 0) {
                              cobrosFacturas.push(
                                  operaciones.newCobrosFacturas(item.id, utiles.getNumber(cobroFactura.montoCobrado), $scope.ventaActual.nroRecibo,
                                      cobroFactura.formaPagoId, cobroFactura.cheque_id, cobroFactura.deposito_id, cobroFactura)
                              );
                          }

                      }

                  });

                  //Envases
                  var envases = [];
                  $.each($scope.ventaActual.envases, function(index, item) {

                      if (item.articulo != null && item.cantidad > 0) {
                          envases.push(
                              operaciones.newEnvases(item.articulo.id, item.cantidad, item.evento.id, item.motivoSolicitudDeStock_ids)
                          );
                      }

                  });

                  //Devoluciones
                  var devoluciones = [];
                  $.each($scope.ventaActual.devoluciones, function(index, item) {

                      if (item.articulo != null && item.cantidad > 0) {
                          devoluciones.push(
                              operaciones.newDevoluciones(item.articulo.id, item.cantidad, item.motivo.valor_ids, item.esCambioDirecto, false)
                          );
                      }
                  });

                  //Validar si hay alguna operación
                  if (articulosEntregados.length == 0 &&
                      cobrosFacturas.length == 0 &&
                      envases.length == 0 &&
                      devoluciones.length == 0 &&
                      cobrosConsumos.length == 0) {

                      throw ({
                          mensajeError:
                          "Debe agregar alguna operación válida. En caso de no haber operaciones, debe seleccionar las opciones correctas"
                      });
                  }

                  //Comprobantes físicos
                  var comprobantesFisicos = operaciones.newComprobantesFisicos(
                        $scope.ventaActual.remitoPrefijo,
                        $scope.ventaActual.remitoNumero,
                        $scope.ventaActual.reciboPrefijo,
                        $scope.ventaActual.reciboNumero);

                  var venta = operaciones.newVenta(
                      $scope.ventaActual.venta,
                      $scope.facturarVenta,
                      $scope.ventaActual.clienteActual.cliente_id,
                      $scope.ventaActual.hojaDeRutaId, false, $scope.ventaActual.nroRecibo,
                      $scope.ventaActual.fechaHora, $scope.ventaActual.altitud, $scope.ventaActual.longitud,
                      articulosEntregados, cobrosFacturas, devoluciones, envases, cobrosConsumos, comprobantesFisicos);
                  
                  //Llamada al controller
                  $http.post(GetUrlForService('/TransaccionesTemporales/RegistrarVentaTemporal'),
                      {
                          venta: venta
                      }).
                      success(function(data, status, headers, config) {

                          HideLoader();

                          if (data.error == 0) {

                              ShowMessageBox(messageType_Success, "Exitoso", data.message);
                              window.location.reload();
                          } else {
                              ShowMessageBox(messageType_Error, "Error", data.message);
                          }

                      }).error(function(data, status, headers, config) {
                          HideLoader();
                          ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar la transacción");
                      });

              } catch (e) {

                  HideLoader();
                  ShowMessageBox(messageType_Error, "Error", e.mensajeError);

              }
          };

          $scope.registrarAusente = function() {

              ShowLoader();
              
              try {
                  
                  //Llamada al controller
                  $http.post(GetUrlForService('/TransaccionesTemporales/RegistrarAusente'),
                         {
                             cliente_id: $scope.ventaActual.clienteActual.cliente_id,
                             hojaDeRutaId: $scope.ventaActual.hojaDeRutaId,
                             latitud: '',
                             longitud: ''
                             
                         }).
                         success(function (data, status, headers, config) {

                             HideLoader();

                             if (data.error == 0) {

                                 ShowMessageBox(messageType_Success, "Exitoso", "Se ha registrado la ausencia.");
                                 window.location.reload();
                             } else {
                                 ShowMessageBox(messageType_Error, "Error", data.message);
                             }
                             
                         }).error(function (data, status, headers, config) {
                             HideLoader();
                             ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar la transacción");
                         });

              } catch (e) {

                  HideLoader();
                  ShowMessageBox(messageType_Error, "Error", "Verificar los datos ingresados");

              }
          };

          $scope.registrarSinGestiones = function () {
              
              ShowLoader();

              try {

                  //Llamada al controller
                  $http.post(GetUrlForService('/TransaccionesTemporales/RegistrarNoGestion'),
                    {
                        cliente_id: $scope.ventaActual.clienteActual.cliente_id,
                        hojaDeRutaId: $scope.ventaActual.hojaDeRutaId,
                        latitud: '',
                        longitud: ''
                    }).
                    success(function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Exitoso", "Se ha registrado la ausencia.");
                            window.location.reload();
                        } else {
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }
                             
                    }).error(function (data, status, headers, config) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar la transacción");
                    });

              } catch (e) {

                  HideLoader();
                  ShowMessageBox(messageType_Error, "Error", "Verificar los datos ingresados");

              }
          };

          $scope.preguntarFacturarVenta= function() {
              
              bootbox.confirm("Confirma facturar esta venta?\n Recuerde que no se podrán realizar cambios luego de confirmar",
                function (result) {
                  if (result) {
                      $scope.confirmar(false, false);
                  }
              });

          }

          $scope.validarDatos = function() {

              var _message = "";

              if ($scope.ventaActual.clienteActual.facturacionAutomatica
                 && ($scope.ventaActual.nroRecibo == null || $scope.ventaActual.nroRecibo == "")) {
                  $scope.ventaActual.nroRecibo = "000";
              }

              if (!isNumeric($scope.ventaActual.cobroConsumos)) {
                  _message += "El monto cobrado no es un valor válido. ";
              }

              for (var i = 0; i < $scope.ventaActual.cobrosConsumos.length; i++) {
                  var item = $scope.ventaActual.cobrosConsumos[i];
                  if (item.monto == null || item.monto * 1 == 0) {
                      _message = "Cobros consumos: Todos los cobros consumos deben tener un valor en el monto. ";
                      break;
                  }

                  if ((item.formaDePago_ids == 2 && item.cheque_id == null) ||
                      (item.formaDePago_ids == 3 && item.deposito_id == null)) {
                      _message = "Cobros consumos: Todos los medios de pagos diferentes de EFECTIVO deben tener seleccionado el elemento correspondiente. ";
                      break;
                  }
              }

              return { message: _message, isValid: _message == "" };
          };

          //== Sección ventas ===================================================================================

          $scope.agregarNuevoArticuloDeLista = function () {

              $scope.articulos.articulosListaEntregados.push({
                  articulo: null,
                  cantidadEntregada: 0,
              });
              
              GLOBAL_FUNCTIONS.runTimer(function () {
                  setNumericControl();
                  SetChosenSelect();
              }, 200);

          };

          $scope.eliminarArticuloLista = function (index) {

              $scope.articulos.articulosListaEntregados.splice(index, 1);
          };

          $scope.obtenerSubtotalArticuloAbono = function (artAbono) {

              if (artAbono.cantidadEntregada > artAbono.disponibles) {

                  if (artAbono.disponibles >= 0) {
                      return (artAbono.cantidadEntregada - artAbono.disponibles) * artAbono.precioExcendente;
                  } else {
                      return artAbono.cantidadEntregada * artAbono.precioExcendente;
                  }

                  
              }

              return 0;
          };

          $scope.obtenerSubtotalArticuloComodato = function (artComodato) {

              if (artComodato.cantidadEntregada == null || artComodato.cantidadEntregada == 0)
                  return 0;

              return artComodato.cantidadEntregada * artComodato.precio;
          };

          $scope.obtenerSubtotalArticuloLista = function (artLista) {

              if (artLista.articulo == null)
                  return 0;

              return (artLista.cantidadEntregada * artLista.articulo.precioMaximo);
          };

          $scope.obtenerTotalVentaActual = function() {
              
              var total = 0;
              
              $.each($scope.articulos.articulosAbonos, function(index, item) {
                  total += $scope.obtenerSubtotalArticuloAbono(item);
              });
              
              $.each($scope.articulos.articulosComodatos, function (index, item) {
                  total += $scope.obtenerSubtotalArticuloComodato(item);
              });
              
              $.each($scope.articulos.articulosListaEntregados, function (index, item) {
                  total += $scope.obtenerSubtotalArticuloLista(item);
              });

              if ($scope.ventaActual.deContado)
                  $scope.ventaActual.cobroConsumos = $scope.ventaActual.saldosCliente.saldoCuentaConsumo + total;


              return total;

          };

          $scope.seleccionarFormaDePagoVenta = function() {

              if ($scope.ventaActual.formaDePago.valor_ids == 2) { //CHEQUES
                  $rootScope.$broadcast('onOpenSeleccionarCheques',
                      {
                          cobroFactura: null,
                          cliente: $scope.ventaActual.clienteActual
                      });
              } else if ($scope.ventaActual.formaDePago.valor_ids == 3) { //CHEQUES
                  $rootScope.$broadcast('onOpenSeleccionarDepositos',
                      {
                          cobroFactura: null,
                          cliente: $scope.ventaActual.clienteActual
                      });
              }
          };

          //=== Sección cobros consumos ==========================================================================

          $scope.agregarCobroConsumos = function () {

              var cobro = { formaDePago_ids: 1 };
              if ($scope.ventaActual.cobrosConsumos.length == 0) {
                  cobro.monto = $scope.obtenerSaldoCuentaConsumos();
              }

              $scope.ventaActual.cobrosConsumos.push(cobro);

              GLOBAL_FUNCTIONS.runTimer(function () {
                  setNumericControl();
                  SetChosenSelect();
              }, 200);
          };

          $scope.eliminarCobroConsumos = function (index, cobroConsumos) {

              $scope.ventaActual.cobrosConsumos.splice(index, 1);
          };

          $scope.seleccionarMedioDeCobroConsumos = function(cobroConsumos) {

              if (cobroConsumos.formaDePago_ids == 2) { //CHEQUES
                  $rootScope.$broadcast('onOpenSeleccionarCheques',
                  {
                      cobroConsumos: cobroConsumos,
                      cliente: $scope.ventaActual.clienteActual
                  });
              } else if (cobroConsumos.formaDePago_ids == 3) { //CHEQUES
                  $rootScope.$broadcast('onOpenSeleccionarDepositos',
                  {
                      cobroConsumos: cobroConsumos,
                      cliente: $scope.ventaActual.clienteActual
                  });
              }
          };

          $scope.obtenerDatosDelMedioDePagoDelCobroConsumos = function (cobroConsumos) {

              if (cobroConsumos.formaDePago_ids == 2 && cobroConsumos.cheque_id>0) //Cheque
                  return "CHE-" + cobroConsumos.cheque_id;
              else if (cobroConsumos.formaDePago_ids == 3 && cobroConsumos.deposito_id) //Desposito
                  return "DEP-" + cobroConsumos.deposito_id;

              return "";
          };

          $scope.obtenerTotalCobradoConsumos = function() {

              var totalCobrado = 0;

              if ($scope.ventaActual.cobrosConsumos!=null)
                  $scope.ventaActual.cobrosConsumos.map(function(item) {
                      totalCobrado += item.monto==null? 0 : (item.monto * 1);
                  });

              return totalCobrado;
          };

          $scope.obtenerSaldoCuentaConsumos = function() {

              try {
                  return $scope.ventaActual.saldosCliente.saldoCuentaConsumo + $scope.obtenerTotalVentaActual() - $scope.obtenerTotalCobradoConsumos();
              } catch (e) {
                  return "---";
              } 
          };

          $scope.obtenerTextoCobrosConsumos = function () {

              var texto = "";

              if ($scope.ventaActual.cobrosConsumos != null && $scope.ventaActual.cobrosConsumos.length > 0) {
                  texto = $scope.ventaActual.cobrosConsumos.length + " items";
              }

              return texto;

          };
          
          //=== Sección Facturas =================================================================================

          $scope.obtenerTotalCobradoFacturas = function () {

              if ($scope.facturasPendientes == null)
                  return 0;

              var total = 0;

              $.each($scope.facturasPendientes, function (index, item) {

                  if (item.pagar) {
                      total += $scope.obtenerCobradoFactura(item);
                  }
              });

              return total;
          };

          $scope.obtenerCobradoFactura = function(factura) {

              if (factura.cobrosFacturas == null)
                  return 0;

              var totalCobro = 0;

              for (var i = 0; i < factura.cobrosFacturas.length; i++) {

                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].montoCobrado);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionIVA);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionIngresosBrutos);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionSUSS);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionGanancias);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionComInd);
                  totalCobro += utiles.getNumber(factura.cobrosFacturas[i].retencionOtras);
              }

              return totalCobro;
          };

          $scope.agregarCobroFactura = function(factura) {

              factura.cobrosFacturas.push({});
          };

          $scope.quitarCobroFactura = function(factura, index) {

              factura.cobrosFacturas.splice(index, 1);
          };

          $scope.seleccionarFormaDePago = function(cobroFactura) {

              if (cobroFactura.formaPagoId == 2) { //CHEQUES
                  $rootScope.$broadcast('onOpenSeleccionarCheques',
                      {
                          cobroFactura: cobroFactura,
                          cliente: $scope.ventaActual.clienteActual
                      });
              } else if (cobroFactura.formaPagoId == 3) { //CHEQUES
                      $rootScope.$broadcast('onOpenSeleccionarDepositos',
                          {
                              cobroFactura: cobroFactura,
                              cliente: $scope.ventaActual.clienteActual
                          });
             }
          };

          $scope.$on('onChequeSelected', function (event, data) {

              if (data.data.cobroFactura != null)
                  data.data.cobroFactura.cheque_id = data.cheque.id;
              if (data.data.cobroConsumos != null)
                  data.data.cobroConsumos.cheque_id = data.cheque.id;
              else {
                  
                  //En el caso que sea un cobro a cuenta
                  $scope.ventaActual.cheque_id = data.cheque.id;
              }
          });

          $scope.$on('onDepositoSelected', function (event, data) {
              if (data.data.cobroFactura != null) {
                  data.data.cobroFactura.deposito_id = data.deposito.id;
              }
              if (data.data.cobroConsumos != null) {
                  data.data.cobroConsumos.deposito_id = data.deposito.id;
              }
              else {
                  //En el caso que sea un cobro a cuenta
                  $scope.ventaActual.deposito_id = data.deposito.id;
              }
          });

          //=== Sección Envases ===================================================================================

          $scope.agregarEnvase = function () {

              $scope.ventaActual.envases.push({ cantidad: 1, articulo: null, motivoSolicitudDeStock_ids:0 });
              
              GLOBAL_FUNCTIONS.runTimer(function () {
                  setNumericControl();
                  SetChosenSelect();
              }, 200);
          };
          
          $scope.eliminarEnvase = function (index) {

              $scope.ventaActual.envases.splice(index, 1);
          };
          
          //=== Sección Devoluciones ===================================================================================
          
          $scope.agregarDevolucion = function () {

              $scope.ventaActual.devoluciones.push({ cantidad: 1, articulo: null });

              GLOBAL_FUNCTIONS.runTimer(function () {
                  setNumericControl();
                  SetChosenSelect();
              }, 200);
          };

          $scope.eliminarDevolucion = function (index) {

              $scope.ventaActual.devoluciones.splice(index, 1);
          };

          //=== Textos etiquetas ======================================================================================

          $scope.obtenerTextoVentas = function() {

              var texto = "";

              var cantArtAbonos = 0;
              for (var i = 0; i < $scope.articulos.articulosAbonos.length; i++) {
                  var art = $scope.articulos.articulosAbonos[i];
                  if (art.cantidadEntregada > 0)
                      cantArtAbonos++;
              }
              
              var cantArtComod = 0;
              for (var i = 0; i < $scope.articulos.articulosComodatos.length; i++) {
                  var art = $scope.articulos.articulosComodatos[i];
                  if (art.cantidadEntregada > 0)
                      cantArtComod++;
              }

              var cantArtLista = 0;
              for (var i = 0; i < $scope.articulos.articulosListaEntregados.length; i++) {
                  var art = $scope.articulos.articulosListaEntregados[i];
                  if (art.cantidadEntregada > 0)
                      cantArtLista++;
              }

              var totalArtEntre = (cantArtAbonos + cantArtComod + cantArtLista);

              if (totalArtEntre > 0) {
                  texto += totalArtEntre + " articulos entregados. ";
              }

              if ($scope.ventaActual.cobroConsumos != null && $scope.ventaActual.cobroConsumos != 0) {
                  texto += "$" + $scope.ventaActual.cobroConsumos+" cobro consumos.";
              }

              return texto;
          };
          
          $scope.obtenerTextoFacturas = function () {

              var texto = "";

              var totalCobrado = $scope.obtenerTotalCobradoFacturas();

              if (totalCobrado > 0) {
                  texto = "Total cobrado $" + totalCobrado;
              }
              
              return texto;
          };
          
          $scope.obtenerTextoEnvases = function () {
              
              var texto = "";

              if ($scope.ventaActual.envases != null && $scope.ventaActual.envases.length > 0) {
                  texto = $scope.ventaActual.envases.length + " items";
              }

              return texto;

          };
          
          $scope.obtenerTextoDevoluciones = function () {

              var texto = "";
              
              if ($scope.ventaActual.devoluciones != null && $scope.ventaActual.devoluciones.length > 0) {
                  texto = $scope.ventaActual.devoluciones.length + " items";
              }

              return texto;
          };

          //=== INIT ======================================================================================

          $scope.init();
      }
]);

var operaciones = {
    newVenta: function(_ventaActual, _facturarVenta, _cliente_id, _hojaDeRuta_id, _esAusente,  _nroReciboCobroConsumos,
        _fechaHora, _altitud, _longitud, _ArticulosEntregados, _CobrosFacturas, _Devoluciones, _Envases, _CobrosConsumos,
        _comprobantesFisicos) {

        return {
            id: _ventaActual != null ? _ventaActual.id : 0,
            facturarVenta: _facturarVenta,
            origenDeTransaccion: 1,
            cliente_id: _cliente_id,
            hojaDeRuta_id: _hojaDeRuta_id,
            esAusente: _esAusente,
            nroReciboCobroConsumos: _nroReciboCobroConsumos,
            fechaHora: _fechaHora,
            altitud: _altitud,
            longitud: _longitud,
            ArticulosEntregados: _ArticulosEntregados,
            CobrosFacturas: _CobrosFacturas,
            Devoluciones: _Devoluciones,
            Envases: _Envases,
            CobrosConsumos: _CobrosConsumos,
            ComprobantesFisicos: _comprobantesFisicos
        };
    },
    newArticulosXVentasEntregas: function(_articulo_id, _cantidad, _precio, _abonoId) {

        return {
            articulo_id: _articulo_id,
            cantidad: _cantidad,
            precio: _precio,
            abono_id:_abonoId
        };

    },
    newCobrosFacturas: function (_factura_id, _monto, _nroRecibo, _formaDePagoId, _cheque_id, _deposito_id, factura) {

        if (_formaDePagoId==null || _formaDePagoId == 0) {
            throw ({
                mensajeError:
                "Debe seleccionar una forma de pago para todos los cobros facturas"
            });
        }

        if (_formaDePagoId == 2 && !(_cheque_id > 0))
            throw ({
                mensajeError:
                 "Debe seleccionar un cheque válido"
            });

        if (_formaDePagoId == 3 && !(_deposito_id > 0))
            throw ({
                mensajeError:
                 "Debe seleccionar un depósito válido"
            });

        if (_formaDePagoId == 2)
            _deposito_id = null;
        else if (_formaDePagoId == 3)
            _cheque_id = null;
        else if (_formaDePagoId == 1) {
            _deposito_id = null;
            _cheque_id = null;
        }

        return {
            factura_id: _factura_id,
            monto: _monto,
            nroRecibo: _nroRecibo,
            formaDePago_ids: _formaDePagoId,
            formaDePago: _formaDePagoId,
            cheque_id: _cheque_id,
            deposito_id: _deposito_id,
            retencionIVA: factura.retencionIVA,
            retencionIngresosBrutos: factura.retencionIngresosBrutos,
            retencionSUSS: factura.retencionSUSS,
            retencionGanancias: factura.retencionGanancias,
            retencionComInd: factura.retencionComInd,
            retencionOtras: factura.retencionOtras,
        };
    },
    newDevoluciones: function(_articulo_id, _cantidad, _motivoDevolucion_ids, _esCambioDirecto, _esReutilizable) {

        return {
            articulo_id: _articulo_id,
            cantidad: _cantidad,
            motivoDevolucion_ids: _motivoDevolucion_ids,
            esCambioDirecto: _esCambioDirecto,
            esReutilizable: _esReutilizable,
        };
    },
    newEnvases: function (_articulo_id, _cantidad, _tipoEvento_ids, motivoSolicitudDeStock_ids) {

        return {
            articulo_id: _articulo_id,
            cantidad: _cantidad,
            tipoEvento_ids: _tipoEvento_ids,
            motivoSolicitudDeStock_ids: motivoSolicitudDeStock_ids == 0 ? null : motivoSolicitudDeStock_ids
        };
    },
    obtenerArticulo: function (articulos, articulo_id) {
        
        var r = null;

        $.each(articulos, function (index, art) {

            if (art.id == articulo_id) {
                r = art;
            }

        });

        return r;
    },
    obtenerMotivoDevolucion: function (motivos, motivo_ids) {
        
        var r = null;

        $.each(motivos, function (index, mot) {

            if (mot.valor_ids == motivo_ids)
                r = mot;
        });

        return r;

    },
    obtenerFormaDePago: function (formasDePagos, formaDePago_id) {
        
        var r = null;

        $.each(formasDePagos, function (index, formaDePago) {

            if (formaDePago.valor_ids == formaDePago_id) {
                r = formaDePago;
            }
        });

        return r;
    },
    newCobroConsumos: function (_monto, formaId, _cheque_id, _deposito_id) {
        if (formaId == null || formaId == 0) {
            throw ({
                mensajeError:
                "Debe seleccionar una forma de pago para todos los cobros"
            });
        }

        if (formaId == 2)
            _deposito_id = null;
        else if (formaId == 3)
            _cheque_id = null;
        else if (formaId == 1) {
            _deposito_id = null;
            _cheque_id = null;
        }

        return {
            monto: _monto,
            formaDePago_ids: formaId,
            cheque_id: _cheque_id,
            deposito_id: _deposito_id
        }
    },
    newComprobantesFisicos: function (prefijoRemito, nroRemito, prefijoRecibo, nroRecibo) {

        var comprobantes = [];

        if (prefijoRemito != null && prefijoRemito != "" && nroRemito != null && nroRemito != "") {
            comprobantes.push({
                tipoDeComprobanteFisico_ids : 1,
                nroPrefijo: prefijoRemito,
                nroComprobante : nroRemito
            });
        }

        if (prefijoRecibo != null && prefijoRecibo != "" && nroRecibo != null && nroRecibo != "") {
            comprobantes.push({
                tipoDeComprobanteFisico_ids: 2,
                nroPrefijo: prefijoRecibo,
                nroComprobante: nroRecibo
            });
        }

        return comprobantes;
    }
};

