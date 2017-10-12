/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var chequesDepositosControllers = angular.module('chequesDepositosControllers', []);

mainApp.controller('buscarChequesDepositosController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.cheques = [];
        $scope.depositos = [];
        $scope.fechaDesde = "";
        $scope.fechaHasta = "";
        $scope.cliente = "";
        var aux_ultimoTexto = "";

        $scope.BusquedaModelo = {
            clienteId: null,
            clienteSelected: null,
            clienteTexto: "",
        };

        $scope.EliminarCheque = function (id) {
            ShowLoader();

            $http.post(GetUrlForService('/ChequesDepositos/DeleteCheque'), {
                id: id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {

                    HideLoader();
                    $scope.ObtenerChequesDepositos();

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

        $scope.EliminarDeposito = function (id) {
            ShowLoader();

            $http.post(GetUrlForService('/ChequesDepositos/DeleteDeposito'), {
                id: id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {

                    HideLoader();
                    ObtenerChequesDepositos();

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

        $scope.ObtenerChequesDepositos = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ChequesDepositos/ObtenerChequesDepositos'), {
                clienteId: $scope.BusquedaModelo.clienteSelected == null ? null : $scope.BusquedaModelo.clienteSelected.cliente_id,
                fechaDesde: $scope.fechaDesde,
                fechaHasta: $scope.fechaHasta
            }).success(function (data, status, headers, config) {

                $scope.cheques = null;
                $scope.depositos = null;

                if (data.error == 0) {

                    $scope.cheques = data.cheques;
                    $scope.depositos = data.depositos;

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

        $scope.EditarDeposito = function(deposito) {
            $rootScope.$broadcast('onEditarDeposito', deposito);
            $("#dialog_depositos").dialog("open");
        };

        $scope.EditarCheque= function (cheque) {
            $rootScope.$broadcast('onEditarCheque', cheque);
            $("#dialog_cheques").dialog("open");
        };
        
        var setDialogs = function () {
            $("#dialog_cheques").dialog(
                {
                    autoOpen: false,
                    height: 400,
                    width: 800,
                    modal: false
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
        };

        $scope.abrirDialogo = function (divId) {
            $("#" + divId).dialog("open");
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
                $scope.BusquedaModelo.clienteTexto = item.nombreCliente + " - " + item.tipoCliente;
                aux_ultimoTexto = $scope.BusquedaModelo.clienteTexto;
            };
            //After you have completed the object set up, give it to the scope to send it to the view
            $scope.autoCompleteModel = autoCompleteModel;

            RunTimer(function () {

                setDialogs();

                var esNuevoCheque = getParameterByName("nuevocheque") == "true";
                var esNuevoDeposito = getParameterByName("nuevodeposito") == "true";

                if (esNuevoCheque) {
                    $scope.abrirDialogo("dialog_cheques");
                }else if (esNuevoDeposito) {
                    $scope.abrirDialogo("dialog_depositos");
                }

            }, 300);

            var fechaDesde = getDateToShow(new Date().addMonths(-6));
            var fechaHasta = getDateToShow(new Date().addMonths(1));
            $scope.fechaDesde = fechaDesde;
            $scope.fechaHasta = fechaHasta;
        };

        $scope.init();

    }]);

mainApp.controller('nuevoChequeController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.hojaDeRutaId = null;
        
        $scope.$on('onClienteSelected', function (event, data) {
            if (data.codigo == 'clienteCheque')
                $scope.clienteSelected = data.cliente;
        });
        
        $scope.$on('onEditarCheque', function (event, data) {
            $scope.cheque = data;
            $scope.clienteSelected = {
                cliente_id: data.clienteEntrega_id,
                nombreCliente: data.nombreCliente,
            }
            $scope.cheque.fechaVencimiento = GetDateTimeFromJson(data.fechaVencimiento);
            $scope.cheque.fechaRecibido = GetDateTimeFromJson(data.fechaRecibido);
        });

        $scope.Init = function () {

            var hojaDeRutaId = getParameterByName("hojaderutaid") * 1;
            $scope.hojaDeRutaId = hojaDeRutaId > 0 ? hojaDeRutaId : null;

            if ($scope.idCheque != 0) {
                $scope.GetChequeById();
                $scope.accion = "Editar Cheque";
            } else {
                $scope.accion = "Registrar Cheque";
            }

            $http.get(GetUrlForService('/ChequesDepositos/DataForNewCheque'), {}).
               success(function (data, status, headers, config) {
                   $scope.bancos = data.bancos;
               }).error(function (data, status, headers, config) { });
        };

        $scope.GetChequeById = function () {
            $http.post(GetUrlForService('/ChequesDepositos/ObtenerChequeById'),
            {
                id: $scope.idCheque

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.cheque = data.cheque;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ValidateCheque = function () {
            var msj = "";

            if ($scope.cheque.librador == null)
                msj = "Debe ingresar el librador. ";
            if ($scope.cheque.nroCheque == null)
                msj = msj + "Debe ingresar el número de cheque. ";
            if ($scope.cheque.banco_ids == null)
                msj = msj + "Debe seleccionar un banco. ";
            if ($scope.cheque.importe == null)
                msj = msj + "Debe ingresar el importe. ";
            if ($scope.cheque.fechaVencimiento == null)
                msj = msj + "Debe seleccionar la fecha de vencimiento. ";
            if ($scope.clienteSelected == null)
                msj = msj + "Debe seleccionar el cliente. ";
            if ($scope.cheque.nroSucursalBanco == null)
                msj = msj + "Debe ingresar la sucursal del banco. ";
            if ($scope.cheque.fechaRecibido == null)
                msj = msj + "Debe seleccionar la fecha de recibido. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {
            var validation = $scope.ValidateCheque();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            } else {

                $scope.cheque.clienteEntrega_id = $scope.clienteSelected.cliente_id;
                $scope.cheque.hojaDeRuta_id = $scope.hojaDeRutaId;

                ShowLoader();
                $http.post(GetUrlForService('/ChequesDepositos/SaveCheque'),
                {
                    cheque: $scope.cheque
                }).success(function (data, status, headers, config) {
                    if (data.error == 0) {
                        HideLoader();
                        $scope.cheque = {};
                        $("#dialog_cheques").dialog("close");
                    } else {
                        HideLoader();
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
            }
        };
        
        $scope.abrirSeleccionarCliente = function (codigo) {

            $rootScope.$broadcast('onOpenSeleccionarCliente', codigo);
        };
        

        $scope.Init();
    }]);

mainApp.controller('nuevoDepositoController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.hojaDeRutaId = null;
        $scope.clienteSelected = null;

        $scope.$on('onClienteSelected', function (event, data) {
            if (data.codigo == 'clienteDeposito')
                $scope.clienteSelected = data.cliente;
        });
        
        $scope.$on('onEditarDeposito', function (event, data) {
            $scope.deposito = data;
            $scope.clienteSelected= {
                cliente_id: data.clienteEntrega_id,
                nombreCliente:data.nombreCliente,
            }
            $scope.deposito.fechaDeDeposito = GetDateTimeFromJson(data.fechaDeDeposito);
        });

        $scope.abrirSeleccionarCliente = function(codigo) {

            $rootScope.$broadcast('onOpenSeleccionarCliente', codigo);
        };

        $scope.Init = function () {

            var hojaDeRutaId = getParameterByName("hojaderutaid") * 1;
            $scope.hojaDeRutaId = hojaDeRutaId > 0 ? hojaDeRutaId : null;

            if ($scope.idDeposito != 0) {
                $scope.GetDepositoById();
                $scope.accion = "Editar Deposito";
            } else {
                $scope.accion = "Registrar Deposito";
            }
            
            $http.get(GetUrlForService('/ChequesDepositos/DataForNewDeposito'), {}).
       success(function (data, status, headers, config) {
           $scope.bancos = data.bancos;
       }).error(function (data, status, headers, config) { });
        };

        $scope.GetDepositoById = function () {
            $http.post(GetUrlForService('/ChequesDepositos/ObtenerDepositoById'),
            {
                id: $scope.idDeposito

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.deposito = data.deposito;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ValidateDeposito = function () {
            var msj = "";

            if ($scope.deposito.nroDeComprobante == null)
                msj = "Debe ingresar el número de comprobante. ";
            if ($scope.deposito.banco_ids == null)
                msj = msj + "Debe seleccionar un banco. ";
            if ($scope.deposito.importe == null)
                msj = msj + "Debe ingresar el importe. ";
            if ($scope.deposito.fechaDeDeposito == null)
                msj = msj + "Debe ingresar la fecha de depósito. ";
            if ($scope.clienteSelected == null)
                msj = msj + "Debe seleccionar un cliente. ";
           
            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {
            var validation = $scope.ValidateDeposito();
            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            } else {
                
                ShowLoader();

                $scope.deposito.clienteEntrega_id = $scope.clienteSelected.cliente_id;
                $scope.deposito.hojaDeRuta_id = $scope.hojaDeRutaId;
                $http.post(GetUrlForService('/ChequesDepositos/SaveDeposito'),
                {
                    deposito: $scope.deposito,
                }).success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.deposito = {};
                        $("#dialog_depositos").dialog("close");
                        HideLoader();
                    } else {
                        HideLoader();
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
            }
        };

        $scope.Init();
    }]);