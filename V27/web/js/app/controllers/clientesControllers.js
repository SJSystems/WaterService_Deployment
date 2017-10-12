/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('createClienteController', ['$scope', '$http', 'usuarioClienteService',
    function ($scope, $http, usuarioClienteService) {

        $scope.init = function () {

            $scope.tipoCliente_ids = "1";

        };

        $scope.guardarCliente = function () {

            try {

                ShowLoader();

                if ($scope.tipoCliente_ids == 1)
                    $scope.facturaAutomatica = false;

                var form = $('#form_create');

                var validation = ValidateForm(form);
                if (!validation.validated) {

                    ShowMessageBox(messageType_Error, "Error: ", validation.mensaje);
                    return false;
                }

                $.ajax({
                    cache: false,
                    async: true,
                    type: "POST",
                    url: form.attr('action'),
                    data: form.serialize(),
                    success: function (data) {

                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);
                            window.location.href = "/Clientes/EditCliente/" + data.cliente_id;
                        } else {
                            ShowMessageBox(messageType_Error, "Error al guardar el cliente: ", data.message)
                        }
                        HideLoader();
                    },
                    error: function (data) {

                        HideLoader();
                    }
                });

            } catch (e) {
                HideLoader();
            }
        };

        $scope.init();

    }]);

mainApp.controller('editClienteController', ['$scope', '$http', 'usuarioClienteService',
    function ($scope, $http, usuarioClienteService) {

        $scope.init = function () {

            $scope.tipoCliente_ids = $("#ClienteModelo_tipoCliente_ids").val();

        };

        $scope.cambiarEstado = function (nuevoEstadoId, clienteId) {

            var nuevoEstado = "";

            if (nuevoEstadoId == 1) nuevoEstado = "Activo";
            else if (nuevoEstadoId == 2) nuevoEstado = "No Consume";
            else if (nuevoEstadoId == 3) nuevoEstado = "Moroso";
            else if (nuevoEstadoId == 4) nuevoEstado = "Baja";
            else if (nuevoEstadoId == 5) nuevoEstado = "Borrador";
            else if (nuevoEstadoId == 6) nuevoEstado = "Gestión de baja";

            bootbox.confirm("Confirma cambiar el estado del cliente al estado: " + nuevoEstado, function (r) {

                if (r) {

                    $http.post(GetUrlForService('/Clientes/CambiarEstado'),
                        {
                            clienteId: clienteId * 1,
                            nuevoEstadoId: nuevoEstadoId * 1
                        }).
                        then(function (resp) {

                            if (resp.data.error == 0) {
                                ShowMessageBox(messageType_Success, "Exitoso", "El cambio de estado se ha realizado con éxito");
                                window.location.reload();
                            }
                            else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }

                        });
                }
            });

        };

        $scope.editarPasswordUsuario = function (clienteId) {
            usuarioClienteService.abrirEditarPassword(clienteId, function (exitoso) {
                if (exitoso) {
                    window.location.reload();
                }
            });
        };

        $scope.init();

    }]);

