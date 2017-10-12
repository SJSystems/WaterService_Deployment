/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var mainApp = angular.module(
   'mainApp',
    [
        'notasDeCreditoControllers'
    ]
);

var notasDeCreditoControllers = angular.module('notasDeCreditoControllers', []);

notasDeCreditoControllers.controller('notasDeCreditoCtrl', ['$scope', '$http',
    function ($scope, $http) {
       
    }]);

notasDeCreditoControllers.controller('notasDeCreditoCreateCtrl', ['$scope', '$http',
    function ($scope, $http) {

        $scope.notaDeCreditoModelo = {
            clienteSelected: null,
            clienteTexto: "",
            
            descripcion: "",
            monto: ""
            
        };
        $scope.esClienteDirecto = false;

        var aux_ultimoTexto = "";

        $scope.init = function () {

            var autoCompleteModel = {};
            autoCompleteModel.urlTemplate = "/js/app/views/shared/template_autocomplete_cliente.html";
            autoCompleteModel.searchItems = function () {
                return {
                    success: function (f) {

                        if (aux_ultimoTexto == $scope.notaDeCreditoModelo.clienteTexto)
                            return;

                        $scope.notaDeCreditoModelo.clienteSelected = null;
                        aux_ultimoTexto = $scope.notaDeCreditoModelo.clienteTexto;

                        if ($scope.notaDeCreditoModelo.clienteTexto.length < 3) {
                            return;
                        }

                        $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'),
                            {
                                modelo: {
                                    datosCliente: $scope.notaDeCreditoModelo.clienteTexto
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
                $scope.notaDeCreditoModelo.clienteSelected = item;
                $scope.notaDeCreditoModelo.clienteTexto = item.nombreCliente + " - " + item.tipoCliente + " - " + item.domicilioCompleto;
                aux_ultimoTexto = $scope.notaDeCreditoModelo.clienteTexto;
            };
            //After you have completed the object set up, give it to the scope to send it to the view
            $scope.autoCompleteModel = autoCompleteModel;

            var _cliente_id = getParameterByName("cliente_id");
            if (_cliente_id != "") {

                $scope.esClienteDirecto = true;
                
                $http.post(GetUrlForService('/Clientes/ObtenerDatosCliente'),
                           {
                               cliente_id: _cliente_id
                           }
                       ).success(
                           function (data, status, headers, config) {

                               if (!data.error) {
                                   $scope.notaDeCreditoModelo.clienteSelected = data;
                                   $scope.notaDeCreditoModelo.clienteTexto = data.nombreCliente + " - " + data.tipoCliente + " - " + data.domicilioCompleto;
                               }
                           }
                       );

            }
        };

        $scope.validarNotaDeCredito = function() {
            
            var _message = "";

            if ($scope.notaDeCreditoModelo.clienteSelected == null)
                _message = "Debe seleccionar un cliente. ";
         
            if ($scope.notaDeCreditoModelo.monto == null || $scope.notaDeCreditoModelo.monto == "")
                _message = "Debe ingresar un monto. ";

            if ($scope.notaDeCreditoModelo.descripcion == null || $scope.notaDeCreditoModelo.descripcion == "")
                _message = "Debe ingresar una descripción. ";

            return { isValid: (_message == ""), message: _message };
        };
        
        $scope.guardarNotaDeCredito = function () {

            var _validation = $scope.validarNotaDeCredito();
            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
            }

            ShowLoader();

            $http.post(GetUrlForService("/NotasDeCredito/CrearNotaDeCredito"), {
                descipcion: $scope.notaDeCreditoModelo.descripcion,
                cliente_id: $scope.notaDeCreditoModelo.clienteSelected.cliente_id,
                monto: $scope.notaDeCreditoModelo.monto
            }).
            success(
                function (data, status, headers, config) {

                    HideLoader();

                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Confirmación", data.message);
                        window.location.href = "/NotasDeCredito";

                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }

                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };


        $scope.init();

    }]);

