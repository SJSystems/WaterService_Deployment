/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('crearSoporteTecnico', ['$scope', '$http', '$rootScope', '$uibModal','dispensersService', 'servicioTecnicoService',
    function ($scope, $http, $rootScope, $uibModal, dispensersService, servicioTecnicoService) {

        $scope.servicioTecnico = {};
        $scope.tituloPantalla = "Nuevo servicio técnico (Orden de trabajo)";
        $scope.servicioTecnico.clienteSeleccionado = null;
        $scope.dispensersAsociadosDeFabrica = [];
        $scope.dispensersAsociadosDeCliente = [];
        $scope.esPlanificado = false;
        $scope.mantenimientosVisible = false;
        $scope.noEditar = false;
        
        var init = function () {

            $scope.esEdicion = false;

            ShowLoader();

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForCreate'), {})
                .then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        $scope.sintomas = resp.data.sintomas;
                        $scope.prioridades = resp.data.prioridades;
                        $scope.motivosDeAsignacion = resp.data.motivosDeAsignacion;
                        $scope.franjasHorarias = resp.data.franjasHorarias;
                    }

                }, function(resp) { HideLoader(); });

            obtenerServicioTecnicoActual();

            RunTimer(function () {

            }, 300);
        };

        var obtenerServicioTecnicoActual = function() {

            var servicioTecnicoId = getParameterByName("id") * 1;

            if (servicioTecnicoId == 0)
                return;

            $scope.tituloPantalla = "Editar servicio técnico (Orden de trabajo)";

            $scope.esEdicion = true;

            $scope.servicioTecnicoId = servicioTecnicoId;

            $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerServicioTecnico'),
            {
                params: {
                    servicioTecnicoId: $scope.servicioTecnicoId
                }
            }).then(function(resp) {
                HideLoader();
                if (resp.data.error == 0) {

                    $scope.servicioTecnico = resp.data.servicioTecnico;
                    $scope.dispensersAsociados = resp.data.dispensersAsociados;

                    $scope.noEditar = $scope.servicioTecnico.estadoServicioTecnico_ids == 3 || $scope.servicioTecnico.estadoServicioTecnico_ids == 4;

                    for (var i = 0; i < $scope.dispensersAsociados.length; i++) {
                        
                        if ($scope.dispensersAsociados[i].mantenimientoAsociado) {
                            $scope.dispensersAsociados[i].mantenimientoAsociado.mostrar = false;
                        }

                        if ($scope.dispensersAsociados[i].deCliente) {
                            $scope.dispensersAsociadosDeCliente.push($scope.dispensersAsociados[i]);
                        } else {
                            $scope.dispensersAsociadosDeFabrica.push($scope.dispensersAsociados[i]);
                        }
                    }

                    $scope.servicioTecnico.clienteSeleccionado = {
                        cliente_id: $scope.servicioTecnico.cliente_id,
                        nombreCliente: $scope.servicioTecnico.nombreCliente,
                        domicilioCompleto: $scope.servicioTecnico.domicilioCompleto
                    };

                    $scope.esPlanificado = $scope.servicioTecnico.reparto_id != null && $scope.servicioTecnico.fechaVisitaPlanificada != null;
                }
            }, function(resp) {
                HideLoader();
            });

        };
        
        var validarServicioTecnico=function() {
            var validacion = { isValid: true, message: ''
        }

            if ($scope.servicioTecnico.clienteSeleccionado == null) {
                validacion.isValid = false;
                validacion.message = "Debe seleccionar un cliente";
                return validacion;
        }

            if (!($scope.servicioTecnico.sintoma_ids > 0)) {
                validacion.isValid = false;
                validacion.message = "Debe seleccionar un síntoma";
                return validacion;
        }

            if (!($scope.servicioTecnico.prioridad_ids > 0)) {
                validacion.isValid = false;
                validacion.message = "Debe seleccionar una prioridad";
                return validacion;
        }

            return validacion;
    }

        $scope.cerrar = function () {
            if (verificarMantenimientosRealizados()) {
                window.location.href = "/ServiciosTecnicos/Cerrar?id=" +$scope.servicioTecnicoId;
            } else {
                ShowMessageBox(messageType_Error, "Error", "Primero debe realizar el mantenimiento de todos los dispensers asociados.");
                return;
            }
        };

        $scope.noPermitirEdicion=function() {
            return $scope.servicioTecnico.estadoServicioTecnico_ids === 3 || $scope.servicioTecnico.estadoServicioTecnico_ids === 4;
        }

        $scope.permitirEdicion = function () {
            return !$scope.noPermitirEdicion();
        }

        var verificarMantenimientosRealizados = function () {
            var todosConMantenimiento = true;
            $scope.dispensersAsociadosDeFabrica.forEach(function (item) {
                if (!item.mantenimientoAsociado) {
                    return todosConMantenimiento = false;
                }
            });
            $scope.dispensersAsociadosDeCliente.forEach(function (item) {
                if (!item.mantenimientoAsociado) {
                    return todosConMantenimiento = false;
                }
            });
            return todosConMantenimiento;
        };

        $scope.cancelar = function () {
            //preguntar cual es la logica de cancelar ST, cual es el estado de cancelado.
            bootbox.confirm("Desea cancelar el Servicio Tecnico?", function (result) {
                if (result) {
                    ShowLoader();
                    $http.post(GetUrlForService('/ServiciosTecnicos/CancelarServicioTecnico'),
                        {
                            servicioTecnico: $scope.servicioTecnico
                        }).
                        success(function (data, status, headers, config) {
                            HideLoader();
                            if (data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "Se canceló con exito el Servicio Tecnico");
                                window.location.href = "/ServiciosTecnicos/";
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

        $scope.guardar = function () {

            var validacion = validarServicioTecnico();

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error", validacion.message);
                return;
            }

            var dispensersAsociados = [];

            angular.forEach($scope.dispensersAsociadosDeCliente, function (d, key) {
                dispensersAsociados.push({
                    dispenser_id: d.id,
                    deCliente: true
                });
            });

            angular.forEach($scope.dispensersAsociadosDeFabrica, function (d, key) {
                dispensersAsociados.push({
                    dispenser_id: d.id,
                    deCliente: false
                });
            });

            ShowLoader();

            $scope.servicioTecnico.cliente_id = $scope.servicioTecnico.clienteSeleccionado.cliente_id;

            $http.post(GetUrlForService('/ServiciosTecnicos/CrearServicioTecnico'),
            {
                    servicioTecnico: $scope.servicioTecnico,
                    dispensersAsociados: dispensersAsociados
            }).then(function(resp, status, headers, config) {

                HideLoader();

                if (resp.data.error == 0) {
                    ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado exitósamente el servicio técnico.");
                    window.location.reload();
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
            }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Servicio Técnico.");
        });

    };

        init();
    }]);

mainApp.controller('buscarServiciosTecnicosController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        
        $scope.serviciosTecnicos = [];
        $scope.soloAbiertos = false;
        $scope.soloNoPlanificados = false;
        $scope.seleccionarTodos = false;
        $scope.idsClientesUrl = "";

        $scope.init = function () {

            ShowLoader();
            var fechaDesde = getDateToShow(new Date().addMonths(-1));
            var fechaHasta = getDateToShow(new Date().addMonths(1));

            $scope.fechaCreadoDesde = fechaDesde;
            $scope.fechaCreadoHasta = fechaHasta;

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForIndex'), {}).
                success(function(data, status, headers, config) {
                    HideLoader();
                    if (data.error == 0) {

                        $scope.repartosBuscar = angular.copy(data.repartos);
                        $scope.repartosBuscar.unshift({ id: null, nombreReparto: '··Todos··' });
                        $scope.repartoSeleccionadoBuscarId = null;

                        $scope.repartos = angular.copy(data.repartos);
                        
                        $scope.sintomasReparaciones = data.sintomasReparaciones;
                        $scope.estados = data.estados;
                        $scope.estados.insert(0, { valor_ids: null, valorTexto: "-- Todos --" });
                        $scope.estadoSeleccionadoId = null;

                        $scope.soluciones = data.soluciones;
                        var itemsForSelect = utiles.ConvertForMultipleSelect($scope.sintomasReparaciones, "valor_ids", "valorTexto");
                        $scope.CreateSintomasSelect({ code: "sintomas", items: itemsForSelect });
                    }

                }).error(function(data, status, headers, config) { HideLoader(); });
        };

         $scope.CreateSintomasSelect = function (datos) {
             $rootScope.$broadcast('onCreateMultipleSelect', datos);

         };
         $scope.$on('onMultipleElementsSelected', function (event, data) {
             if (data.codigo == 'sintomas') {
                 $scope.sintomasReparacionesSelected = data.selectedItems;
             }
         });

         $scope.BuscarServiciosTecnicos = function () {

             ShowLoader();

             $http.post(GetUrlForService('/ServiciosTecnicos/BuscarServiciosTecnicos'), {
                 repartoId: $scope.repartoSeleccionadoBuscarId,
                 sintomasIds: $scope.sintomasReparacionesSelected == null ? null : $scope.sintomasReparacionesSelected,
                 fechaPlanificadoDesde: $scope.fechaPlanificadoDesde,
                 fechaPlanificadoHasta: $scope.fechaPlanificadoHasta,
                 fechaCreadoDesde: $scope.fechaCreadoDesde,
                 fechaCreadoHasta: $scope.fechaCreadoHasta,
                 soloAbiertos: $scope.soloAbiertos,
                 soloNoPlanificados: $scope.soloNoPlanificados,
                 estadoId: $scope.estadoSeleccionadoId,

             }).success(function (data, status, headers, config) {

                 $scope.serviciosTecnicos = null;

                 if (data.error == 0) {

                     $scope.serviciosTecnicos = data.serviciosTecnicos;
                     setDemoras($scope.serviciosTecnicos);
                     setIdsClientes($scope.serviciosTecnicos);
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

         var setDemoras = function (serviciosTecnicos) {

             if (serviciosTecnicos == null) return;

             var ahora = new Date();

             angular.forEach(serviciosTecnicos, function (st) {
                 
                 var fechaCreacion = new Date(st.fechaCreacion.slice(6, -2) * 1);
                 
                 st.demora = {};
                 st.demora.horas = Math.round((ahora - fechaCreacion) / 1000 / 60 /60);

                 if (st.demora.horas > 78 && (st.estadoServicioTecnico_ids == 1 || st.estadoServicioTecnico_ids == 2)) {
                     st.demora.mensaje = Math.round(st.demora.horas / 24) + " días sin ser resuelto";
                     st.demora.mostrarError = true;
                 }
             });
         }
         
         var setIdsClientes = function (serviciosTecnicos) {
             $scope.idsClientesUrl = "";
             var idsClientes = serviciosTecnicos.map(function (x) {
                 return x.cliente_id;
             });

             angular.forEach(idsClientes, function (idCliente, index) {

                 $scope.idsClientesUrl = $scope.idsClientesUrl + idCliente;

                 if (index < idsClientes.length - 1)
                     $scope.idsClientesUrl = $scope.idsClientesUrl + ",";
                 
             });
         };

         $scope.idItemActual = -1;
         $scope.obtenerRowspan = function (item) {

             var cantidad = 0;

             for (var i = 0; i < $scope.serviciosTecnicos.length; i++) {
                 if ($scope.serviciosTecnicos[i].cliente_id == item.cliente_id)
                     cantidad++;
             }

             return cantidad;
         };

         $scope.mostrarColumnaCliente = function (item, idx) {

             if (idx == 0)
                 $scope.idItemActual = -1;

             if ($scope.idItemActual == item.cliente_id) {
                 return false;
             } else {

                 $scope.idItemActual = item.cliente_id;
                 return true;
             }
         }

         $scope.PlanificarServiciosTecnicos = function () {

             var cantidadSeleccionados = utiles.obtenerCantidadSeleccionados($scope.serviciosTecnicos, "seleccionado");

             if ($scope.repartoSeleccionado == null || cantidadSeleccionados == 0) {
                 ShowMessageBox(messageType_Error, "Error", "Debe seleccionar un técnico y al menos un servicio técnico.");
                 return;
             }

             if ($scope.fechaPlanificada == null || $scope.fechaPlanificada == '') {

                 var sts = $scope.serviciosTecnicos.filter(function(x) { return x.seleccionado == true; });

                 for (var i = 0; i < sts.length; i++) {

                     var st = sts[i];

                     if (st.fechaVisitaPlanificada == null) {
                         ShowMessageBox(messageType_Error, "Error", "Al menos un servicio técnico " +
                             "de los seleccionados no posee fecha planificada, " +
                             "por lo tando debe planificar seleccionando una fecha.");
                         return;
                     }
                 }
             }
             
             var mensaje = "Desea planificar los servicios técnicos seleccionados (" + cantidadSeleccionados + ") con los siguientes parámetros? \n";

             if ($scope.fechaPlanificada != null && $scope.fechaPlanificada != '')
                 mensaje += "Fecha de visita: " + $scope.fechaPlanificada + ". ";

             mensaje += "Reparto: " + $scope.repartoSeleccionado.nombreReparto;
             
             bootbox.confirm(mensaje, function (result) {

                     if (result) {

                         ShowLoader();

                         var idsSeleccionados = utiles.obtenerIdsSeleccionados($scope.serviciosTecnicos, "seleccionado", "id");

                         $http.post(GetUrlForService('/ServiciosTecnicos/Planificar'),
                            {
                                serviciosTecnicosIds: idsSeleccionados,
                                fecha: $scope.fechaPlanificada,
                                repartoId: $scope.repartoSeleccionado.id,

                            }).
                            success(function (data, status, headers, config) {

                                HideLoader();
                                
                                if (data.error == 0) {

                                    ShowMessageBox(messageType_Success, "Exitoso", "La planificación se ha realizado con éxito");
                                    $scope.BuscarServiciosTecnicos();

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
         $scope.QuitarPlanificacion = function () {

             var cantidadSeleccionados = utiles.obtenerCantidadSeleccionados($scope.serviciosTecnicos, "seleccionado");

             bootbox.confirm("Desea quitar la planificación para los ( " + cantidadSeleccionados + " ) servicios técnicos seleccionados?"
                 , function (result) {

                     if (result) {

                         ShowLoader();

                         var idsSeleccionados = utiles.obtenerIdsSeleccionados($scope.serviciosTecnicos, "seleccionado", "id");

                         $http.post(GetUrlForService('/ServiciosTecnicos/QuitarPlanificacion'),
                            {
                                serviciosTecnicosIds: idsSeleccionados

                            }).
                            success(function (data, status, headers, config) {

                                HideLoader();

                                if (data.error == 0) {

                                    ShowMessageBox(messageType_Success, "Exitoso", data.message);
                                    $scope.BuscarServiciosTecnicos();

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
         $scope.$watch('seleccionarTodos', function () {
             if ($scope.seleccionarTodos != null && $scope.serviciosTecnicos != null) {

                 for (var i = 0; i < $scope.serviciosTecnicos.length; i++) {
                     var item = $scope.serviciosTecnicos[i];
                     if (item.estadoServicioTecnico_ids != 3 && item.estadoServicioTecnico_ids != 4) {
                         $scope.serviciosTecnicos[i].seleccionado = $scope.seleccionarTodos;
                     }
                 }

             }
         });

         $scope.obtenerColorDeFila = function(servicioTecnico) {
            if (servicioTecnico.estadoServicioTecnico_ids == 1)
                return "row-alert";
            if (servicioTecnico.estadoServicioTecnico_ids == 2)
                return "row-info";
            if (servicioTecnico.estadoServicioTecnico_ids == 3)
                return "row-warning";
            if (servicioTecnico.estadoServicioTecnico_ids == 4)
                return "row-success";
        };

         $scope.init();

    }]);

mainApp.controller('ordenarServiciosTecnicosController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        $scope.clientes = [];
        $scope.seleccionarTodos = false;

        $scope.init = function () {
            ShowLoader();
            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForOrdenarVisitas'), {}).
                success(function (data, status, headers, config) {
                    HideLoader();
                    if (data.error == 0) {
                        $scope.tecnicosBuscar = angular.copy(data.tecnicos);
                        $scope.tecnicosBuscar.unshift({ usuario_id: null, nombreApellido: '··Todos··' });
                        $scope.tecnicoIdBuscar = null;
                    }
                    setTimeout(function () {
                        $scope.Nest();
                    }, 300);
                   
                }).error(function (data, status, headers, config) { HideLoader(); });
        };


        $scope.BuscarServiciosTecnicos = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerServiciosTecnicosParaOrdenar'), {
                tecnicoId: $scope.tecnicoIdBuscar == null ? null : $scope.tecnicoIdBuscar,
                fecha: $scope.fechaPlanificada

            }).success(function (data, status, headers, config) {

                $scope.clientes = null;


                if (data.error == 0) {

                    $scope.clientes = data.clientes;

                    for (i = 0; i < $scope.clientes.length; i++) {
                        if ($scope.clientes[i].orden == null) {
                            $scope.clientes[i].orden = i + 1;
                        }
                    };



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

        $scope.AsignarOrden = function () {
            bootbox.confirm("Desea confirmar el orden actual de visita?"
                , function (result) {

                    if (result) {

                        ShowLoader();

                        var clientesOrdenados = new Array();
                        for (var i = 0; i < $scope.clientes.length; i++) {
                            var objCliente = {
                                ClienteId: $scope.clientes[i].cliente_id,
                                Orden:$scope.clientes[i].orden,
                                FechaPlanificada: GetDateTimeFromJson(angular.copy($scope.clientes[i].fechaVisitaPlanificada)),
                                TecnicoId:$scope.clientes[i].usuarioTecnicoId
                            }
                            clientesOrdenados.push(objCliente);
                         }

                        $http.post(GetUrlForService('/ServiciosTecnicos/OrdenarVisitas'),
                           {
                               clientes: clientesOrdenados,
                               fechaVisita: $scope.fechaPlanificada,
                               tecnicoId: $scope.tecnicoIdBuscar,

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
                    for (var j = 0; j < $scope.clientes.length; j++) {
                        if ($scope.clientes[j].cliente_id == clientesOrdenados[i].id) {
                            $scope.$apply(function () {
                                $scope.clientes[j].orden = (i + 1);
                                $scope.clientes.splice(i, 0, $scope.clientes.splice(j, 1)[0]);
                                $scope.clientes[j].orden = (j + 1);
                            });
                        }
                    }
                }              
            });
            
        };

        

        $scope.init();

    }]);

mainApp.controller('sanitizacionesController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var init = function () {

            ShowLoader();

            $scope.soloSinPlanificar = true;
            $scope.seleccionarTodos = false;

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForSanitizaciones'), {}).
                success(function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.condicionesDispensers = data.condicionesDispensers;
                        $scope.condicionesDispensers.unshift({ valor_ids: null, valorTexto: '--Todos--' });
                        $scope.condicion_id = null;

                        $scope.tecnicos = data.tecnicos;
                        $scope.tecnicos.unshift({ usuario_id: null, nombreApellido: '··Sin Técnico Definido··' });
                        $scope.tecnicoId = null;

                    }

                }).error(function (data, status, headers, config) { HideLoader(); });

            RunTimer(runUiChanges, 300);
        };

        var runUiChanges = function () {
            $('.input-daterange').datepicker({ autoclose: true, format: "dd/mm/yyyy" });
        };

        var corregirAcento = function() {

            if ($scope.dispensers!=null)
                for (var i = 0; i < $scope.dispensers.length; i++) {
                    $scope.dispensers[i].fechaUltimaSani = $scope.dispensers[i].fechaUltimaSanitización;
                }

            if ($scope.clientesConDispensers!=null)
                for (var i = 0; i < $scope.clientesConDispensers.length; i++) {
                    var cliente = $scope.clientesConDispensers[i];
                    for (var j = 0; j < cliente.Dispensers.length; j++) {
                        cliente.Dispensers[j].fechaUltimaSani = cliente.Dispensers[j].fechaUltimaSanitización;
                    }
                }
        };

        $scope.abrirSeleccionarCliente = function (codigo) {

            $rootScope.$broadcast('onOpenSeleccionarCliente', codigo);
        };

        $scope.quitarClienteSeleccionado = function () {

            $scope.clienteSelected = null;
        };

        $scope.buscar = function () {

            buscarClientesYConDispensers();
        };

        var buscarClientesYConDispensers = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerClientesParaSanitizar'),
                {
                    cliente: $scope.clienteSelected == null ? null : $scope.clienteSelected.cliente_id,
                    fechaDesde: $scope.desde,
                    fechaHasta: $scope.hasta,
                    soloSinPlanificar: $scope.soloSinPlanificar,
                    condicion: $scope.condicion_id
                }
            ).then(function(resp, status, headers, config) {

                var data = resp.data;

                $scope.clientesConDispensers = [];

                if (data.error == 0) {

                    $scope.clientesConDispensers = data.clientes;
                    corregirAcento();
                    HideLoader();

                    setTimeout(function() {
                        setTooltip();
                    }, 300);

                } else {
                    HideLoader();
                }

            }, function(data, status, headers, config) {
                HideLoader();
            });
        };

        var buscarDispensers = function() {
            ShowLoader();

            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerDispensersParaSanitizar'),
                {
                    cliente: $scope.clienteSelected == null ? null : $scope.clienteSelected.cliente_id,
                    fechaDesde: $scope.desde,
                    fechaHasta: $scope.hasta,
                    soloSinPlanificar: $scope.soloSinPlanificar,
                    condicion: $scope.condicion_id
                }
            ).then(function (resp, status, headers, config) {

                var data = resp.data;

                $scope.dispensers = null;

                if (data.error == 0) {

                    $scope.dispensers = data.dispensers;
                    corregirAcento();
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
        };

        $scope.generarServiciosTecnicos = function () {

            var cantidadSeleccionados = utiles.obtenerCantidadSeleccionados($scope.dispensers, "seleccionado");

            bootbox.confirm("Desea generar los servicios técnicos para los ( " + cantidadSeleccionados + " ) dispensers seleccionados" +
                " para la fecha ( " + $scope.fechaPlanificada + " ) ?", function (result) {

                    if (result) {

                        ShowLoader();

                        var clientesSeleccionados = $scope.clientesConDispensers.filter(
                            function (cliente) { return cliente.seleccionado; }).map(
                            function (cliente) { return { clienteId: cliente.cliente_id, dispensers: cliente.Dispensers }; });

                        for (var i = 0; i < clientesSeleccionados.length; i++) {
                            clientesSeleccionados[i].idsDispensersSeleccionados = clientesSeleccionados[i].Dispensers.map(function (d) { return d.id; });
                        }

                        $http.post(GetUrlForService('/ServiciosTecnicos/GenerarServiciosTecnicosParaSanitizacionesPorClientes'),
                           {
                               clientes: clientesSeleccionados,
                               fecha: $scope.fechaPlanificada,
                           }).
                           then(function (data, status, headers, config) {

                               HideLoader();

                               if (data.error == 0) {

                                   ShowMessageBox(messageType_Success, "Exitoso", data.message);
                                   $scope.BuscarHojaDeRuta();
                                   $scope.buscar();

                               } else {
                                   ShowMessageBox(messageType_Error, "Error", data.message);
                               }


                           }, function (data, status, headers, config) {
                               HideLoader();
                               ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
                           });
                    }
                });

        };

        $scope.idItemActual = -1;
        $scope.obtenerRowspan = function(item) {

            var cantidad = 0;

            for (var i = 0; i < $scope.dispensers.length; i++) {
                if ($scope.dispensers[i].clienteActual_id == item.clienteActual_id)
                    cantidad++;
            }

            return cantidad ;
        };

        $scope.mostrarColumnaCliente = function(item, idx) {

            if (idx == 0)
                $scope.idItemActual = -1;

            if ($scope.idItemActual == item.clienteActual_id) {
                return false;
            } else {

                $scope.idItemActual = item.clienteActual_id;
                return true;
            }
        }

        init();

        $scope.$on('onClienteSelected', function (event, data) {
            if (data.codigo == 'sanitizacionesBuscarCliente')
                $scope.clienteSelected = data.cliente;
        });

        $scope.$watch('seleccionarTodos', function () {
            if ($scope.seleccionarTodos != null && $scope.dispensers != null) {

                for (var i = 0; i < $scope.dispensers.length; i++) {
                    $scope.dispensers[i].seleccionado = $scope.seleccionarTodos;
                }

            }
        });

    }]);

mainApp.controller('editarSoporteTecnico', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var init = function () {

            ShowLoader();

            $scope.soloSinPlanificar = true;
            $scope.seleccionarTodos = false;

            $scope.servicioTecnicoId = getParameterByName("id")*1;

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForEditar'),
                {
                     params: {
                          servicioTecnicoId: $scope.servicioTecnicoId
                     }
                }).
                success(function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.servicioTecnico = data.servicioTecnico;
                        $scope.sintomas = data.sintomasReparaciones;
                    }

                }).error(function (data, status, headers, config) { HideLoader(); });

            RunTimer(function() {
                


            }, 300);
        };

        $scope.guardar = function() {
            
            ShowLoader();
            
            $http.post(GetUrlForService('/ServiciosTecnicos/EditarServicioTecnico'),
               {
                   servicioTecnico: {
                       id: $scope.servicioTecnicoId,
                       cantidadDispensers: $scope.servicioTecnico.cantidadDispensers,
                       sectorUbicacion: $scope.servicioTecnico.sectorUbicacion,
                       responsableEnCliente: $scope.servicioTecnico.responsableEnCliente,
                       telefonoResponsable: $scope.servicioTecnico.telefonoResponsable,
                       comentariosDeCierre: $scope.servicioTecnico.comentariosDeCierre,
                       sintoma_ids: $scope.servicioTecnico.sintoma_ids,
                   }

               }).
               success(function (data, status, headers, config) {

                   HideLoader();

                   if (data.error == 0) {

                       ShowMessageBox(messageType_Success, "Exitoso", data.message);

                   } else {
                       ShowMessageBox(messageType_Error, "Error", data.message);
                   }


               }).error(function (data, status, headers, config) {
                   HideLoader();
                   ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
               });

        };

        init();
    }]);

mainApp.controller('verServicioTecnico', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var init = function () {

            ShowLoader();

            $scope.servicioTecnicoId = getParameterByName("id") * 1;

            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerDetalleServicioTecnico'),
                {
                    servicioTecnicoId: $scope.servicioTecnicoId
                }).
                success(function (data, status, headers, config) {
                    HideLoader();
                    if (data.error == 0) {
                        $scope.servicioTecnico = data.servicioTecnico;
                    }
                }).error(function (data, status, headers, config) { HideLoader(); });
            RunTimer(function () {

            }, 300);
        };

        init();
    }]);

mainApp.controller('cerrarServicioTecnico', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var init = function () {
            ShowLoader();
            $scope.servicioTecnicoId = getParameterByName("id") * 1;
            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForCerrar'),
                {
                    params: {
                        servicioTecnicoId: $scope.servicioTecnicoId
                    }
                }).
                success(function (data, status, headers, config) {
                    HideLoader();
                    if (data.error == 0) {
                        $scope.servicioTecnico = data.servicioTecnico;
                        $scope.soluciones = data.soluciones;
                        $scope.tecnicos = data.tecnicos;
                        $scope.motivosDeCierre = data.motivosDeCierre;
                        var itemsForSelect = utiles.ConvertForMultipleSelect($scope.soluciones, "valor_ids", "valorTexto");
                        $scope.CreateSintomasSelect({ code: "soluciones", items: itemsForSelect });

                        if (data.tecnicos.length > 0 && $scope.servicioTecnico.usuarioTecnicoId==null)
                            $scope.servicioTecnico.usuarioTecnicoId = $scope.tecnicos[0].usuario_id;
                    }
                }).error(function (data, status, headers, config) { HideLoader(); });
        };

        $scope.Cerrar = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ServiciosTecnicos/CerrarServicioTecnico'),
               {
                servicioTecnicoId: $scope.servicioTecnicoId,
                motivoDeCierreIds: $scope.servicioTecnico.motivoDeCierre_ids,
                comentarios: $scope.servicioTecnico.comentariosDeCierre,
                tecnicoId: $scope.servicioTecnico.usuarioTecnicoId,
                solucionesIds: $scope.solucionesSelected
               }).
               success(function (data, status, headers, config) {

                   HideLoader();

                   if (data.error == 0) {

                       ShowMessageBox(messageType_Success, "Exitoso", data.message);
                       window.location.href = "/ServiciosTecnicos/";
                   } else {
                       ShowMessageBox(messageType_Error, "Error", data.message);
                   }


               }).error(function (data, status, headers, config) {
                   HideLoader();
                   ShowMessageBox(messageType_Error, "Error", "Se ha producido un error.");
               });

        };

        $scope.CreateSintomasSelect = function (datos) {
            $rootScope.$broadcast('onCreateMultipleSelect', datos);
        };
        $scope.$on('onMultipleElementsSelected', function (event, data) {
            if (data.codigo == 'soluciones') {
                $scope.solucionesSelected = data.selectedItems;
            }
        });

        init();
    }]);

mainApp.controller('crearMantenimientoController', ['$scope', '$http','$q','$filter',
    function ($scope, $http, $q, $filter) {

    $scope.mantenimiento = {
        modificarDispenser: true,
        fechaHora: new Date(),
        eliminado: false
    };

    $scope.trabajosRealizados = [];

    $scope.dispenserSeleccionado = null;
    $scope.provieneDeServicioTecnico = false;

    var init = function () {

        $scope.servicioTecnicoId = getParameterByName("servicioTecnicoId") * 1;
        $scope.mantenimiento.dispenser_id = getParameterByName("dispenserId") * 1;
        $scope.tipoDeAccionId = getParameterByName("tipoDeAccionId") * 1;

        if ($scope.servicioTecnicoId > 0 && $scope.mantenimiento.dispenser_id > 0) {
            $scope.provieneDeServicioTecnico = true;
            obtenerDetalleServicioTecnico();
        }

        ShowLoader();

        $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForMantenimientoIndex'), {}).
            success(function (data, status, headers, config) {
                HideLoader();

                if (data.error == 0) {
                    HideLoader();
                    $scope.tecnicosBuscar = angular.copy(data.tecnicos);
                    $scope.tecnico_id = null;
                    $scope.condicionesDispenser = data.condicionesDispenser;
                    $scope.ubicacionesDispenser = data.ubicacionesDispenser;
                    $scope.estadosDispenser = data.estadosDispenser;
                    $scope.soluciones = data.soluciones;
                    $scope.tags = $scope.soluciones;
                    $scope.trabajosDisponibles = data.trabajos;
                }

            }).error(function (data, status, headers, config) { HideLoader(); });

    };

    var obtenerDetalleServicioTecnico = function () {
        ShowLoader();
        $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerDetalleServicioTecnico'),
            {
                servicioTecnicoId: $scope.servicioTecnicoId

            }).then(function (resp, status, headers, config) {

                if (resp.data.error == 0) {
                    $scope.servicioTecnico = resp.data.servicioTecnico;
                    if ($scope.servicioTecnico.usuarioTecnicoId!=null)
                        $scope.mantenimiento.tecnico_id = $scope.servicioTecnico.usuarioTecnicoId;
                    HideLoader();
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al obtener los datos del Servicio Técnico.");
            });
    };
        
    var validarMantenimiento = function () {
        var validacion = { isValid: true, message: '' }

        if (($scope.dispenserSeleccionado == null && !$scope.provieneDeServicioTecnico && $scope.mantenimiento.dispenser_id <= 0)
            || ($scope.dispenserSeleccionado == null && $scope.mantenimiento.dispenser_id <= 0 && $scope.provieneDeServicioTecnico)) {
            validacion.isValid = false;
            validacion.message = "Debe seleccionar un dispenser";
            return validacion;
        }

        if ($scope.mantenimiento.tecnico_id == null) {
            validacion.isValid = false;
            validacion.message = "Debe seleccionar un tecnico";
            return validacion;
        }

        if ($scope.mantenimiento.estadoDispenserActual_ids <= 0 || $scope.mantenimiento.estadoDispenserActual_ids == null) {
            validacion.isValid = false;
            validacion.message = "Debe seleccionar un estado";
            return validacion;
        }

        if ($scope.mantenimiento.ubicacionActual_ids <= 0 || $scope.mantenimiento.ubicacionActual_ids == null) {
            validacion.isValid = false;
            validacion.message = "Debe seleccionar una ubicacion";
            return validacion;
        }

        if ($scope.mantenimiento.condicionActual_ids <= 0 || $scope.mantenimiento.condicionActual_ids == null) {
            validacion.isValid = false;
            validacion.message = "Debe seleccionar una condicion";
            return validacion;
        }
            
        return validacion;

    }

    $scope.guardar = function () {

        ShowLoader();

        var validacion = validarMantenimiento();

        if (!validacion.isValid) {
            ShowMessageBox(messageType_Error, "Error", validacion.message);
            HideLoader();
            return;
        }

        if (!$scope.provieneDeServicioTecnico && $scope.mantenimiento.dispenser_id == 0) {
            $scope.mantenimiento.dispenser_id = $scope.dispenserSeleccionado.id;
        }

        $scope.mantenimiento.trabajosRealizados = $scope.trabajosRealizados;

        $http.post(GetUrlForService('/ServiciosTecnicos/CrearMantenimiento'),
        {
            mantenimiento: $scope.mantenimiento,
            modificarDispenser: $scope.mantenimiento.modificarDispenser,
            servicioTecnicoId: $scope.servicioTecnicoId,
            accionId: $scope.tipoDeAccionId

        }).then(function (resp, status, headers, config) {

                

            if (resp.data.error == 0) {
                HideLoader();
                ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado exitósamente el Mantenimiento.");
                window.location.href = "/ServiciosTecnicos/";
            } else {
                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                HideLoader();
            }

        }, function (data, status, headers, config) {
            HideLoader();
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Mantenimiento.");
        });

    }

    $scope.agregarTrabajoRealizado=function() {

        $scope.trabajosRealizados.push({trabajo_id:0, cantidad:1});
    }

    $scope.quitarTrabajoRealizado = function (position) {
        this.trabajosRealizados.splice(position, 1);
    }

    init();

    }]);


mainApp.controller('nuevoMantenimientoController',
            ['$scope', '$http', '$q', '$filter', 'dispenserId', 'servicioTecnicoId', 'esTaller', '$uibModalInstance',
    function ($scope, $http, $q, $filter, dispenserId, servicioTecnicoId, esTaller, $uibModalInstance) {

        $scope.esTaller = esTaller;

        $scope.mantenimiento = {
            modificarDispenser: true,
            fechaHora: new Date(),
            eliminado: false
        };

        $scope.repuestosYActividades = [];

        $scope.dispenserSeleccionado = null;
        $scope.provieneDeServicioTecnico = false;

        var articuloIdInstalacion = 0;
        var articuloIdDesistalacion = 0;
        var articuloIdReubicacion = 0;
        var articuloIdSanitizacion = 0;

        var init = function () {

            $scope.servicioTecnicoId = servicioTecnicoId;
            $scope.mantenimiento.dispenser_id = dispenserId;

            if ($scope.servicioTecnicoId > 0 && $scope.mantenimiento.dispenser_id > 0) {
                $scope.provieneDeServicioTecnico = true;
                obtenerDetalleServicioTecnico();                
            }

            obtenerDetalleDeDispenser();

            ShowLoader();

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForNuevoMantenimiento'),
                {
                    params: {
                        esTaller:$scope.esTaller
                    }
                }).
                then(function (resp) {

                    HideLoader();

                    var data = resp.data;
                    
                    if (data.error == 0) {
                       
                        $scope.tecnicosBuscar = data.tecnicos;
                        $scope.accionesPrincipales = data.accionesPrincipales;
                        $scope.sintomas = data.sintomas;
                        $scope.actividades = data.actividades;
                        $scope.repuestos = data.repuestos;

                        articuloIdInstalacion = data.articuloIdInstalacion;
                        articuloIdDesistalacion = data.articuloIdDesistalacion;
                        articuloIdReubicacion = data.articuloIdReubicacion;
                        articuloIdSanitizacion = data.articuloIdSanitizacion;

                        $scope.mantenimiento.tecnico_id = $scope.tecnicosBuscar.length > 0 ? $scope.tecnicosBuscar[0].usuario_id : null;

                        setActividadPrincipal();
                    }

                }, function (data) {
                    HideLoader();
                });

        };

        var obtenerDetalleServicioTecnico = function () {
            ShowLoader();
            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerDetalleServicioTecnico'),
                {
                    servicioTecnicoId: $scope.servicioTecnicoId

                }).then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        $scope.servicioTecnico = resp.data.servicioTecnico;

                        if ($scope.servicioTecnico.sintoma_ids == SINTOMAS_SERVICIOS_TECNICOS.INSTALACION) {
                            $scope.mantenimiento.sintomaReal_ids = SINTOMAS_SERVICIOS_TECNICOS.INSTALACION;
                            $scope.mantenimiento.accionPrincipal_ids = ACCIONES_PRINCIPALES_MANTENIMIENTO.INSTALACION;
                        } else if ($scope.servicioTecnico.sintoma_ids == SINTOMAS_SERVICIOS_TECNICOS.DESINSTALACION) {
                            $scope.mantenimiento.sintomaReal_ids = SINTOMAS_SERVICIOS_TECNICOS.DESINSTALACION;
                            $scope.mantenimiento.accionPrincipal_ids = ACCIONES_PRINCIPALES_MANTENIMIENTO.DESINSTALACION;
                        } else if ($scope.servicioTecnico.sintoma_ids == SINTOMAS_SERVICIOS_TECNICOS.SANITIZACION) {
                            $scope.mantenimiento.sintomaReal_ids = SINTOMAS_SERVICIOS_TECNICOS.SANITIZACION;
                            $scope.mantenimiento.accionPrincipal_ids = ACCIONES_PRINCIPALES_MANTENIMIENTO.SANITIZACION;
                        } else if ($scope.servicioTecnico.sintoma_ids == SINTOMAS_SERVICIOS_TECNICOS.REUBICACION) {
                            $scope.mantenimiento.sintomaReal_ids = SINTOMAS_SERVICIOS_TECNICOS.REUBICACION;
                            $scope.mantenimiento.accionPrincipal_ids = ACCIONES_PRINCIPALES_MANTENIMIENTO.REUBICACION;
                        }

                        setActividadPrincipal();

                        HideLoader();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al obtener los datos del Servicio Técnico.");
                });
        };

        var obtenerDetalleDeDispenser = function () {

            $http.get(GetUrlForService('/Dispensers/ObtenerDispenser'),
                {
                    params: {
                        dispenser_id: $scope.mantenimiento.dispenser_id
                    }
                }).then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        $scope.dispenserSeleccionado = resp.data.dispenser;
                    }
                });
        };

        var validarMantenimiento = function () {
            var validacion = { isValid: true, message: '' }

            if (($scope.dispenserSeleccionado == null && !$scope.provieneDeServicioTecnico && $scope.mantenimiento.dispenser_id <= 0)
                || ($scope.dispenserSeleccionado == null && $scope.mantenimiento.dispenser_id <= 0 && $scope.provieneDeServicioTecnico)) {
                validacion.isValid = false;
                validacion.message = "Debe seleccionar un dispenser";
                return validacion;
            }

            if ($scope.mantenimiento.tecnico_id == null) {
                validacion.isValid = false;
                validacion.message = "Debe seleccionar un tecnico";
                return validacion;
            }
                      
            return validacion;
        }

        $scope.mostrarSintomaReal = function () {

            var accionesPrincipales =
                [ACCIONES_PRINCIPALES_MANTENIMIENTO.INSTALACION,
                 ACCIONES_PRINCIPALES_MANTENIMIENTO.DESINSTALACION,
                 ACCIONES_PRINCIPALES_MANTENIMIENTO.SANITIZACION,
                 ACCIONES_PRINCIPALES_MANTENIMIENTO.REUBICACION];

            return accionesPrincipales.indexOf($scope.mantenimiento.accionPrincipal_ids) < 0;

        }

        $scope.guardar = function (pasarAObservacion) {

            var onConfirmar = function (aObservacion) {

                ShowLoader();

                var validacion = validarMantenimiento();

                if (!validacion.isValid) {
                    ShowMessageBox(messageType_Error, "Error", validacion.message);
                    HideLoader();
                    return;
                }

                $scope.mantenimiento.dispenser_id = $scope.dispenserSeleccionado.id;

                $scope.mantenimiento.actividadesYRepuestos = $scope.repuestosYActividades
                        .map(function (x) {
                            return {
                                articulo_id: x.articuloSeleccionado.id,
                                cantidad: x.cantidad
                            };
                        });

                $http.post(GetUrlForService('/ServiciosTecnicos/CrearMantenimiento'),
                {
                    mantenimiento: $scope.mantenimiento,
                    servicioTecnicoId: $scope.servicioTecnicoId,
                    pasarAObservacion: pasarAObservacion

                }).then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        HideLoader();
                        $uibModalInstance.close();
                        ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado exitósamente el Mantenimiento.");
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        HideLoader();
                    }

                }, function (data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Mantenimiento.");
                });
            };

            var mensaje = "Confirma guardar el mantenimiento? <br/>" +
                (pasarAObservacion ? "- Mover dispenser al estado 'EN OBSERVACIÓN'.<br/>" : "- Guardar mantenimiento sin cambiar de estado. <br/>") +
                ($scope.mantenimiento.esCobrable ? "- Los daños o desperfectos son atribuídos al cliente.<br/>" : "");


            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    onConfirmar(pasarAObservacion);
                }
            });
        }

        $scope.agregarRepuesto = function () {

            var repuesto = {
                cantidad: 1,
                articuloSeleccionado: $scope.repuestos.length > 0 ? $scope.repuestos[0] : null,
                tipoArticulo_ids: 3,
                esPrincipal: false
            };

            $scope.repuestosYActividades.push(repuesto);
        }

        $scope.agregarActividad = function () {

            var repuesto = {
                cantidad: 1,
                articuloSeleccionado: $scope.actividades.length > 0 ? $scope.actividades[0] : null,
                tipoArticulo_ids: 4,
                esPrincipal: false
            };

            $scope.repuestosYActividades.push(repuesto);
        }

        $scope.quitarItemDeDetalle = function (position) {
            $scope.repuestosYActividades.splice(position, 1);
        }

        $scope.obtenerTotalRepuestos = function () {
            var total = 0;
            $scope.repuestosYActividades.filter(function (x) { return x.tipoArticulo_ids == 3 }).forEach(
                function (x) {
                    try {
                        total += x.articuloSeleccionado.precioMaximo * (x.cantidad * 1)
                    } catch (e) {}
                });
            return total;
        }

        $scope.obtenerTotalActividades = function () {
            var total = 0;
            $scope.repuestosYActividades.filter(function (x) { return x.tipoArticulo_ids == 4 }).forEach(
                function (x) {
                    try {
                        total += x.articuloSeleccionado.precioMaximo * (x.cantidad * 1)
                    } catch (e) { }
                });
            return total;
        }

        $scope.cancelar = function () {
            $uibModalInstance.dismiss();
        };

        $scope.onAccionPrincipalChange = function () {

            setActividadPrincipal();
        }

        var setActividadPrincipal = function () {

            for (var i = 0; i < $scope.repuestosYActividades.length; i++) {
                if ($scope.repuestosYActividades[i].esPrincipal === true) {
                    $scope.quitarItemDeDetalle(i);
                    break;
                }
            }

            var articulo_id = 0;

            if ($scope.mantenimiento.accionPrincipal_ids == ACCIONES_PRINCIPALES_MANTENIMIENTO.INSTALACION) {
                articulo_id = articuloIdInstalacion;
            } else if ($scope.mantenimiento.accionPrincipal_ids == ACCIONES_PRINCIPALES_MANTENIMIENTO.DESINSTALACION) {
                articulo_id = articuloIdDesistalacion;
            } else if ($scope.mantenimiento.accionPrincipal_ids == ACCIONES_PRINCIPALES_MANTENIMIENTO.SANITIZACION) {
                articulo_id = articuloIdSanitizacion; 
            } else if ($scope.mantenimiento.accionPrincipal_ids == ACCIONES_PRINCIPALES_MANTENIMIENTO.REUBICACION) {
                articulo_id = articuloIdReubicacion;
            }

            if (articulo_id > 0) {

                var repuesto = {
                    cantidad: 1,
                    articuloSeleccionado: $scope.actividades.length > 0 ?
                        $scope.actividades.filter(function (x) { return x.id == articulo_id })[0]
                        : null,
                    tipoArticulo_ids: 4,
                    esPrincipal: true
                };


                $scope.repuestosYActividades.insert(0, repuesto);
            }
           
        }

        init();

    }]);

