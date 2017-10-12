/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var TIPODEARTICULO_PRODUCTO = 1;
var TIPODEARTICULO_SERVICIO = 2;
var TIPODEARTICULO_REPUESTO = 3;

mainApp.controller('controlDePlayaCtrl', ['$scope', '$http',
    function ($scope, $http) {

        GLOBAL_CONFIG.finishLoading = false;
        var dispensersDeServiciosTecnicos = [];

        //Model definition
        $scope.Model = {
            usuariosControl: [],
            hojasDeRutasDisponibles: [],
            tiposEventos: [],

            articulosControlables: [],

            productosAgregados: [],
            repuestosAgregados: [],
            dispensersAgregados: [],

            usuarioControlSeleccionado: null,
            hojaDeRutaSeleccionada: null,
            tipoEnventoSeleccionado: null,
            textoHojaDeRutaSeleccionada: "",
            fechaControl: getToday(),
            horaControl: ""
        };

        $scope.controlDePlayaActual = null;
        $scope.esEdit = false;
        $scope.controlPlayaId = getParameterByName("ControlDePlayaId");
        $scope.esEdit = isNumeric($scope.controlPlayaId);

        //Obtiene los datos necesarios para la pantalla
        $http.get(GetUrlForService('/ControlesDePlaya/DataForCreate'), {}).
            success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.Model.usuariosControl = data.usuariosControl;
                    $scope.Model.usuarioControlSeleccionado = $scope.Model.usuariosControl.length > 1 ? $scope.Model.usuariosControl[0] : null;

                    $scope.Model.hojasDeRutasDisponibles = data.hojasDeRutasDisponibles;
                    
                    $scope.Model.tiposEventos = data.tiposEventos;
                    $scope.Model.tipoEnventoSeleccionado = $scope.Model.tiposEventos[0];

                    $scope.Model.articulosControlables = data.articulosControlables;
                    
                    $scope.Model.productosControlables = $scope.Model.articulosControlables.filter(
                            function (x) { return x.tipoArticulo_ids == TIPODEARTICULO_PRODUCTO });

                    $scope.Model.repuestosControlables = $scope.Model.articulosControlables.filter(
                           function (x) { return x.tipoArticulo_ids == TIPODEARTICULO_REPUESTO });
                    
                    $.each($scope.Model.productosControlables, function (index, value) {
                        value.cantidadVacios = 0;
                        value.cantidadLlenos = 0;
                        value.cantidadFallados = 0;
                    });
                    
                    $.each($scope.Model.repuestosControlables, function (index, value) {
                        value.cantidad = 0;
                    });

                    GLOBAL_FUNCTIONS.runTimer(setNumericControl, 200);

                    if ($scope.controlPlayaId != null && $scope.controlPlayaId != "") {

                        $scope.cargarControlDePlayaActual();

                    } else {

                        $scope.Model.productosAgregados = $scope.Model.productosControlables.filter(
                            function (x) { return x.esFrecuente });

                        $scope.Model.repuestosAgregados = $scope.Model.repuestosControlables.filter(
                            function (x) { return x.esFrecuente });
                        
                        $.each($scope.Model.repuestosAgregados, function (index, value) {
                            value.cantidad = 0;
                        });
                    }

                    GLOBAL_FUNCTIONS.runTimer(function () {
                       // SetChosenSelectControl($(".selecctor-articulos"));
                    }, 200);

                }
                else {

                }

                $("#div_SeleccionarHojaDeRutaDialogo").dialog(
                 {
                     autoOpen: false,
                     height: 500,
                     width: 1000,
                     modal: true
                 }
               );

                GLOBAL_FUNCTIONS.hideLoadingScreen();

            }).error(function (data, status, headers, config) {
                GLOBAL_FUNCTIONS.hideLoadingScreen();
            });

        //Eventos ============================================================

        $scope.SeleccionarHojaDeRuta = function (index) {

            $scope.Model.hojaDeRutaSeleccionada = $scope.Model.hojasDeRutasDisponibles[index];
            $scope.Model.textoHojaDeRutaSeleccionada = $scope.Model.hojaDeRutaSeleccionada.nombreReparto +
                ' - ' + GetDateTimeFromJson($scope.Model.hojaDeRutaSeleccionada.fechaRuta);

            $("#div_SeleccionarHojaDeRutaDialogo").dialog("close");

            $scope.Model.dispensersAgregados = $scope.Model.dispensersAgregados.filter(
                function (x) { return !x.esPrecargado });

            obtenerDispensersPrecargadosDeHojaDeRuta();

        };

        $scope.abrirHojasDeRuta = function () {

            $("#div_SeleccionarHojaDeRutaDialogo").dialog("open");
        };

        $scope.confirmarControl = function () {

            try {

                ShowLoader();

                var articulosControlados = [];

                $.each($scope.Model.productosAgregados, function (index, value) {

                    if (value.cantidadVacios > 0 || value.cantidadLlenos > 0 ||
                        value.cantidadFallados > 0 || value.cantidadVaciosPack > 0 ||
                        value.cantidadLlenosPack > 0) {
                        articulosControlados.push(
                            {
                                articulo_id: value.id,
                                cantidadVacios: (value.cantidadVacios * 1) + ((value.cantidadVaciosPack == null ? 0 : value.cantidadVaciosPack) * value.cantidadXPack),
                                cantidadLlenos: (value.cantidadLlenos * 1) + ((value.cantidadLlenosPack == null ? 0 : value.cantidadLlenosPack) * value.cantidadXPack),
                                cantidadFallados: value.cantidadFallados * 1
                            }
                        );
                    }
                });

                $.each($scope.Model.repuestosAgregados, function (index, value) {

                    if (value.cantidad > 0 ) {
                        articulosControlados.push(
                            {
                                articulo_id: value.id,
                                cantidadLlenos: value.cantidad,
                                cantidadVacios: 0,
                                cantidadFallados: 0
                            }
                        );
                    }
                });

                $http.post(GetUrlForService('/ControlesDePlaya/GuardarNuevoControl'),
                       {
                           controlDePlayaId: $scope.esEdit ? $scope.controlDePlayaActual.id : 0,
                           hojaDeRutaId: $scope.esEdit ? $scope.controlDePlayaActual.hojaDeRuta_id : $scope.Model.hojaDeRutaSeleccionada.id,

                           usuarioControlaId: $scope.Model.usuarioControlSeleccionado.usuario_id,
                           fecha: $scope.Model.fechaControl,
                           hora: $scope.Model.horaControl,
                           tipoEventoId: $scope.Model.tipoEnventoSeleccionado.id,
                           articulos: articulosControlados,
                           kilometros: $scope.Model.kilometrosRodado,
                           idsDispensers : $scope.Model.dispensersAgregados !=null? 
                                $scope.Model.dispensersAgregados.map(function(x){return x.id;}):null
                       }).
                       success(function (data, status, headers, config) {

                           HideLoader();

                           if (data.error == 0) {

                               ShowMessageBox(messageType_Success, "Exitoso", data.message);
                               window.location.reload();
                           } else {
                               ShowMessageBox(messageType_Error, "Error", data.message);
                           }

                       }).error(function (data, status, headers, config) {
                           HideLoader();
                           ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el control de playa");
                       });

            } catch (ex) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el control de playa");
            }

        };

        $scope.agregarProducto = function () {

            //Verifico si es nulo
            if ($scope.productoSeleccionadoParaAgregar == null) {
                ShowMessageBox(messageType_Error, "Error", "Debe seleccionar un producto para agregar");
                return;
            }

            //Verificar si ya esta agregado
            var articuloYaAgregado = $scope.Model.productosAgregados.filter(
                function (x) { return x.id == $scope.productoSeleccionadoParaAgregar.id }).length > 0;

            if(articuloYaAgregado == true)
            {
                ShowMessageBox(messageType_Error, "Error", "El producto seleccionado ya está en la lista de controlados");
                return;
            }
            
            //Agregar al array
            $scope.Model.productosAgregados.push($scope.productoSeleccionadoParaAgregar);

            GLOBAL_FUNCTIONS.runTimer(function () {
                setNumericControl();
            }, 200);
        };

        $scope.agregarRepuesto = function () {

            //Verifico si es nulo
            if ($scope.repuestoSeleccionadoParaAgregar == null) {
                ShowMessageBox(messageType_Error, "Error", "Debe seleccionar un repuesto para agregar");
                return;
            }

            //Verificar si ya esta agregado
            var articuloYaAgregado = $scope.Model.repuestosAgregados.filter(
                function (x) { return x.id == $scope.repuestoSeleccionadoParaAgregar.id }).length > 0;

            if (articuloYaAgregado == true) {
                ShowMessageBox(messageType_Error, "Error", "El repuesto seleccionado ya está en la lista de controlados");
                return;
            }

            //Agregar al array
            $scope.Model.repuestosAgregados.push($scope.repuestoSeleccionadoParaAgregar);

            GLOBAL_FUNCTIONS.runTimer(function () {
                setNumericControl();
            }, 200);
        };
        
        $scope.agregarDispenser = function () {

            //Verifico si es nulo
            if ($scope.codigoInternoDispenserSeleccionado == null || $scope.codigoInternoDispenserSeleccionado =="") {
                ShowMessageBox(messageType_Error, "Error", "Debe ingresar un código de dispenser");
                return;
            }

            $http.get(GetUrlForService('/Dispensers/ObtenerDispenserPorNumeroInterno'), {
                params: {
                    numero: $scope.codigoInternoDispenserSeleccionado
                }
            }).then(function (resp) {

                if (resp.data.error == 0) {

                    var dispenserYaAgregado = $scope.Model.dispensersAgregados.filter(
                        function (x) { return x.id == resp.data.dispenser.id }).length > 0;

                    if (dispenserYaAgregado == true) {
                        ShowMessageBox(messageType_Error, "Error", "El dispenser seleccionado ya está en la lista de controlados");
                        return;
                    } else {
                        
                        //Agregar al array
                        $scope.Model.dispensersAgregados.push(resp.data.dispenser);

                    }

                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (resp) { });
            
        };

        $scope.quitarProducto = function (index, articulo) {

            utiles.quitarItem($scope.Model.productosAgregados, index);
        }

        $scope.quitarRepuesto = function (index, repuesto) {
            utiles.quitarItem($scope.Model.repuestosAgregados, index);
        }

        $scope.quitarDispenser = function (index, dispenser) {
            utiles.quitarItem($scope.Model.dispensersAgregados, index);
        }

        //Funciones ==============================================================

        $scope.cargarControlDePlayaActual = function () {

            $http.get(GetUrlForService('/ControlesDePlaya/ObtenerControlDePlaya'), {
                params: {
                    controlDePlaya_id: $scope.controlPlayaId
                }
            }).
               success(function (data) {

                   if (data.error == 0) {

                       $scope.controlDePlayaActual = data.data;

                       //Datos del control de playa
                       $scope.Model.textoHojaDeRutaSeleccionada = $scope.controlDePlayaActual.nombreReparto + ' - ' + GetDateTimeFromJson($scope.controlDePlayaActual.fechaRuta);

                       //Usuario controla
                       for (var k = 0; k < $scope.Model.usuariosControl.length; k++) {
                           var usuario = $scope.Model.usuariosControl[k];
                           if (usuario.usuario_id == $scope.controlDePlayaActual.usuarioControla_id) {
                               $scope.Model.usuarioControlSeleccionado = usuario;
                               break;
                           }
                       }

                       //Tipo de evento
                       for (var l = 0; l < $scope.Model.tiposEventos.length; l++) {
                           var evento = $scope.Model.tiposEventos[l];
                           if (evento.id == $scope.controlDePlayaActual.tipoEvento_ids) {
                               $scope.Model.tipoEnventoSeleccionado = evento;
                               break;
                           }
                       }

                       //Fecha y hora
                       var date = GetDateObjectFromJson($scope.controlDePlayaActual.fechaHora);
                       $scope.Model.fechaControl = GetShortDateFromDateObject(date);
                       $scope.Model.horaControl = date.getHours() + ":" + date.getMinutes();
                       $scope.Model.kilometrosRodado = $scope.controlDePlayaActual.kilometrosRodado;

                       //Productos
                       $.each($scope.controlDePlayaActual.articulos, function (i, artActual) {

                           if (artActual.tipoArticulo_ids == TIPODEARTICULO_PRODUCTO) {

                               var productos = $scope.Model.productosControlables.filter(
                                    function (x) { return x.id == artActual.articulo_id; });

                               if (productos.length > 0) {

                                   var art = productos[0];

                                   if (artActual.cantidadXPack > 1) {

                                       art.cantidadLlenos = artActual.cantidadLlenos % artActual.cantidadXPack;
                                       art.cantidadVacios = artActual.cantidadVacios % artActual.cantidadXPack;
                                       art.cantidadFallados = artActual.cantidadFallados % artActual.cantidadXPack;

                                       art.cantidadLlenosPack = (artActual.cantidadLlenos - art.cantidadLlenos) / artActual.cantidadXPack;
                                       art.cantidadVaciosPack = (artActual.cantidadVacios - art.cantidadVacios) / artActual.cantidadXPack;

                                   } else {

                                       art.cantidadLlenos = artActual.cantidadLlenos;
                                       art.cantidadVacios = artActual.cantidadVacios;
                                       art.cantidadFallados = artActual.cantidadFallados;

                                   }

                                   $scope.Model.productosAgregados.push(art);
                               }

                           } else if (artActual.tipoArticulo_ids == TIPODEARTICULO_REPUESTO) {

                               var repuestos = $scope.Model.repuestosControlables.filter(
                                   function (x) { return x.id == artActual.articulo_id; });

                               if (repuestos.length > 0) {
                                   repuestos[0].cantidad = artActual.cantidadLlenos;
                                   $scope.Model.repuestosAgregados.push(repuestos[0]);
                               }
                           }
                       });

                       //Dispensers
                       $scope.Model.dispensersAgregados = $scope.controlDePlayaActual.dispensers;


                   } else { }

           }).error(function (data) {

           });

        };

        var obtenerDispensersPrecargadosDeHojaDeRuta = function () {

            $http.get(GetUrlForService('/ControlesDePlaya/ObtenerDispensersPrecargadosDeHojaDeRuta'), {
                    params:{
                        hojaDeRutaId: $scope.Model.hojaDeRutaSeleccionada.id
                    }
                }).then(function (resp) {

                    if (resp.data.error == 0) {
                        
                        $.each(resp.data.dispensers, function (index, value) {
                            value.esPrecargado = true;
                            $scope.Model.dispensersAgregados.push(value);
                        });
                    }

                },function(resp){});
        };

    }]);

