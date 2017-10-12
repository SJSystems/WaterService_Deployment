/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

mainApp.controller('buscarPlanificacionesRepartoController', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

        var init = function() {

            //Obtiene los repartos disponibles
            $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles'), {}).
                then(function(resp, status, headers, config) {

                    $scope.repartosDisponibles = resp.data.repartos;

                    $scope.repartosDisponibles.insert(0, { id: null, nombreReparto: '-- Todos --' });

                }, function(data, status, headers, config) {});
        };

        $scope.clientesResultado = [];

        $scope.abrirSeleccionarClientes = function() {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/js/app/views/repartos/seleccionarClientesParaPlanificacion.html',
                controller: 'seleccionarClientesParaPlanificacion',
                size: 'lg',
                backdrop: 'static'
            });

            modalInstance.result.then(function (idsClientesSeleccionados) {

                abrirDatosDePlanificacion(idsClientesSeleccionados);
            });
        };

        var abrirDatosDePlanificacion = function (idsClientesSeleccionados) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/js/app/views/repartos/datosDePlanificacion.html',
                controller: 'altaPlanificacionController',
                resolve: {
                    idsClientesSeleccionados: function () {
                        return idsClientesSeleccionados;
                    }
                },
                size: 'lg',
                backdrop: 'static'
            });

        };

        $scope.buscarPlanificaciones = function () {

            ShowLoader();
            if ($scope.fechaPlanificacion == "" || $scope.fechaPlanificacion == null) {

                return;
            }

            $http.post(GetUrlForService('/Repartos/BuscarPlanificaciones'),
            {
                repartoId: $scope.repartoSeleccionado.id,
                fecha: $scope.fechaPlanificacion
            }).
            then(function(resp, status, headers, config) {

                HideLoader();
                $scope.planificaciones = resp.data.planificaciones;

            }, function(data, status, headers, config) {
                HideLoader();
            });
        };

        init();

    }]);

mainApp.controller('seleccionarClientesParaPlanificacion', [
    '$scope', '$http', '$uibModalInstance',
    function ($scope, $http, $uibModalInstance) {
        $scope.todosSeleccionados = false;
        $scope.clientesResultado = [];

        $scope.seleccionarClientes = function() {

            ShowLoader();

            var idsClientes = [];

            for (var i = 0; i < $scope.clientesResultado.length; i++) {
                var cliente = $scope.clientesResultado[i];

                if (cliente.seleccionado) {
                    idsClientes.push(cliente.cliente_id);
                }
            }

            $uibModalInstance.close(idsClientes);
        };

        $scope.seleccionarTodos = function () {
            angular.forEach($scope.clientesResultado, function (x) {

                x.seleccionado = $scope.todosSeleccionados;

            });
        };

        $scope.cancelar = function() {

            $uibModalInstance.dismiss('cancel');
        };

    }
]);

mainApp.controller('altaPlanificacionController', [
    '$scope', '$http', '$uibModalInstance', 'idsClientesSeleccionados',
    function ($scope, $http, $uibModalInstance, idsClientesSeleccionados) {
        
        $scope.idsClientesSeleccionados = idsClientesSeleccionados;

        var init = function() {

            //Obtiene los repartos disponibles
            $http.get(GetUrlForService('/TablasSatelites/ObtenerValores'),
                {
                    params: {
                        idsTablas:[700]
                    }
                }).
                then(function(resp, status, headers, config) {

                    $scope.motivosDePlanificacion = resp.data.valores;

                }, function(data, status, headers, config) {});

            $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles'), {}).
                then(function (resp, status, headers, config) {

                    $scope.repartosDisponibles = resp.data.repartos;
                    
                }, function (data, status, headers, config) { });


            HideLoader();
            RunTimer(function() {
                RePrepareView($("#div_datosDePlanificacion"));
            }, 300);
        };
        
        $scope.confirmarPlanificacion = function () {

            ShowLoader();

            $http.post(GetUrlForService("/Repartos/AgregarClientesPlanificados"),
            {
                idsClientes: $scope.idsClientesSeleccionados,
                fecha: $scope.fecha,
                repartoId: $scope.repartoSeleccionado.id,
                motivoId: $scope.motivoDePlanificacion.valor_ids,
                comentarios: $scope.comentarios
            }).then(function(resp) {

                HideLoader();

                if (resp.data.error == 0) {

                    ShowMessageBox(messageType_Success, "Error", "Los clientes se han agregado a la planificación");
                    $uibModalInstance.close(true);
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (resp) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
            });

            
        };

        $scope.cancelar = function () {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    }
]);