mainApp.controller('replanificarServicioTecnicoController',
            ['$scope', '$http', 'servicioTecnicoId', '$uibModalInstance',
    function ($scope, $http, servicioTecnicoId, $uibModalInstance) {

        var init = function () {

            $scope.servicioTecnicoId = servicioTecnicoId;
            
            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForReplanificacion')).
                then(function (resp) {

                    var data = resp.data;

                    if (data.error == 0) {

                        $scope.telefonistas = data.telefonistas;
                        $scope.telefonistas.insert(0, { usuario_id: null, nombreApellido: "-- No comunicar --" });
                        $scope.usuarioTelefonistaId = null;

                        $scope.franjasHorarias = data.franjasHorarias;
                        $scope.franjaHoraria_ids = $scope.franjasHorarias.length > 0 ? $scope.franjasHorarias[0].valor_ids : null;

                        $scope.repartos = data.repartos;
                        $scope.repartoId = $scope.repartos.length > 0 ? $scope.repartos[0].id : null;
                    }
                });

            obtenerDetalleServicioTecnico();
        };

        var obtenerDetalleServicioTecnico = function () {
           
            $http.post(GetUrlForService('/ServiciosTecnicos/ObtenerDetalleServicioTecnico'),
            {
                servicioTecnicoId: $scope.servicioTecnicoId

            }).then(function (resp, status, headers, config) {

                if (resp.data.error == 0) {
                    $scope.servicioTecnico = resp.data.servicioTecnico;
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al obtener los datos del Servicio Técnico.");
            });
        };

        var validar = function () {
            var validacion = {isValid:true};

            return validacion;
        };

        $scope.guardar = function () {

            ShowLoader();

            var validacion = validar();

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error", validacion.message);
                HideLoader();
                return;
            }

            $http.post(GetUrlForService('/ServiciosTecnicos/ReplanificarServicioTecnico'),
            {
                servicioTecnicoId: $scope.servicioTecnicoId,
                repartoId: $scope.repartoId,
                fecha: $scope.fecha,
                franjaHoraria_ids: $scope.franjaHoraria_ids,
                usuarioTelefonistaId: $scope.usuarioTelefonistaId

            }).then(function (resp) {

                if (resp.data.error == 0) {
                    HideLoader();
                    $uibModalInstance.close(resp.data.servicioTecnico);
                    ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado exitósamente el Mantenimiento.");
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    HideLoader();
                }

            }, function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Mantenimiento.");
            });

        }

        $scope.cancelar = function () {
            $uibModalInstance.dismiss();
        };

        init();

    }]);

