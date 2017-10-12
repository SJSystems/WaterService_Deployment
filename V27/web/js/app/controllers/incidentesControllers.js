/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarIncidentesController',
    ['$scope', '$http', '$rootScope', 'incidentesService', '$location', '$timeout',
    function ($scope, $http, $rootScope, incidentesService, $location, $timeout) {
        $scope.incidentes = [];        
        $scope.fecha = getToday();
        $scope.clienteSelected = null;
        $scope.fechaDesde = null;
        $scope.fechaHasta = null;
        $scope.tiposIncidentesSelected = 1;
        $scope.estadosIncidentesSelected = 1;

        $scope.init = function () {

            ShowLoader();
            $http.get(GetUrlForService('/Incidentes/GetDataForBuscarIncidentes'), {}).
                success(function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        $scope.fechaDesde = data.fechaDesde;
                        $scope.fechaHasta = data.fechaHasta;

                        $scope.incidentes = data.incidentes;

                        $scope.estadosIncidentes = data.estadosIncidentes;
                        $scope.tiposIncidentes = data.tiposIncidentes;
                        $scope.usuarios = data.usuarios;

                        $scope.estadosIncidentes.insert(0, { valor_ids: null, valorTexto: '--Todos--' });
                        $scope.tiposIncidentes.insert(0, { valor_ids: null, valorTexto: '--Todos--' });
                        $scope.usuarios.insert(0, { id: null, nombreApellido: '--Todos--' });

                        $scope.tipoIncidenteId = null;
                        $scope.estadoIncidenteId = null;
                        $scope.usuarioId = data.usuarioId != 0 ? data.usuarioId : null;

                    }

                }).error(function (data, status, headers, config) { HideLoader(); });
            
            if ($location.search().clienteId * 1 > 0) {

                $timeout(function () {
                    incidentesService.crearNuevoIncidenteConCliente(null, $location.search().clienteId * 1);
                }, 300);
            }
        };

        $scope.EliminarIncidente = function (id) {
            ShowLoader();
            $http.post(GetUrlForService('/Incidentes/Delete'), {
                id: id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {

                    HideLoader();
                    $scope.ObtenerIncidentes();

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

        $scope.VerIncidente = function (incidente) {

            incidentesService.verIncidente(incidente);
        };

        $scope.ObtenerIncidentes = function () {

            ShowLoader();

            $http.post(GetUrlForService('/Incidentes/ObtenerIncidentes'), {
                    cliente: $scope.clienteSelected==null? null : $scope.clienteSelected.cliente_id,
                    fechaDesde: $scope.fechaDesde,
                    fechaHasta: $scope.fechaHasta,
                    tipoIncidente: $scope.tipoIncidenteId,
                    estadoIncidente: $scope.estadoIncidenteId,
                    usuarioId: $scope.usuarioId
   
            }).success(function (data, status, headers, config) {

                $scope.incidentes = null;

                if (data.error == 0) {

                    $scope.incidentes = data.incidentes;
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

        $scope.EditarIncidente = function (incidente) {
            $rootScope.$broadcast('editarIncidenteClick', incidente);
        };

        $scope.AgregarIncidente = function () {
            incidentesService.crearNuevoIncidente();
        };

        $scope.abrirSeleccionarCliente = function (codigo) {

            $rootScope.$broadcast('onOpenSeleccionarCliente', codigo);
        };

        $scope.$on('onClienteSelected', function (event, data) {
            if (data.codigo == 'incidentesBuscarCliente') {
                $scope.clienteSelected = data.cliente;
            }
                
        });

        $scope.quitarClienteSeleccionado = function() {

            $scope.clienteSelected = null;
        };

        $scope.aprobarIncidente = function (incidente, esAprobado) {
            
            var mensaje = "";

            if (esAprobado === true)
                mensaje = "Está seguro que desea APROBAR el incidente?";
            else
                mensaje = "Está seguro que desea CANCELAR el incidente?";

            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService('/Incidentes/AprobarIncidente'), {
                            incidenteId: incidente.id,
                            esAprobacion: esAprobado
                        })
                        .then(function(resp) {

                            HideLoader();

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso",
                                    "El incidente a sido confirmado exitósamente.");
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                            if (scope.onConfirmar != null)
                                scope.onConfirmar(aprobada);

                        }, function(resp) {

                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        });

                }
            });
        }

        $scope.init();

    }]);

