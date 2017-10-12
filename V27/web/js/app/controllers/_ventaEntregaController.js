/// <reference path="../../General_OnLoad.js" />
var mainApp = angular.module(
   'app_ventaEntrega',
    [
        'ventaEntregaControllers'
    ]
);

var facturacionControllers = angular.module('ventaEntregaControllers', []);

facturacionControllers.controller('facturasPendientesCtrl', ['$http',
    function ($http) {

        var model = {
            facturas: [],
            obtenerTotalPagado: function () {
                var total = 0;

                for (var i = 0; i < facturas.length; i++) {
                    total += facturas[i].monto;
                }
                
                return total;
            }
        };

        return model;

    }]);