mainApp.directive('dispensersEnTaller',
    function ($http, $compile, $templateCache, dispensersService, servicioTecnicoService) {

        return {
            restrict: 'E',
            scope: {
                dispensers: "=",
                idEstado:"@"
            },
            templateUrl: "/js/app/views/serviciosTecnicos/dispensersEnTaller.html",
            link: function (scope, element, attrs) {

                var init = function () {

                    
                };
                
                scope.abrirFichaDeDispenser = function (idDispenser) {

                    servicioTecnicoService.abrirFichaDeDispenser(idDispenser, null);
                };


                init();
            }
        };
    });

mainApp.controller('dashboardTalleController', ['$scope', '$http', 'servicioTecnicoService',
    function ($scope, $http, servicioTecnicoService) {

        $scope.accionActual = { nombre: "Buscar", id: 1 };

        var init = function () {

            obtenerDatosDelTaller();
        };

        var obtenerDatosDelTaller = function () {

            $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerDatosDeTaller')).
             then(function (resp) {

                 if (resp.data.error == 0) {

                     $scope.dashboard = resp.data.dashboard;
                 }
             });
        };

        $scope.seleccionarAccion = function (idAccion) {

            $scope.accionActual.id = idAccion;

            if (idAccion == 1)
                $scope.accionActual.nombre = "Buscar";
            else if (idAccion == 2)
                $scope.accionActual.nombre = "Reparar";
            else if (idAccion == 3)
                $scope.accionActual.nombre = "Observar";
            else if (idAccion == 4)
                $scope.accionActual.nombre = "Funcional";
            else if (idAccion == 5)
                $scope.accionActual.nombre = "Transferir";
        }

        $scope.ejecutarAccion = function () {

            $http.get(GetUrlForService('/Dispensers/ObtenerDispenserPorNumeroInterno'),
           {
               params: {numero:$scope.textoBuscado}
           }).then(function (resp) {

               if (resp.data.error == 0) {
                   var dispenser = resp.data.dispenser;
                   servicioTecnicoService.abrirFichaDeDispenser(dispenser.id, null);
               } else {
                   HideLoader();
                   ShowMessageBox(messageType_Error, "Error", resp.data.message);
               }

           }, function (data, status, headers, config) {
               HideLoader();
               ShowMessageBox(messageType_Error, "Error", "Se ha producido buscar el dispenser.");
           });

        };

        $scope.actualizar = function () {
            obtenerDatosDelTaller();
        };

        init();

    }]);