mainApp.controller('nuevoIncidenteController', ['$scope', '$http', '$rootScope', '$uibModalInstance', 'clienteSeleccionado', 'clienteService',
    function ($scope, $http, $rootScope, $uibModalInstance, clienteSeleccionado, clienteService) {

        $scope.tiposDeIncidentes = { PEDIDO: 1, SERVICIO_TECNICO: 2 };
        $scope.dispensersDelCliente = [];
        $scope.clienteSelected = clienteSeleccionado;

        var subtiposIncidentes = [];
        $scope.pedido = {};
        $scope.onEditar = false;
        $scope.$on('editarIncidenteClick', function (event, data) {

            $scope.incidente = angular.copy(data);

            $scope.clienteSelected = {
                cliente_id: data.cliente_id,
                nombreCliente: data.cliente,
            };

            $scope.incidente.fechaCierreEstimado = $scope.incidente.fechaCierreEstimado==null? null : GetDateTimeFromJson($scope.incidente.fechaCierreEstimado);
            $scope.incidente.fechaHoraRegistro = $scope.incidente.fechaHoraRegistro == null ? null : GetDateTimeFromJson($scope.incidente.fechaHoraRegistro);
            $scope.incidente.fechaCierreReal = $scope.incidente.fechaCierreReal == null ? null : GetDateTimeFromJson($scope.incidente.fechaCierreReal);
            $scope.incidente.usuarioRegistra = $scope.incidente.usuarioRegistraId;
            $scope.tiposIncidentesSelected = getTipoIncidenteByIds(data.tipoIncidente_ids);
            $scope.severidadesSelected = getSeveridadesByIds(data.severidad_ids);
            $scope.usuarioResponsableSelected = getUsuarioByIds(data.usuarioResponsable_id);
            $scope.estadosIncidentesSelected = getEstadosIncidentes(data.estadoIncidente_ids);
            
            obtenerDetallesDelCliente({ cliente_id: $scope.incidente.cliente_id });

            if ($scope.incidente.servicioTecnico_id != null) {
                $scope.GetServicioTecnico();
            }
            $scope.pedido = {};

            $scope.onEditar = true;
           
            $scope.AbrirDialogo("dialog_incidentes");

        });

        $scope.$watch('tiposIncidentesSelected', function () {
            if ($scope.tiposIncidentesSelected != null) {
                $scope.subtiposIncidentes = obtenerSubtiposIncidentes($scope.tiposIncidentesSelected.valor_ids);
                $scope.subTipoIncidentesSelected = $scope.subtiposIncidentes[0];
            }
        });

        $scope.id = getParameterByName("id");
        $scope.incidente =
        {
            id: 0
        };

        $scope.Init = function() {

            $scope.onEditar = false;
            $scope.incidente = {};
            $scope.pedido = {};
            $scope.servicioTecnico = {};

            if ($scope.id != 0) {
                $scope.GetIncidenteById();
                $scope.accion = "Editar Incidente";
                $scope.onEditar = true;
            } else {
                $scope.accion = "Registrar Incidente";
                $scope.onEditar = false;
            }

            $http.get(GetUrlForService('/Incidentes/GetDataForNuevoIncidente'), {}).
                success(function(data, status, headers, config) {

                    $scope.tiposIncidentes = data.tiposIncidentes;
                    subtiposIncidentes = data.subtiposIncidentes;
                    $scope.severidades = data.severidades;
                    $scope.estadosIncidentes = data.estadosIncidentes;
                    $scope.usuarios = data.usuarios;
                    $scope.repartos = data.repartos;
                    $scope.sintomas = data.sintomas;
                    $scope.franjasHorarias = data.franjasHorarias;
                    $scope.grupos = data.grupos;

                    $scope.pedido.reparto_id = $scope.repartos[0].id;
                    $scope.severidadesSelected = $scope.severidades[0];
                    $scope.tiposIncidentesSelected = $scope.tiposIncidentes[0];
                    $scope.estadosIncidentesSelected = $scope.estadosIncidentes[0];
                    $scope.usuarioResponsableSelected = $scope.usuarios[0];

                    if ($scope.grupos.length > 0) $scope.grupoResponsableSelected = $scope.grupos[0];

                }).error(function(data, status, headers, config) {});

                setTimeout(function () {
                    RePrepareView($("#nuevo-incidente"));
                }, 200);

            if ($scope.clienteSelected != null) {
                obtenerDetallesDelCliente($scope.clienteSelected);
            }
        };

        $scope.AbrirDialogo = function (divId) {

            $("#" + divId).dialog("open");
        };

        $scope.GetIncidenteById = function () {
            $http.post(GetUrlForService('/Incidentes/ObtenerIncidenteById'),
            {
                id: $scope.id

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.incidente = data.incidente;
                    obtenerDetallesDelCliente({ cliente_id: $scope.incidente.cliente_id });
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.GetServicioTecnico = function () {
            $http.post(GetUrlForService('/Incidentes/ObtenerServicioTecnico'),
            {
                id: $scope.incidente.servicioTecnico_id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.servicioTecnico = data.servicioTecnico;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ValidateIncidente = function () {
            var msj = "";
            //if ($scope.clienteSelected == null)
            //    msj = msj + "Debe seleccionar un cliente. ";
            //if ($scope.incidente.titulo == null)
            //    msj = msj + "Debe ingresar un título. ";
            //if ($scope.incidente.descripcion == null)
            //    msj = msj + "Debe ingresar una descripción. ";
            if ($scope.tiposIncidentesSelected == null)
                msj = msj + "Debe seleccionar el tipo de incidente. ";
            if ($scope.severidadesSelected == null)
                msj = msj + "Debe seleccionar la severidad del incidente. ";
            if ($scope.usuarioResponsableSelected == null)
                msj = msj + "Debe seleccionar el usuario responsable. ";
            if ($scope.estadosIncidentesSelected == null)
                msj = msj + "Debe seleccionar el estado. ";
            if ($scope.responsableId != 1 &&  $scope.responsableId != 2)
                msj = msj + "Debe seleccionar un tipo de responsable y un responsable. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {
            var validation = $scope.ValidateIncidente();
            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            } else {

                ShowLoader();

                $scope.incidente.cliente_id = $scope.clienteSelected?$scope.clienteSelected.cliente_id:null;
                $scope.incidente.tipoIncidente_ids = $scope.tiposIncidentesSelected.valor_ids;
                $scope.incidente.severidad_ids = $scope.severidadesSelected.valor_ids;
                $scope.incidente.estadoIncidente_ids = $scope.estadosIncidentesSelected.valor_ids;
                $scope.incidente.subTipoIncidente_ids = $scope.subTipoIncidentesSelected.valor_ids;

                $scope.incidente.usuarioResponsable_id = $scope.responsableId==1? $scope.usuarioResponsableSelected.id : 0;
                $scope.incidente.grupoResponsable_ids = $scope.responsableId==2? $scope.grupoResponsableSelected.valor_ids : null;

                $scope.servicioTecnico.idsDispensers = $scope.dispensersDelCliente
                    .filter(function(x) { return x.seleccionado; })
                    .map(function(x) { return x.id; });

                $http.post(GetUrlForService('/Incidentes/Save'),
                {
                    incidente: $scope.incidente,
                    servicioTecnico: $scope.servicioTecnico,
                    pedido:$scope.pedido,
                }).success(function (data, status, headers, config) {
                    if (data.error == 0) {
                        HideLoader();
                        sticker.showSuccess("Exitoso", "El incidente se ha registrado correctamente");
                        $uibModalInstance.close('');

                        if (data.incidente.servicioTecnico_id>0)
                            window.open("/ServiciosTecnicos/Crear?id=" + data.incidente.servicioTecnico_id, '_blank');

                    } else {
                        sticker.showError("Error", data.message);
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                    sticker.showError("Error", "Se ha producido un error");
                });
            }
        };

        $scope.abrirSeleccionarCliente = function (codigo) {
            $rootScope.$broadcast('onOpenSeleccionarCliente', codigo);
        };

        $scope.onSeleccionarFechaDeVisita = function() {

            if ($scope.tiposIncidentesSelected.valor_ids == $scope.tiposDeIncidentes.SERVICIO_TECNICO
                && $scope.incidente.fechaCierreEstimado != null
                && $scope.incidente.fechaCierreEstimado != '') {

                $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerCantidadServiciosTecnicosPorFecha'), {
                    params: {
                        fecha: $scope.incidente.fechaCierreEstimado
                    }
                }).then(function(resp) {

                    $scope.serviciosTecnicosParaElDia = resp.data.serviciosTecnicos;

                }, function(resp) {
                    
                });

            }
        };

        var obtenerDetallesDelCliente = function(cliente, clienteId) {

            $http.get(GetUrlForService('/Clientes/ObtenerDetallesDeCliente'),
                {
                    params: {
                        clienteId: cliente ? cliente.cliente_id : clienteId
                    }
                }).
                then(function(res, status, headers, config) {

                    if (res.data.error == 0) {
                        $scope.detalleCliente = res.data.detalles;
                    }

                }, function(data, status, headers, config) {

                });

        };

        $scope.$on('onClienteSelected', function (event, data) {
            if (data.codigo == 'incidentesNuevoCliente') {
                $scope.clienteSelected = data.cliente;
                obtenerDetallesDelCliente($scope.clienteSelected);
                obtenerDispensersDelCliente($scope.clienteSelected.cliente_id);
            }
        });
       
        var getTipoIncidenteByIds = function (ids) {
            for (var i = 0; i < $scope.tiposIncidentes.length; i++) {
                if ($scope.tiposIncidentes[i].valor_ids == ids)
                    return $scope.tiposIncidentes[i];
            }
            return null;
        };

        var getSeveridadesByIds = function (ids) {
            for (var i = 0; i < $scope.severidades.length; i++) {
                if ($scope.severidades[i].valor_ids == ids)
                    return $scope.severidades[i];
            }
            return null;
        };

        var getUsuarioByIds = function (ids) {
            for (var i = 0; i < $scope.usuarios.length; i++) {
                if ($scope.usuarios[i].id == ids)
                    return $scope.usuarios[i];
            }
            return null;
        };

        var getEstadosIncidentes = function (ids) {
            for (var i = 0; i < $scope.estadosIncidentes.length; i++) {
                if ($scope.estadosIncidentes[i].valor_ids == ids)
                    return $scope.estadosIncidentes[i];
            }
            return null;
        };

        var getRepartoByIds = function (ids) {
            for (var i = 0; i < $scope.repartos.length; i++) {
                if ($scope.repartos[i].valor_ids == ids)
                    return $scope.repartos[i];
            }
            return null;
        };

        var obtenerSubtiposIncidentes = function (tipoIncidenteId) {

            var sub = [];
            for (var i = 0; i < subtiposIncidentes.length; i++) {
                if (subtiposIncidentes[i].codigoExterno == tipoIncidenteId)
                    sub.push(subtiposIncidentes[i]);
            }
            return sub;
        }

        var obtenerDispensersDelCliente = function (clienteId) {
            $http.get(GetUrlForService('/Dispensers/BuscarDispensers'),
           {
               params: {
                   clienteId: clienteId,
                   //ocultarBloqueados: false,
                   //soloFuncionalesEnPlaya: false,
                   //numeroInterno: null,
                   //tipoDispenser_ids: null,
                   //condicionActual_ids: null,
                   //color_ids: null,
                   //estadoDispenserActual_ids: null,
                   //ubicacionActual_ids: null,
               }

           }).success(function (data, status, headers, config) {
               if (data.error == 0) {
                   $scope.dispensersDelCliente = data.dispensers;
               }
           }).error(function (data, status, headers, config) {
               HideLoader();
           });
        };

        $scope.cerrarPantalla = function () {
            $uibModalInstance.close('');
        };
        
        $scope.abrirDialogoNuevoCliente = function () {

            clienteService.abrirNuevoCliente(function(exitoso, cliente) {
                
                if (exitoso) {
                    $scope.clienteSelected = cliente;
                    obtenerDetallesDelCliente($scope.clienteSelected);
                }

            });
        };

        $scope.Init();

    }]);

mainApp.controller('viewIncidenteController', ['$scope', '$http', '$rootScope', 'incidenteActual','$uibModalInstance',
    function ($scope, $http, $rootScope, incidenteActual, $uibModalInstance) {

        $scope.accion = "Ver Incidente";
        $scope.incidente = incidenteActual;
        $scope.replanificacion = {};
        $scope.edicionDeResponsable = {};

        $scope.Init = function () {

            $scope.responsable = {tipo:1};

            $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles'), {})
            .then(function (resp) {
                $scope.repartos = resp.data.repartos;
                $scope.nuevoReparto = $scope.repartos[0];
            }, function (resp) {
                HideLoader();
            });

            $http.get(GetUrlForService('/Incidentes/ObtenerResponsables'), {})
               .then(function (resp) {
                   $scope.usuariosReponsables = resp.data.usuariosReponsables;
                   $scope.gruposReponsables = resp.data.gruposReponsables;

                   if ($scope.usuariosReponsables.length > 0) $scope.edicionDeResponsable.usuarioResponsableSelected = $scope.usuariosReponsables[0];
                   if ($scope.gruposReponsables.length > 0) $scope.edicionDeResponsable.grupoResponsableSelected = $scope.gruposReponsables[0];

               }, function (resp) {
                   HideLoader();
               });

            prepararInterfaz();
        };

        $scope.$on('verIncidenteClick', function (event, data) {
            //console.log(data);
            prepararInterfaz();
            $scope.AbrirDialogo("dialog_incidente_datos");
        });

        var prepararInterfaz = function() {

            RunTimer(function() {

                RePrepareView($("#dialog_incidente_datos"));

            }, 1500);

            $scope.comentarios = [];
            $scope.servicioTecnico = [];
            
            $scope.GetComentarios();
            if ($scope.incidente.servicioTecnico_id != null) {
                getServicioTecnico();
            } else if ($scope.incidente.pedido_id != null) {
                getPedido();
            } else if ($scope.incidente.solTomaCoordenadas_id != null) {
                getSolicitudDeCoordenadas();
            }
        };

        $scope.AbrirDialogo = function (divId) {
            $("#" + divId).dialog("open");

            setTimeout(function () {
                RePrepareView($("#dialog_incidente_datos"));
            }, 200);
        };

        $scope.$on('onLogEscrito', function (event, data) {
            
            if (data.action != null) {

                var nuevoEstadoId = null;

                if (data.action == "CERRAR_INCIDENTE")
                    nuevoEstadoId = 5;
                else if (data.action == "CANCELAR_INCIDENTE")
                    nuevoEstadoId = 3;
                else if (data.action == "PAUSAR_INCIDENTE")
                    nuevoEstadoId = 4;
                else if (data.action == "ABRIR_INCIDENTE")
                    nuevoEstadoId = 1;

                ShowLoader();

                $http.post(GetUrlForService('/Incidentes/CambiarEstadoIncidente'),
                   {
                       incidenteId: data.entidadId,
                       nuevoEstadoId: nuevoEstadoId

                   }).success(function (data, status, headers, config) {
                       HideLoader();
                       if (data.error == 0) {
                           
                           $scope.incidente.estadoIncidente_ids = data.nuevoEstadoId;
                           
                           if ($scope.incidente.estadoIncidente_ids == "CERRAR_INCIDENTE")
                               $scope.incidente.estadoIncidente = "Cerrado";
                           else if ($scope.incidente.estadoIncidente_ids == "CANCELAR_INCIDENTE")
                               $scope.incidente.estadoIncidente = "Cancelado";
                           else if ($scope.incidente.estadoIncidente_ids == "PAUSAR_INCIDENTE")
                               $scope.incidente.estadoIncidente = "Pausado";
                           else if ($scope.incidente.estadoIncidente_ids == "ABRIR_INCIDENTE")
                               $scope.incidente.estadoIncidente = "Abierto";

                           $uibModalInstance.close('');
                       }
                   }).error(function (data, status, headers, config) {
                       HideLoader();
                   });
            }

            $scope.GetComentarios();

        });

        $scope.abrirEscribirComentario = function (codigo, id, accion) {
            $rootScope.$broadcast('onOpenEscribirLog',
                {
                    code: codigo,
                    entidadId: id,
                    action: accion,
                    textoAnterior: accion != null ? "(" + accion + ") " : null
                });
        };

        $scope.cerrarIncidente = function(incidenteId) {

            //Abre la ventana de comentario, y luego de guardarlo ejecuta las acciones
            $scope.abrirEscribirComentario('comentarios', incidenteId, "CERRAR_INCIDENTE");
        };
        
        $scope.pausarIncidente = function (incidenteId) {

            //Abre la ventana de comentario, y luego de guardarlo ejecuta las acciones
            $scope.abrirEscribirComentario('comentarios', incidenteId, "PAUSAR_INCIDENTE");
        };

        $scope.cancelarIncidente = function (incidenteId) {

            //Abre la ventana de comentario, y luego de guardarlo ejecuta las acciones
            $scope.abrirEscribirComentario('comentarios', incidenteId, "CANCELAR_INCIDENTE");
        };
        
        $scope.abrirIncidente = function (incidenteId) {

            //Abre la ventana de comentario, y luego de guardarlo ejecuta las acciones
            $scope.abrirEscribirComentario('comentarios', incidenteId, "ABRIR_INCIDENTE");
        };

        $scope.GetComentarios = function () {
            $http.post(GetUrlForService('/Misc/GetLogs'),
            {
                entidad: 'INCIDENTES',
                entidadId: $scope.incidente.id

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.comentarios = data.items;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.replanificar = function() {

            $scope.ejecutandoReplanificacion = true;

            $http.post(GetUrlForService('/Incidentes/ReplanificarIncidentePedido'),
            {
                incidenteId: $scope.incidente.id,
                nuevaFecha: $scope.replanificacion.nuevaFecha,
                nuevoRepartoId: $scope.replanificacion.nuevoReparto.id

            }).then(function (resp, status, headers, config) {
                $scope.ejecutandoReplanificacion = false;
                if (resp.data.error == 0) {

                    $scope.incidente.pedido_id = resp.data.nuevoPedidoId;

                    $scope.GetComentarios();
                    getPedido();
                }
            }, function (data, status, headers, config) {
                $scope.ejecutandoReplanificacion = false;
                HideLoader();
            });
        };

        var getServicioTecnico = function () {
            $http.post(GetUrlForService('/Incidentes/ObtenerServicioTecnico'),
            {
                id: $scope.incidente.servicioTecnico_id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.servicioTecnico = data.servicioTecnico;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        var getPedido = function () {

            $http.get(GetUrlForService('/Pedidos/ObtenerPedidoView'),
            {
               params: {
                   pedidoId: $scope.incidente.pedido_id
               }
            }).then(function(resp) {
                if (resp.data.error == 0) {
                    $scope.pedido = resp.data.pedido;
                }
            }, function(resp) {
                HideLoader();
            });
                
        };

        var getSolicitudDeCoordenadas = function () {

            $http.get(GetUrlForService('/Incidentes/ObtenerSolicitudDeCoordenadas'),
            {
                params: {
                    solicitudId: $scope.incidente.solTomaCoordenadas_id
                }
            }).then(function (resp) {

                if (resp.data.error == 0) {
                    $scope.solicitudCoordenadas = resp.data.solicitud;
                }

            }, function (resp) {
                HideLoader();
            });

        };

        var mapaYaCargado = false;
        
        $scope.mostrarMapa = function () {

            if (mapaYaCargado == false && $scope.solicitudCoordenadas.latitud != "" && $scope.solicitudCoordenadas.longitud != "") {

                var mapaActual = utilesMap.iniciarMapa("div_map");

                var myLatlng = new google.maps.LatLng($scope.solicitudCoordenadas.latitud, $scope.solicitudCoordenadas.longitud);

                var centro = new google.maps.LatLng($scope.solicitudCoordenadas.latitud, $scope.solicitudCoordenadas.longitud);
                mapaActual.setCenter(centro);

                var markerActual = utilesMap.obtenerMarkerPorDefecto(mapaActual, false);
                markerActual.setPosition(myLatlng);
                mapaActual.setZoom(17);

                setTimeout(function() {
                    utiles.ajustarMapa();
                }, 500);

                mapaYaCargado = true;
            }
        };

        $scope.cerrarPantalla = function () {
            $uibModalInstance.close('');
        };
        
        $scope.guardarEdicionResposnsable = function () {

            $scope.guardandoEdicionResposnsable = true;

            $http.post(GetUrlForService('/Incidentes/AsignarNuevoResponsable'),
              {
                  incidenteId: $scope.incidente.id,
                  usuarioId: $scope.responsable.tipo == 1 ? $scope.edicionDeResponsable.usuarioResponsableSelected.id : null,
                  grupoIds: $scope.responsable.tipo == 2 ? $scope.edicionDeResponsable.grupoResponsableSelected.valor_ids : null

              }).then(function (resp) {
                  $scope.guardandoEdicionResposnsable = false;
                  if (resp.data.error == 0) {

                      $scope.Init();
                  }
              }, function (data) {
                  $scope.guardandoEdicionResposnsable = false;                 
              });
        };

        $scope.Init();
    }]);

mainApp.factory('incidentesService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.verIncidente = function (incidente, onCerrar) {
            
            var modal = $uibModal.open({
                templateUrl: '/js/app/views/incidentes/incidente_view.html',
                controller: 'viewIncidenteController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    incidenteActual: incidente
                }
            });

            modal.result.then(function () {
                if (onCerrar!=null)
                    onCerrar(true);
            }, function() {
                if (onCerrar != null)
                    onCerrar(false);
            });
        }

        service.crearNuevoIncidenteConCliente = function (onCerrar, clienteId) {

            $http.get(GetUrlForService('/Clientes/ObtenerPorId'),
             {
                 params: {
                     id: clienteId
                 }
             }).
             then(function (res, status, headers, config) {

                 if (res.data.error == 0) {
                     service.crearNuevoIncidente(onCerrar, res.data.cliente);
                 }

             }, function (data, status, headers, config) {

             });
        };
        
        service.crearNuevoIncidente = function (onCerrar, clienteSeleccionado) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/incidentes/incidente_create.html',
                controller: 'nuevoIncidenteController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    clienteSeleccionado: function () {
                        return clienteSeleccionado;
                    }
                }
            });

            modal.result.then(function() {
                if (onCerrar != null)
                    onCerrar(true);
            }, function() {
                if (onCerrar != null)
                    onCerrar(false);
            });
        };

        return service;
    }]);
