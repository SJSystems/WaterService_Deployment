/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />


mainApp.controller('generacionDeResumenDeCuentaController',
            ['$scope', '$http', '$rootScope', '$uibModalInstance', 'clientes', 
    function ($scope, $http, $rootScope, $uibModalInstance, clientes) {

        $scope.clientes = clientes;
        $scope.todosClientesSeleccionados = false;

        var init = function () {

            obtenerClientesConGeneracionDeResumenDeCuentaActivada();
        };

        var obtenerClientesConGeneracionDeResumenDeCuentaActivada = function() {

            $http.post(GetUrlForService('/Clientes/ObtenerClientesConGeneracionDeResumenDeCuentaActivada'),
                {
                    clientesIds: $scope.clientes.map(function (x) { return x.cliente_id; })
                }
                ).then(function (resp, status, headers, config) {

                if (resp.data.error == 0) {

                    var configClientes = resp.data.clientes;

                    for (var i = 0; i < configClientes.length; i++) {
                        var cl = $scope.clientes.filter(x=> x.cliente_id==configClientes[i].clienteId)[0];
                        cl.seleccionado = configClientes[i].generarResumenDeCuenta;
                    }
                }

            }, function (data, status, headers, config) {
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al generar el reporte.");
            });

        };

        $scope.seleccionarTodos = function () {

            for (var i = 0; i < $scope.clientes.length; i++) {
                var cl = $scope.clientes[i];
                cl.seleccionado = $scope.todosClientesSeleccionados;
            }
        };

        $scope.confirmarGeneracionResumenDeCuenta = function() {

            $scope.momentoInicio = new Date();
            $scope.procesandoResumenes = true;

            var clientesIds = [];

            for (var i = 0; i < $scope.clientes.length; i++) {
                var cl = $scope.clientes[i];
                if (cl.seleccionado == true) {
                    clientesIds.push(cl.cliente_id);
                }
            }

            if (clientesIds.length == 0) {
                ShowMessageBox(messageType_Error, "Error", "Debe seleccionar al menos un cliente para poder generar los resumenes de cuenta");
                return;
            }

            ShowLoader();
            
            $http.post(GetUrlForService('/Reportes/GenerarResumenesDeCuenta'),
            {
                clientesIds: clientesIds,
                fechaDesde: $scope.desdeHasta.startDate,
                fechaHasta: $scope.desdeHasta.endDate
            }).then(function (resp, status, headers, config) {

                HideLoader();
                $scope.procesandoResumenes = false;
                if (resp.data.error == 0) {
                    window.open(resp.data.pathDelReporte);
                } else {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al generar el reporte");
                }
                $scope.momentoFin = new Date();

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al generar el reporte.");
            });
        };

        $scope.cancelar = function() {
            $uibModalInstance.close(null);
        };

        init();
    }]);