mainApp.controller('fichaDispenserController', ['$scope', '$http', 'dispenserId', 'servicioTecnicoService',
    function ($scope, $http, dispenserId, servicioTecnicoService) {

        $scope.dispenserId = dispenserId;

        var init = function () {

            $http.get(GetUrlForService('/Dispensers/ObtenerDispenserConDetalles'),
                {
                    params: {
                        dispenserId: $scope.dispenserId
                    }
                }).
             then(function (resp) {

                 if (resp.data.error == 0) {

                     $scope.dispenser = resp.data.dispenser;
                 }
             });
            
            $http.post(GetUrlForService('/Misc/GetLogs'),
               {
                   entidad: 'DISPENSERS',
                   entidadId: $scope.dispenserId
               }).
            then(function (resp) {

                if (resp.data.error == 0) {

                    $scope.historial = resp.data.items;
                }
            });
        };
        
        $scope.verMantenimiento = function (mantenimiento) {

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

        $scope.mostrarFuncional = function () {
                        
            return [ESTADOS_DE_DISPENSERS.FUERA_DE_SERVICIO,
                    ESTADOS_DE_DISPENSERS.EN_OBSERVACION].indexOf($scope.dispenser.estadoDispenserActual_ids) >= 0;
        };

        $scope.mostrarNoFuncional = function () {

            return [ESTADOS_DE_DISPENSERS.FUNCIONAL,
                    ESTADOS_DE_DISPENSERS.EN_REPARACION,
                    ESTADOS_DE_DISPENSERS.FUERA_DE_SERVICIO,
                    ESTADOS_DE_DISPENSERS.EN_OBSERVACION].indexOf($scope.dispenser.estadoDispenserActual_ids) >= 0;
        };

        $scope.mostrarReparar = function () {

            return [ESTADOS_DE_DISPENSERS.FUNCIONAL,
                    ESTADOS_DE_DISPENSERS.FUERA_DE_SERVICIO,
                    ESTADOS_DE_DISPENSERS.NO_FUNCIONAL,
                    ESTADOS_DE_DISPENSERS.EN_OBSERVACION].indexOf($scope.dispenser.estadoDispenserActual_ids) >= 0;
        };
        
        $scope.mostrarTransferir = function () {

            return [ESTADOS_DE_DISPENSERS.FUNCIONAL,
                    ESTADOS_DE_DISPENSERS.EN_REPARACION,
                    ESTADOS_DE_DISPENSERS.FUERA_DE_SERVICIO,
                    ESTADOS_DE_DISPENSERS.NO_FUNCIONAL,
                    ESTADOS_DE_DISPENSERS.EN_OBSERVACION].indexOf($scope.dispenser.estadoDispenserActual_ids) >= 0 && $scope.dispenser.ubicacionActual_ids == 1;
        };

        $scope.mostrarObservar = function () {

            return [ESTADOS_DE_DISPENSERS.EN_REPARACION].indexOf($scope.dispenser.estadoDispenserActual_ids) >= 0;
        };

        //==============Acciones sobre dispensers======================================

        $scope.repararDispenser = function () {

            servicioTecnicoService.iniciarReparacionDeDispenser($scope.dispenser, init, null);
        };

        $scope.iniciarObservacion = function () {

            servicioTecnicoService.abrirNuevoMantenimiento($scope.dispenser.id, null, true, init);
        };

        $scope.pasarAFuncional = function () {

            servicioTecnicoService.abrirNuevaMedicionDeDispenser($scope.dispenser.id, init);
        };
        
        $scope.moverANoFuncional = function () {

            servicioTecnicoService.moverDispenserANoFuncional($scope.dispenser, init, null);
        };

        $scope.transferirDispenser = function () {

            servicioTecnicoService.transferirDispenser($scope.dispenser, init, null);
        };

        //==============FIN Acciones sobre dispensers======================================

        init();

    }]);

mainApp.controller('medicionesController', ['$scope', '$http', 'dispenserId', 'servicioTecnicoService', '$uibModalInstance',
    function ($scope, $http, dispenserId, servicioTecnicoService, $uibModalInstance) {

        $scope.dispenserId = dispenserId;

        var init = function () {

            $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerParametrosParaMediciones')).
             then(function (resp) {

                 if (resp.data.error == 0) {

                     $scope.parametros = resp.data.parametros;
                 }
             });

            obtenerDetalleDeDispenser();
        };

        var obtenerDetalleDeDispenser = function () {

            $http.get(GetUrlForService('/Dispensers/ObtenerDispenser'),
                {
                    params: {
                        dispenser_id: $scope.dispenserId
                    }
                }).then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        $scope.dispenser = resp.data.dispenser;
                    }
                });
        };
        
        var validar = function (medicionesSeleccionadas) {

            if (medicionesSeleccionadas.length == 0) return { isValid: false, message: "Debe agregar al menos un parámetro." }

            for (var i = 0; i < medicionesSeleccionadas.length; i++) {
                var medicion = medicionesSeleccionadas[i];
                if(medicion.valor == null || medicion.valor == "")
                    return { isValid: false, message: "Debe agregar al menos un parámetro." }
            }

            return { isValid: true };
        };

        $scope.guardar = function () {

            ShowLoader();
            
            var medicionesSeleccionadas = $scope.parametros.filter(function (x) {
                return x.incluir == true;
            });

            var validacion = validar(medicionesSeleccionadas);

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error", validacion.message);
                HideLoader();
                return;
            }

            var mediciones = medicionesSeleccionadas
                    .map(function (x) {
                        return {
                            descripcionMedicion: x.valorTexto,
                            valorMedicion: x.valor,
                            observaciones: x.observaciones
                        };
                    });

            $http.post(GetUrlForService('/ServiciosTecnicos/GuardarMedicionesDeDispenser'),
            {
                mediciones: mediciones,
                dispenserId: $scope.dispenserId

            }).then(function (resp, status, headers, config) {

                if (resp.data.error == 0) {
                    HideLoader();
                    $uibModalInstance.close();
                    ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado exitósamente el Mantenimiento.");
                } else {
                    HideLoader();
                    $uibModalInstance.close();
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);                    
                }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Mantenimiento.");
            });

        }

        $scope.cancelar = function () {
            $uibModalInstance.dismiss();
        };

        init();

    }]);

