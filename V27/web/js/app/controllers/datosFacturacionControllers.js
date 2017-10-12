/// <reference path="../../General_OnLoad.js" />
var facturacionControllers = angular.module('facturacionControllers', []);

facturacionControllers.controller('ciclosFacturacionCtrl', ['$http',
    function($http) {

        var model = {
            datosFacturacion_id: $("#DatosFacturacionModelo_id").val(),
            cliente_id:0,
            ciclosFacturacion: [],
            EliminarCiclo: function (position) {
                this.ciclosFacturacion.splice(position, 1);
            },
            AgregarCiclo: function() {

                var item = {
                    id: 0,
                    dactosFacturacion_id: $("#DatosFacturacionModelo_id").val(),
                    diaInicio: null,
                    diaFin: null,
                    imputarAbonos: false,
                    facturarAbonoEnInicio: false,
                    facturarAbonoEnFin:false
                };

                this.ciclosFacturacion.push(item);
            },
            GuardarCiclos: function () {
                
                $http.post(GetUrlForService('/Clientes/CiclosDeFacturacion'),
                   {
                       CiclosDeFacturacion: this.ciclosFacturacion,
                       DatosFacturacion_id: $("#DatosFacturacionModelo_id").val()
                   }).
                   success(function (data, status, headers, config) {

                       if (data.error == 0) {

                           $("#dialog_ciclosFacturacion").dialog("close");

                           ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);

                           window.location.reload();
                       }
                       else {

                           Modelo.MostrarErrorCiclos(data.message);
                       }

                   }).
                   error(function(data, status, headers, config) {
                       
                   });

            }
        };

        var self = model;

        //Obengo los siclos actuales
        $http.get(GetUrlForService('/Clientes/CiclosDeFacturacionData/' + model.datosFacturacion_id), {}).
            success(function(data, status, headers, config) {
                self.ciclosFacturacion = data;
            }).error(function (data, status, headers, config) {});

        return model;
      

    }]);

facturacionControllers.controller('diasFacturacionCtrl', [ '$scope','$http',
    
    function ($scope, $http) {

        $scope.cliente_id = $("#ClienteModelo_id").val();
        $scope.diasFacturacion = [];
        $scope.mensajeError = null;
        
        $scope.eliminarDiaFacturacion = function(position) {
            this.diasFacturacion.splice(position, 1);
        };

        $scope.AgregarDiaFacturacion = function () {
            
            var item = {};

            this.diasFacturacion.push(item);

        };

        $scope.guardarDiasFacturacion = function() {

            $http.post(GetUrlForService('/Clientes/GuardarDiasDeFacturacion'),
                {
                    dias: this.diasFacturacion,
                    cliente_id: $scope.cliente_id
                }).
                success(function(data, status, headers, config) {

                    if (data.error == 0) {

                        $("#dialog_diasFacturacion").dialog("close");

                        ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);

                        window.location.reload();
                        
                    } else {

                        $scope.mensajeError = data.message;
                    }

                }).
                error(function(data, status, headers, config) {

                });
        };

        $scope.init = function () {
            
            //Obengo los dias de facturacion actuales
            $http.get(GetUrlForService('/Clientes/ObtenerDiasDeFacturacion')+'&cliente_id=' + $scope.cliente_id, {}).
                success(function (data, status, headers, config) {
                    $scope.diasFacturacion = data.data;
                }).error(function (data, status, headers, config) { });
        };

        $scope.init();

      
    }]);