mainApp.controller('altaDeClienteController', ['$scope', '$http', 'clienteService', '$uibModalInstance',
    function ($scope, $http, clienteService, $uibModalInstance) {

        var markerActual = null;
        var mapaActual = null;
        var geocoder = null;

        $scope.cliente = { domicilio: {} };

        $scope.init = function () {

            setTimeout(function () {

                mapaActual = utilesMap.iniciarMapa("div_map");

                markerActual = utilesMap.obtenerMarkerPorDefecto(mapaActual, true);

            }, 200);

            geocoder = new google.maps.Geocoder();

            //Obtener datos para pantalla
            clienteService.obtenerDatosParaNuevoCliente()
                .then(function (resp) {

                    if (resp.data.error == 0) {

                        $scope.barrios = resp.data.barrios;
                        $scope.condicionesDeIva = resp.data.condicionesDeIva;
                        $scope.tiposDeClientes = resp.data.tiposDeClientes;
                        $scope.actividades = resp.data.actividades;
                    }

                    setTimeout(function () {
                        RePrepareView($("#div-nuevo-cliente"));
                    }, 300);

                });

        };

        var validarNuevoCliente = function () {

            var mensaje = "";

            if ($scope.cliente.nombre == "" || $scope.cliente.nombre == null) {
                mensaje += "Debe ingresar un nombre. ";
            }

            if ($scope.cliente.tipoDeCliente == null) {
                mensaje += "Debe ingresar un tipo de cliente. ";
            }

            if ($scope.cliente.condicionIva == null) {
                mensaje += "Debe ingresar una condición de IVA. ";
            }

            if ($scope.cliente.actividad == null) {
                mensaje += "Debe ingresar una actividad. ";
            }

            if ($scope.cliente.domicilio.barrio == null) {
                mensaje += "Debe ingresar un barrio. ";
            }

            if ($scope.cliente.domicilio.calle == null) {
                mensaje += "Debe ingresar una calle. ";
            }

            if ($scope.cliente.dniCuit == "" || $scope.cliente.dniCuit == null) {
                mensaje += "Debe ingresar un número de documento (CUIT o DNI). ";
            }

            if ($scope.cliente.telefono == "" || $scope.cliente.telefono == null) {
                mensaje += "Debe ingresar un número telefónico. ";
            }

            return { message: mensaje, isValid: (mensaje == "") };
        };

        $scope.guardarCliente = function () {

            var validacion = validarNuevoCliente();

            if (!validacion.isValid) {
                sticker.showError("Errores de validación", validacion.message);
                return;
            }

            $scope.guardandoCliente = true;

            $scope.cliente.tipoDeClienteId = $scope.cliente.tipoDeCliente.valor_ids;
            $scope.cliente.condicionIvaId = $scope.cliente.condicionIva.valor_ids;
            $scope.cliente.actividadId = $scope.cliente.actividad.valor_ids;
            $scope.cliente.domicilio.barrioId = $scope.cliente.domicilio.barrio.id;
            $scope.cliente.domicilio.calleId = $scope.cliente.domicilio.calle.id;

            clienteService.crearCliente($scope.cliente)
            .then(function (resp) {

                $scope.guardandoCliente = false;

                if (resp.data.error == 0) {
                    sticker.showSuccess("Exitoso", "El cliente se ha guardado correctamente");
                    $uibModalInstance.close(resp.data.cliente);
                } else {
                    sticker.showError("Error", resp.data.message);
                }
            }, function (resp) {

                sticker.showError("Error", "Se ha producido un error");
                $scope.guardandoCliente = true;

            });
        };

        $scope.onBarrioSeleccionado = function () {

            $scope.cliente.domicilio.calle = null;
        };

        $scope.obtenerCoordenadasPorDomicilio = function () {

            var ciudad = $scope.cliente.domicilio.barrio.barrioCiudadProvincia;
            var calle = $scope.cliente.domicilio.calle.nombreCalle;
            var numero = $scope.cliente.domicilio.puerta;

            ciudad = ciudad.split(';')[1];

            if (calle.indexOf("calle") < 0) {
                calle = "calle " + calle;
            }

            var address = calle + " " + numero + ", " + ciudad;

            geocoder.geocode({ 'address': address }, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) {

                    mapaActual.setCenter(results[0].geometry.location);

                    $scope.cliente.domicilio.latitud = results[0].geometry.location.lat();
                    $scope.cliente.domicilio.longitud = results[0].geometry.location.lng();

                    var myLatlng = new google.maps.LatLng($scope.cliente.domicilio.latitud, $scope.cliente.domicilio.longitud);

                    markerActual.setPosition(myLatlng);

                    mapaActual.setZoom(17);

                } else {
                    $scope.cliente.domicilio.latitud = null;
                    $scope.cliente.domicilio.longitud = null;
                }

                $scope.$apply();
            });
        };

        $scope.obtenerCoordenadasPorPosicion = function () {

            $scope.cliente.domicilio.latitud = markerActual.position.lat();
            $scope.cliente.domicilio.longitud = markerActual.position.lng();
        };

        $scope.buscarCalles = function (texto) {

            return $http.get(GetUrlForService('/Calles/Buscar'), {
                params: {
                    texto: texto,
                    ciudadId: $scope.cliente.domicilio.barrio.ciudad_id
                }
            }).then(function (response) {
                return response.data.calles;
            });
        };

        $scope.cancelar = function () {

            $uibModalInstance.dismiss();
        };

        $scope.init();

    }]);

