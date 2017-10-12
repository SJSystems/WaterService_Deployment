/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarDispensersController', ['$scope', '$http', 'dispensersService',
        function ($scope, $http, dispensersService) {
           
            $scope.init = function () {
                
            };

            $scope.init();

            $scope.verMantenimientos = function (dispenserId) {

                dispensersService.verMantenimientos(dispenserId, null);

            };

        }]
);


mainApp.controller('seleccionarDispenserController',
            ['$scope', '$http', '$rootScope', '$uibModalInstance', 'seleccionarDispensersDeCliente',
                'clienteActual', 'dispensersSeleccionados', 'ocultarBloqueados', 'soloFuncionalesEnPlaya',
    function ($scope, $http, $rootScope, $uibModalInstance, seleccionarDispensersDeCliente,
        clienteActual, dispensersSeleccionados, ocultarBloqueados, soloFuncionalesEnPlaya) {

        $scope.busqueda = { ocultarBloqueados: ocultarBloqueados, soloFuncionalesEnPlaya: soloFuncionalesEnPlaya };

        var init = function () {

            ShowLoader();

            $http.get(GetUrlForService('/Dispensers/GetDataForBuscarDispenser'))
                .then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {

                        $scope.tiposDeDispensers = resp.data.tiposDeDispensers;
                        $scope.condicionesDeDispensers = resp.data.condicionesDispensers;
                        $scope.tiposDeContratos = resp.data.tiposDeContratos;
                        $scope.estadosDispensers = resp.data.estadosDispensers;
                        $scope.ubicaciones = resp.data.ubicaciones;
                        $scope.colores = resp.data.colores;
                    }

                }, function (resp) { HideLoader(); });

            RunTimer(function () { }, 300);
        };

        $scope.confirmarSeleccionDeDispensers = function () {

            var dispensersSeleccionados = [];
            for (var i = 0; i < $scope.dispensers.length; i++) {
                if ($scope.dispensers[i].seleccionado == true) {
                    dispensersSeleccionados.push(angular.copy($scope.dispensers[i]));
                }
            }

            $uibModalInstance.close(dispensersSeleccionados);
        };

        $scope.dispenserYaSeleccionado = function (dispenser) {

            if (dispensersSeleccionados == null)
                return false;

            for (var i = 0; i < dispensersSeleccionados.length; i++)
                if (dispenser.id == dispensersSeleccionados[i].id)
                    return true;

            return false;
        };

        $scope.buscarDispensers = function () {

            ShowLoader();

            $http.get(GetUrlForService('/Dispensers/BuscarDispensers'),
                {
                    params: {
                        clienteId: seleccionarDispensersDeCliente ? clienteActual.cliente_id : null,
                        numeroInterno: $scope.busqueda.numeroInterno,
                        tipoDispenser_ids: $scope.busqueda.tipoDispenser_ids,
                        condicionActual_ids: $scope.busqueda.condicionActual_ids,
                        color_ids: $scope.busqueda.color_ids,
                        estadoDispenserActual_ids: $scope.busqueda.estadoDispenserActual_ids,
                        ubicacionActual_ids: $scope.busqueda.ubicacionActual_ids,
                        ocultarBloqueados: $scope.busqueda.ocultarBloqueados,
                        soloFuncionalesEnPlaya: $scope.busqueda.soloFuncionalesEnPlaya,
                    }
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {

                        $scope.dispensers = resp.data.dispensers;
                    }

                }, function (resp) { HideLoader(); });

            RunTimer(function () { }, 300);
        };

        init();
    }]);

mainApp.controller('verMantenimientosDeDispensers', ['$scope', '$http', 'dispenserId',
    function ($scope, $http, dispenserId) {

        $scope.dispenserId = dispenserId;

        var init = function () {

            ShowLoader();

            $scope.servicioTecnicoId = getParameterByName("id") * 1;

            $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerMantenimientosPorDispenser'),
            {
                params: {
                    dispenserId: $scope.dispenserId
                }
            }).then(function (resp, status, headers, config) {

                HideLoader();

                if (resp.data.error == 0) {

                    $scope.mantenimientos = resp.data.mantenimientos;
                    
                    RunTimer(function () {
                        RePrepareView($("#div_mantenimientos"));
                    }, 300);
                }
            }, function () {
                HideLoader();
            });

        };

        init();
    }]);

