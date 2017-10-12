/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />


var mainApp = angular.module(
   'mainApp',
    [
        'pedidosControllers'
    ]
);

var pedidosControllers = angular.module('pedidosControllers', []);

pedidosControllers.controller('pedidosIndexCtrl', ['$scope', '$http',
    function ($scope, $http) {

        var aux_ultimoTexto = "";

        $scope.BusquedaModelo = {

            pedidoId: null,
            clienteId: null,
            tipoPedidoId: null,
            desde: "",
            hasta: "",

            clienteSelected: null,
            clienteTexto: "",
            tipoPedidoSelected: null,
            
            tiposPedidosDisponibles: [],
            
            pedidosResultado:[],
        };

        $scope.validarBusqueda = function () {

            var _message = "";
            
            if ($scope.BusquedaModelo.desde == null || $scope.BusquedaModelo.desde=="")
                _message = "Debe seleccionar una fecha desde. ";
            
            if ($scope.BusquedaModelo.hasta == null || $scope.BusquedaModelo.hasta == "")
                _message = "Debe seleccionar una fecha hasta. ";
            
            return { isValid: (_message == ""), message: _message };
        };

        $scope.buscarPedidos = function() {

            var _validation = $scope.validarBusqueda();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
            }

            $scope.BusquedaModelo.clienteId = $scope.BusquedaModelo.clienteSelected == null ? null : $scope.BusquedaModelo.clienteSelected.cliente_id;
            $scope.BusquedaModelo.tipoPedidoId = $scope.BusquedaModelo.tipoPedidoSelected.valor_ids == 0 ? null : $scope.BusquedaModelo.tipoPedidoSelected.valor_ids;

            ShowLoader();

            $http.post(GetUrlForService("/Pedidos/BucarPedidos"), {
                pedidoId: $scope.BusquedaModelo.pedidoId,
                clienteId: $scope.BusquedaModelo.clienteId,
                tipoPedidoId: $scope.BusquedaModelo.tipoPedidoId,
                desde: $scope.BusquedaModelo.desde,
                hasta:$scope.BusquedaModelo.hasta
            } ).
            success(
                function (data, status, headers, config) {

                    HideLoader();
                    
                    if (data.error == 0) {

                        $scope.BusquedaModelo.pedidosResultado = data.data;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error","Se ha producido un error");
                });
        };


        $scope.init = function () {
            
            var autoCompleteModel = {};
            autoCompleteModel.urlTemplate = "/js/app/views/shared/template_autocomplete_cliente.html";
            autoCompleteModel.searchItems = function () {
                return {
                    success: function (f) {

                        if (aux_ultimoTexto == $scope.BusquedaModelo.clienteTexto)
                            return;

                        $scope.BusquedaModelo.clienteSelected = null;
                        aux_ultimoTexto = $scope.BusquedaModelo.clienteTexto;

                        if ($scope.BusquedaModelo.clienteTexto.length < 3) {
                            return;
                        }

                        $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'),
                            {
                                modelo: {
                                    datosCliente: $scope.BusquedaModelo.clienteTexto
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
                //this function is called when the user click or enter on one item of the items diplayed
                $scope.BusquedaModelo.clienteSelected = item;
                $scope.BusquedaModelo.clienteTexto = item.nombreCliente + " - " + item.tipoCliente + " - " + item.domicilioCompleto;
                aux_ultimoTexto = $scope.BusquedaModelo.clienteTexto;
            };
            //After you have completed the object set up, give it to the scope to send it to the view
            $scope.autoCompleteModel = autoCompleteModel;
            
            $http.get(GetUrlForService("/Pedidos/GetModelFor_Index"), {}).success(
                function (data, status, headers, config) {
                    
                    if (data.error == 0) {

                        $scope.BusquedaModelo.tiposPedidosDisponibles = data.tiposPedidosDisponibles;

                        $scope.BusquedaModelo.tiposPedidosDisponibles.splice(0, 0, { valor_ids: 0, valorTexto: "-- Todos --" });
                        $scope.BusquedaModelo.tipoPedidoSelected = $scope.BusquedaModelo.tiposPedidosDisponibles[0];
                    }
                    
                }

            );
            $http.get(GetUrlForService('/Incidentes/ObtenerUsuarios'), {}).
               success(function (data, status, headers, config) {
                   $scope.usuarios = data.usuarios;
                   $scope.usuarioResponsableSelected = $scope.usuarios[0];
               }).error(function (data, status, headers, config) { });
        };

        $scope.init();

    }]);


pedidosControllers.controller('pedidosCreateCtrl', ['$scope', '$http',
    function ($scope, $http) {

        var aux_ultimoTexto = "";

        $scope.PedidoModelo = {

            clienteAVisitar_id: 0,
            tipoPedido_ids: 0,
            comentarios: "",
            asignarHojaDeRuta: false,
            reparto_id: 0,
            fechaPlanificadaAtencion: "",
            estadoPedido_ids: 0,

            clienteSelected: null,
            clienteTexto: "",
            tipoPedidoSelected: null,
            estadoSelected: null,
            repartoSelected: null,

            tiposPedidosDisponibles: [],
            estadosDisponibles: [],
            repartosDisponibles:[],
        };

        $scope.validarPedido = function () {

            var _message = "";

            if ($scope.PedidoModelo.clienteSelected == null)
                _message = "Debe seleccionar un cliente. ";
            
            if ($scope.PedidoModelo.tipoPedidoSelected == null)
                _message = "Debe seleccionar un tipo de pedido. ";
            
            if ($scope.PedidoModelo.estadoSelected == null)
                _message = "Debe seleccionar un estado. ";

            if ($scope.PedidoModelo.asignarHojaDeRuta && $scope.PedidoModelo.repartoSelected == null)
                _message = "Debe seleccionar un reparto. ";

            if ($scope.PedidoModelo.asignarHojaDeRuta && ($scope.PedidoModelo.fechaPlanificadaAtencion == null || $scope.PedidoModelo.fechaPlanificadaAtencion=="") )
                _message = "Debe seleccionar una fecha de planificación válida. ";

            return { isValid: (_message == ""), message: _message };
        };

        $scope.registrarPedido = function() {

            var _validation = $scope.validarPedido();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
            }

            $scope.PedidoModelo.clienteAVisitar_id = $scope.PedidoModelo.clienteSelected.cliente_id;
            $scope.PedidoModelo.tipoPedido_ids = $scope.PedidoModelo.tipoPedidoSelected.valor_ids;
            $scope.PedidoModelo.estadoPedido_ids = $scope.PedidoModelo.estadoSelected.valor_ids;

            if ($scope.PedidoModelo.asignarHojaDeRuta)
                $scope.PedidoModelo.reparto_id = $scope.PedidoModelo.repartoSelected.id;

            ShowLoader();

            $http.post(GetUrlForService("/Pedidos/Create"), {
                pedido:$scope.PedidoModelo
            } ).
            success(
                function (data, status, headers, config) {

                    HideLoader();
                    
                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Confirmación", data.message);
                        window.location.href = "/Pedidos";

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error","Se ha producido un error");
                });
        };
        
        $scope.init = function () {
            
            var autoCompleteModel = {};
            autoCompleteModel.urlTemplate = "/js/app/views/shared/template_autocomplete_cliente.html";
            autoCompleteModel.searchItems = function () {
                return {
                    success: function (f) {

                        if (aux_ultimoTexto == $scope.PedidoModelo.clienteTexto)
                            return;

                        $scope.PedidoModelo.clienteSelected = null;
                        aux_ultimoTexto = $scope.PedidoModelo.clienteTexto;

                        if ($scope.PedidoModelo.clienteTexto.length < 3) {
                            return;
                        }

                        $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'),
                            {
                                modelo: {
                                    datosCliente: $scope.PedidoModelo.clienteTexto
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
                //this function is called when the user click or enter on one item of the items diplayed
                $scope.PedidoModelo.clienteSelected = item;
                $scope.PedidoModelo.clienteTexto = item.nombreCliente + " - " + item.tipoCliente + " - " + item.domicilioCompleto;
                aux_ultimoTexto = $scope.PedidoModelo.clienteTexto;
            };
            //After you have completed the object set up, give it to the scope to send it to the view
            $scope.autoCompleteModel = autoCompleteModel;
            
            $http.get(GetUrlForService("/Pedidos/GetModelFor_Create"), {}).success(
                function (data, status, headers, config) {
                    
                    if (data.error == 0) {

                        $scope.PedidoModelo.tiposPedidosDisponibles = data.tiposPedidosDisponibles;
                        $scope.PedidoModelo.estadosDisponibles = data.estadosDisponibles;
                        $scope.PedidoModelo.repartosDisponibles = data.repartosDisponibles;
                    }
                    
                }
            );
        };

        $scope.init();

    }]);