mainApp.factory('clienteService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.abrirNuevoCliente = function (onConfirmar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/clientes/nuevoCliente.html',
                controller: 'altaDeClienteController',
                size: 'lg',
                backdrop: 'static'
            });

            modal.result.then(function (data) {
                if (onConfirmar != null)
                    onConfirmar(true, data);
            }, function (data) {
                if (onConfirmar != null)
                    onConfirmar(false, data);
            });
        };

        service.crearCliente = function (cliente) {

            return $http.post(GetUrlForService('/Clientes/CrearNuevoCliente'),
                {
                    cliente: cliente
                }
            );
        }

        service.obtenerDatosParaNuevoCliente = function () {

            return $http.get(GetUrlForService('/Clientes/GetDataForNuevoCliente'));
        };

        return service;
    }]);

mainApp.controller('verClientesEnMapaController',
            ['$scope', '$http',
    function ($scope, $http) {

        $scope.clientes = [];
        var idsClientes = [];

        var mapaActual = null;
        var markersActuales = [];

        var init = function () {

            var idsUrl = getParameterByName("idsClientes").split(',').map(function (x) {
                return x * 1;
            });

            idsClientes = idsUrl;

            $http.post(GetUrlForService('/Clientes/ObtenerClientesPorIds'),
                {
                    idsClientes: idsClientes
                }).
                then(function (resp) {

                    if (resp.data.error == 0) {

                        $scope.clientes = resp.data.clientes;
                        setMapa();
                    }

                });
        };

        var setMapa = function () {

            setTimeout(function () {

                mapaActual = utilesMap.iniciarMapa("div_map_clientes");
                mostrarClientesEnMapa();

            }, 400);
        };

        var mostrarClientesEnMapa = function () {

            var comparar = function (_marker, _item) {
                return _marker.metadata.cliente_id == _item.metadata.cliente_id;
            };

            var items = $scope.clientes.filter(
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

            //return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + cliente.cliente_id + "|6fb3e0|5d28ff";
            //return "http://chart.apis.google.com/chart?chst=d_bubble_text_small&chld=bb|" + cliente.cliente_id + "|762c59|FFFFFF|";
            return "http://chart.apis.google.com/chart?chst=d_map_spin&chld=1|0|FFFF42|13|b|" + cliente.cliente_id;
        };

        init();

    }]);

mainApp.controller('preciosClientesController',
            ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

        $scope.cliente = null;
        $scope.articulos = null;

        $scope.precios = null;
        var idCliente = null;

        $scope.listaDePrecios = null;
        $scope.cambiarLista = null;


        var init = function () {

            idCliente = $("#id").val() * 1;

            $http.get(GetUrlForService('/Clientes/GetDataForPreciosDeCliente'),
                {
                    params: {
                        idCliente: idCliente
                    }
                }).
                then(function (resp) {

                    if (resp.data.error == 0) {

                        $scope.cliente = resp.data.cliente;
                        $scope.precios = resp.data.precios;

                        $scope.articulos = resp.data.articulos;
                        $scope.tiposDeArticulos = resp.data.tiposDeArticulos;
                        debugger;
                        $scope.listasDePrecios = resp.data.listasDePrecios;
                        $scope.listaAsignada = resp.data.listaAsignada;
                        debugger;
                        $scope.hayLista = $scope.listaAsignada != null ? true : false;
                    }

                });


        };

        $scope.inactivarPrecio = function (precio) {

            var mensaje = "Desea eliminar el precio especial para el artículo " + precio.nombreArticulo + "?";

            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService('/Clientes/InactivarPrecio'),
                       {
                           idPrecio: precio.id
                       }).
                       success(function (data) {

                           HideLoader();

                           if (data.error == 0) {

                               sticker.showSuccess("Exitoso", "El precio especial se ha inactivado");
                               init();
                           } else {
                               sticker.showError("Error", data.message);
                           }

                       }).error(function (data, status, headers, config) {
                           HideLoader();
                           sticker.showError("Error", "Error al inactivar el precio especial");
                       });
                }
            });
        };

        $scope.abrirAgregarPrecio = function () {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/clientes/agregarPrecioEspecial.html',
                controller: 'agregarPrecioController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    clienteActual: function () { return $scope.cliente; },
                    articulos: function () { return $scope.articulos; },
                    tiposDeArticulos: function () { return $scope.tiposDeArticulos; }
                }
            });

            modal.result.then(function (data) {
                init();
            }, function (data) {

            });

        };

        $scope.asignarLista = function () {
            ShowLoader();

            var url = GetUrlForService('/Clientes/AsignarListaDePrecio');
            $http.post(url,
                {
                    clienteId: $scope.cliente.id,
                    listaId: $scope.listaSelected.id
                })
                .then(function (resp) {

                    if (resp.data.error == 0) {
                        HideLoader();
                        ShowMessageBox(messageType_Success, "Lista asignada con éxito.");

                        $scope.cambiarLista = false;
                        init();

                        $scope.listaSelected = null;
                        return;
                    }
                }, function (data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error al guardar.");
                });
        };

        $scope.quitarLista = function () {

            var url = GetUrlForService('/Clientes/QuitarListaDePrecio');
            $http.post(url,
                {
                    clienteId: $scope.cliente.id
                })
                .then(function (resp) {

                    if (resp.data.error == 0) {
                        HideLoader();
                        ShowMessageBox(messageType_Success, "Lista se quito con éxito.");

                        $scope.cambiarLista = false;
                        init();

                        $scope.listaSelected = null;
                        return;
                    }
                }, function (data, status, headers, config) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error al guardar.");
                });
        };

        init();

    }]);