mainApp.controller('controlDePlayaIndexCtrl', ['$scope', '$http',
    function ($scope, $http) {

        GLOBAL_CONFIG.finishLoading = false;

        $scope.Model = {

            repartosDisponibles: [],
            controlesDePlaya: [],

            fechaControl: getToday(),
            repartoSeleccionado: null,
            incluirSalidas: true,
            incluirEntradas: true,
            cargarArticulos: true
        };

        //Obtiene los datos necesarios para la pantalla
        $http.get(GetUrlForService('/ControlesDePlaya/DataForIndex'), {}).
            success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.Model.repartosDisponibles = data.repartosDisponibles;

                } else { }

                GLOBAL_FUNCTIONS.hideLoadingScreen();

            }).error(function (data, status, headers, config) {
                GLOBAL_FUNCTIONS.hideLoadingScreen();
            });


        //Eventos ===============================================
        $scope.buscarControlesDePlaya = function () {

            try {
                ShowLoader();

                var _tiposDeEventosIds = [];

                if ($scope.Model.incluirEntradas)
                    _tiposDeEventosIds.push(2);

                if ($scope.Model.incluirSalidas)
                    _tiposDeEventosIds.push(1);

                $http.post(GetUrlForService('/ControlesDePlaya/BuscarControlesDePlaya'),
                           {
                               fecha: $scope.Model.fechaControl,
                               repartoId: $scope.Model.repartoSeleccionado.id,
                               tiposDeEventosIds: _tiposDeEventosIds,
                               cargarArticulos: $scope.Model.cargarArticulos
                           }).
                           success(function (data, status, headers, config) {

                               HideLoader();

                               if (data.error == 0) {

                                   $scope.Model.controlesDePlaya = data.data;

                                   $.each($scope.Model.controlesDePlaya, function (index, control) {

                                       control.productos = control.articulos.filter(
                                       function (x) { return x.tipoArticulo_ids == TIPODEARTICULO_PRODUCTO });

                                       control.repuestos = control.articulos.filter(
                                           function (x) {return x.tipoArticulo_ids == TIPODEARTICULO_REPUESTO });

                                   });

                               } else {
                                   ShowMessageBox(messageType_Error, "Error", data.message);
                               }

                           }).error(function (data, status, headers, config) {
                               HideLoader();
                               ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                           });
            } catch (e) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
            }
        };

        $scope.eliminarControl = function (controlDePlayaId, posicion) {

            try {
                ShowLoader();

                $http.post(GetUrlForService('/ControlesDePlaya/EliminarControlDeplaya'),
                           {
                               controlcontrolDePlaya_id: controlDePlayaId
                           }).
                           success(function (data, status, headers, config) {

                               HideLoader();

                               if (data.error == 0) {

                                   ShowMessageBox(messageType_Success, "Exitoso", data.message);
                                   $scope.Model.controlesDePlaya.splice(posicion, 1);
                               } else {
                                   ShowMessageBox(messageType_Error, "Error", data.message);
                               }

                           }).error(function (data, status, headers, config) {
                               HideLoader();
                               ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                           });
            } catch (e) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
            }
        };

        $scope.confirmarControl = function (control, aprueba) {

            $http.post(GetUrlForService('/ControlesDePlaya/ConfirmarControlDePlaya'),
            {
                controlDePlayaId: control.id,
                esAprobado: aprueba
            }).then(function (resp) {

                if (resp.data.error == 0) {
                    $scope.buscarControlesDePlaya();
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);                                   
                }

            }, function (resp) {});

        }

    }]);