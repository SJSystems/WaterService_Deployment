/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var mainApp = angular.module(
   'mainApp',
    [
        'ajustesCuentaControllers'
    ]
);

var ajustesCuentaControllers = angular.module('ajustesCuentaControllers', []);

ajustesCuentaControllers.controller('crearAjusteDeCuentaController', ['$scope', '$http',
    function ($scope, $http) {

        var init = function () {

            $scope.ajuste = {};
            $scope.conceptos = [];
            $scope.clienteId = getParameterByName("clienteId") * 1;
            $scope.esSaldoInicial = getParameterByName("esSaldoInicial") === "true";

            ShowLoader();

            $http.get(GetUrlForService('/AjustesCuenta/DataForCreate'), {params:{clienteId:$scope.clienteId}}).
                success(function(data, status, headers, config) {

                    HideLoader();

                    if (data.error === 0) {

                        $scope.cliente = data.cliente;
                        $scope.tiposAjustes = data.tiposDeAjustes;
                        $scope.motivosAjustes = data.motivosAjustes;
                        $scope.articulos = data.articulos;

                        $scope.agregarNuevoConcepto();
                    }

                }).error(function (data, status, headers, config) { HideLoader(); });
        };

        init();

        $scope.validarAjuste = function() {

            var error = "";

            if (!utiles.isNumeric($scope.obtenerTotal()) || $scope.obtenerTotal() == 0)
                error += "Debe ingresar agregar al menos un articulo con monto mayor a $0";

            if ($scope.ajuste.textoEnMovimiento == null || $scope.ajuste.textoEnMovimiento=="")
                error += "Debe ingresar un valor en el campo 'Texto de registro'. ";

            if ($scope.ajuste.fechaAjuste == null || $scope.ajuste.fechaAjuste == "")
                error += "Debe ingresar un valor en el campo 'Fecha de ajuste'. ";

            if ($scope.ajuste.tipoAjuste_ids == null)
                error += "Debe seleccionar un valor en Tipo de Ajuste. ";

            if ($scope.ajuste.motivoAjuste_ids == null)
                error += "Debe seleccionar un valor en Motivo. ";

            return { message: error, isValid: error === "" };
        };

        $scope.guardarAjuste = function() {
            
            var _validation = $scope.validarAjuste();

            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
                return;
            }

            ShowLoader();

            $scope.ajuste.cliente_id = $scope.clienteId;
            $scope.ajuste.Articulos = $scope.conceptos;

            $http.post(GetUrlForService("/AjustesCuenta/CrearAjuste"), {
                ajuste: $scope.ajuste
            }).
            success(

                function (data, status, headers, config) {

                    if (data.error == 0) {

                        window.location.href = "/Clientes/HistorialMovimientos/"+$scope.clienteId+"?tab=ajustes";

                    } else {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }
                }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };

        $scope.validarSaldoInicial = function () {

            var error = "";

            if (!utiles.isNumeric($scope.saldoInicial.monto))
                error += "Debe ingresar valor correcto en el saldo inicial.";
            
            return { message: error, isValid: error === "" };
        };

        $scope.guardarSaldoInicial = function() {
          
            var _validation = $scope.validarSaldoInicial();

            if (!_validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", _validation.message);
                return;
            }

            ShowLoader();
            
            $http.post(GetUrlForService("/Clientes/AsignarSaldoInicialAClienteConFacturaNoAfip"), {
                clienteId: $scope.clienteId,
                saldoInicial: $scope.saldoInicial.monto * 1
            }).
            success(function (data, status, headers, config) {

                        if (data.error == 0) {

                            window.location.href = "/Clientes/HistorialMovimientos/" + $scope.clienteId + "?tab=ajustes";

                        } else {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }
                    }
                ).error(function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

        };

        $scope.cancelar = function() {
            window.location.href = "/Clientes/HistorialMovimientos/" + $scope.clienteId + "?tab=ajustes";
        };

        $scope.obtenerSubtotalItem = function (item) {

            return utiles.redondear(item.cantidad * item.precioUnitario);
        };

        $scope.obtenerTotal = function () {

            var total = 0;

            for (var j = 0; j < $scope.conceptos.length; j++) {
                total += ($scope.conceptos[j].precioUnitario * 1) * ($scope.conceptos[j].cantidad * 1);
            }

            return total;
        };
        
        $scope.obtenerPorcentajeIva = function (item) {

            var art = obtenerArticulo(item.articulo_id);

            if (art == null)
                return 0;

            if ($scope.cliente.condicionIva_ids === ENUMERACIONES.condicionesIva.consumidorFinal
                || $scope.cliente.condicionIva_ids === ENUMERACIONES.condicionesIva.sujetoExento) {
                item.factorIva = art.factIVAConsF; 
            } else {
                item.factorIva = art.factIVAFacA;
            }
            

            return utiles.redondear((item.factorIva - 1) * 100);
        }

        $scope.agregarNuevoConcepto = function () {
            $scope.conceptos.push({});
        }
        
        $scope.quitarNuevoConcepto = function (index) {
            utiles.quitarItem($scope.conceptos, index);
        }

        var obtenerArticulo = function(articulo_id) {

            for (var i = 0; i < $scope.articulos.length; i++) {
                if (articulo_id == $scope.articulos[i].id)
                    return $scope.articulos[i];
            }

            return null;
        };

    }]);