mainApp.controller('agregarPrecioController',
            ['$scope', '$http', 'clienteActual', 'articulos', 'tiposDeArticulos', '$uibModalInstance',
    function ($scope, $http, clienteActual, articulos, tiposDeArticulos, $uibModalInstance) {

        $scope.articulos = articulos;
        $scope.tiposDeArticulos = tiposDeArticulos;
        $scope.cliente = clienteActual;

        $scope.precio = {
            cliente_id: $scope.cliente.id,
        };

        var init = function () {


        };

        var validar = function () {

            if (!($scope.precio.precio > 0)) return { isValid: false, message: 'Debe ingresar un precio válido' };
            if (!($scope.precio.articulo_id > 0)) return { isValid: false, message: 'Debe seleccionar un artículo' };

            return { isValid: true };
        };

        $scope.guardar = function () {

            var validacion = validar();

            if (!validacion.isValid) {
                sticker.showError("Errores de validación", validacion.message);
                return;
            }

            $scope.guardando = true;

            $http.post(GetUrlForService('/Clientes/GuardarPrecioEspecial'),
                {
                    precio: $scope.precio
                })
            .then(function (resp) {

                $scope.guardando = false;

                if (resp.data.error == 0) {
                    sticker.showSuccess("Exitoso", "El precio especial para el cliente se ha registrado correctamente");
                    $uibModalInstance.close(true);
                } else {
                    sticker.showError("Error", resp.data.message);
                }
            }, function (resp) {

                sticker.showError("Error", "Se ha producido un error");
                $scope.guardando = true;

            });
        };

        $scope.cancelar = function () {

            $uibModalInstance.dismiss();
        };

        init();

    }]);