mainApp.controller('buscarMantenimientosController', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

        $scope.soloPendientes = true;
        $scope.soloAtribuidosAlCliente = false;

        $scope.init = function () {

            ShowLoader();
            $scope.fechaCreadoDesde = getDateToShow(new Date().addMonths(-1));
            $scope.fechaCreadoHasta = getDateToShow(new Date().addMonths(1));
            
            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForBuscarMantenimientos'), {}).
                then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {
                    
                        $scope.tecnicos = resp.data.tecnicos;
                        $scope.tecnicos.insert(0, { usuario_id: null, nombreApellido: "-- Todos --" });
                        $scope.tecnicoSeleccionadoId = null;
                    }

                }, function (resp) { HideLoader(); });
        };
        
        $scope.buscar = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ServiciosTecnicos/BuscarMantenimientos'),
            {
                fechaDesde: $scope.fechaCreadoDesde,
                fechaHasta: $scope.fechaCreadoHasta,
                tecnicoId: $scope.tecnicoSeleccionadoId,
                soloPendientes: $scope.soloPendientes,
                soloConDañosDelCliente: $scope.soloAtribuidosAlCliente,
            }).then(function (resp, status, headers, config) {

                HideLoader();

                if (resp.data.error == 0) {
                    $scope.mantenimientos = resp.data.mantenimientos;
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el Mantenimiento.");
            });

        };

        $scope.iniciarTransferenciaDeCostos = function () {

            ShowLoader();

            var idsMantenimientos = [];

            angular.forEach($scope.mantenimientos, function (value) {
                if (value.seleccionado)
                    idsMantenimientos.push(value.id);
            });

            $http.post(GetUrlForService('/ServiciosTecnicos/ValidarMantenimientosParaTransferenciaDeCostos'),
            {
                idsMantenimientos: idsMantenimientos,
              
            }).then(function (resp, status, headers, config) {

                HideLoader();

                if (resp.data.error == 0) {

                    abrirTransferenciaDeCostos(idsMantenimientos);
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (resp) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al validar los mantenimientos.");
            });

        };

        var abrirTransferenciaDeCostos = function (idsMantenimientos) {
            
            var modal = $uibModal.open({
                templateUrl: '/js/app/views/serviciosTecnicos/transferenciaDeCostos.html',
                controller: 'nuevaTransferenciaDeCostosController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    idsSeleccionados: function () { return idsMantenimientos;},
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar();
            });
        };

        $scope.init();

    }]);

mainApp.controller('nuevaTransferenciaDeCostosController',
            ['$scope', '$http', '$uibModalInstance', 'idsSeleccionados',
    function ($scope, $http, $uibModalInstance, idsSeleccionados) {

        $scope.idsSeleccionados = idsSeleccionados;
        $scope.tipoSeleccionado = "1";
        $scope.todasActividadesSeleccionadas = true;
        $scope.todosRepuestosSeleccionados = true;
        $scope.totalReal = 0;
        $scope.montoActividadesAjustado = "";
        $scope.montoRepuestosAjustado = "";

        var totalRepuestos = 0;
        var totalActividades = 0;

        var init = function () {

            $http.get(GetUrlForService('/ServiciosTecnicos/GetDataForTransferenciaDeCostos'),
                {
                    params: {
                        idsMantenimientos: $scope.idsSeleccionados
                    }
                }).
                then(function (resp) {

                    if (resp.data.error == 0) {

                        $scope.datos = resp.data.datos;

                        $scope.todasActividadesSeleccionadasOnClic();
                        $scope.todosRepuestosSeleccionadosOnClic();
                    }

                });
        };
        
        $scope.todasActividadesSeleccionadasOnClic = function () {

            angular.forEach($scope.datos.actividades, function (value) {
                
                value.seleccionado = $scope.todasActividadesSeleccionadas;

            });
        };

        $scope.todosRepuestosSeleccionadosOnClic = function () {

            angular.forEach($scope.datos.repuestos, function (value) {

                value.seleccionado = $scope.todosRepuestosSeleccionados;

            });
        };
        
        $scope.obtenerTotalDeRepuestos = function () {

            if ($scope.datos == null) return 0;

            totalRepuestos = 0;

            angular.forEach($scope.datos.repuestos, function (value) {

                if (value.seleccionado) {
                    totalRepuestos += value.cantidad * value.costo;
                }
            });

            $scope.totalReal = totalActividades + totalRepuestos;

            return totalRepuestos;
        };

        $scope.obtenerTotalDeActividades = function () {

            if ($scope.datos == null) return 0;

            totalActividades = 0;

            angular.forEach($scope.datos.actividades, function (value) {

                if (value.seleccionado) {
                    totalActividades += value.costo;
                }
            });

            $scope.totalReal = totalActividades + totalRepuestos;

            return totalActividades;
        };

        var validar = function () {

            if ($scope.tipoSeleccionado == 1) {

                if ($scope.totalReal * 1 == 0) return { isValid: true, message:"El costo automático no debe ser 0"};

            } else if ($scope.tipoSeleccionado == 2) {

                if ((($scope.montoActividadesAjustado * 1) + ($scope.montoRepuestosAjustado * 1)) == 0) return { isValid: false, message: "El costo final debe ser mayor a $0" };

            } else if ($scope.tipoSeleccionado == 3) {

                if ($scope.leyendaPersonalizada == null || $scope.leyendaPersonalizada == "") return { isValid: false, message: "Ingrese una leyenda válida" };
                if (($scope.precioPersonalizado * 1) == 0) return { isValid: false, message: "El costo personalizado debe ser mayor a $0" };

            }

            return { isValid: true };
        };
                
        $scope.confirmar = function () {

            var onConfirmar = function () {

                var idsSeleccionados = $scope.datos.repuestos.filter(function (x) { return x.seleccionado; }).map(function (x) { return x.id; });
                var idsActividadesSeleccionados = $scope.datos.actividades.filter(function (x) { return x.seleccionado; }).map(function (x) { return x.id; });

                angular.forEach(idsActividadesSeleccionados, function (value) {
                    idsSeleccionados.push(value);
                });

                ShowLoader();
                
                $http.post(GetUrlForService('/ServiciosTecnicos/ConfirmarTransferenciaDeCostos'),
                {
                    idsMantenimientos: $scope.idsSeleccionados,
                    tipo: $scope.tipoSeleccionado,
                    clienteId: $scope.datos.clienteFacturacion.cliente_id,
                    idsDetallesMantenimientosSeleccionados: idsSeleccionados,
                    leyendaPersonalizada: $scope.leyendaPersonalizada,
                    precioTotalPersonalizado: $scope.precioPersonalizado,
                    precioManoDeObra: $scope.montoActividadesAjustado,
                    precioRepuestos: $scope.montoRepuestosAjustado,

                }).then(function (resp, status, headers, config) {

                    if (resp.data.error == 0) {
                        HideLoader();
                        $uibModalInstance.close();
                        ShowMessageBox(messageType_Success, "Exitoso", "Se ha confirmado la transaferencia de costos.");
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        HideLoader();
                    }

                }, function (data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al confirmar la transferencia de costos.");
                });
            };

            var validacion = validar();

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error", validacion.message);
                HideLoader();
                return;
            }

            var mensaje = "Confirma la transferencia de costos al cliente? <br/>" +
                ($scope.tipoSeleccionado == 1 ? "- Costos calculados por total automático: $" + $scope.totalReal : "") +
                ($scope.tipoSeleccionado == 2 ? "- Costos ajustados manualmente. <br/> Mano de obra: $" + $scope.montoActividadesAjustado + ". <br/> Repuestos: $" + $scope.montoRepuestosAjustado : "") +
                ($scope.tipoSeleccionado == 3 ? "- Leyenda y precio personalizados. <br/> Leyenda: " + $scope.leyendaPersonalizada + ". <br/> Precio: $" + $scope.precioPersonalizado : "");
            
            bootbox.confirm(mensaje, function (result) {

                if (result) {
                    onConfirmar();
                }
            });
        }

        $scope.cancelar = function () {
            $uibModalInstance.dismiss();
        };

        init();

    }]);


var SINTOMAS_SERVICIOS_TECNICOS={
    INSTALACION: 1,
    DESINSTALACION: 2,
    SANITIZACION: 4,
    REUBICACION: 5
}

var ACCIONES_PRINCIPALES_MANTENIMIENTO = {
    INSTALACION: 1,
    DESINSTALACION: 2,
    REPARACION: 4,
    SANITIZACION: 4,
    REUBICACION: 5
}

var ESTADOS_DE_DISPENSERS = {
    FUNCIONAL: 1,
    NO_FUNCIONAL: 2,
    EN_REPARACION: 3,
    BAJA: 4,
    FUERA_DE_SERVICIO: 5,
    EN_OBSERVACION: 6,
};

var ACCIONES_SOBRE_DISPENSER = {

    REPARAR: 1,
    OBSERVAR: 2,
    FUNCIONAL: 3,
    TRANSFERIR: 4,
    NO_FUNCIONAL: 5,
};