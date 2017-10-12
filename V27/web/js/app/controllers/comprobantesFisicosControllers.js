/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarRangosDeComprobantesFisicosController',
            ['$scope', '$http', '$rootScope', '$uibModal', 
    function ($scope ,  $http ,  $rootScope ,  $uibModal  ) {

        $scope.rangoActivo = true;

        var onInit = function () {

            $http.get(GetUrlForService('/ComprobantesFisicos/GetDataForBuscar'), {})
               .then(function (resp) {

                   HideLoader();

                   if (resp.data.error == 0) {
                       $scope.repartos = resp.data.repartos;
                       $scope.repartos.insert(0, { id: 0, nombreReparto: '--Todos--' });
                       $scope.repartoId = 0;
                   }

               }, function (resp) { HideLoader(); });
        };

        $scope.buscar = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ComprobantesFisicos/Buscar'),
                {
                    fechaDesde: $scope.fechaDesde,
                    fechaHasta: $scope.fechaHasta,
                    repartoId: $scope.repartoId == 0 ? null : $scope.repartoId,
                    activo: $scope.rangoActivo,
                    prefijo: $scope.prefijo,
                    nroComprobante: $scope.nroComprobante,
                })
              .then(function (resp) {

                  HideLoader();

                  if (resp.data.error == 0) {
                      $scope.rangos = resp.data.rangos;
                  }

              }, function (resp) { HideLoader(); });
        };

        $scope.eliminarRango = function (rango, index) {
            
            var mensaje = "Confirma eliminar el rango de comprobantes físicos seleccionado?";

            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    ShowLoader();

                    var indexActual = index;

                    $http.post(GetUrlForService('/ComprobantesFisicos/EliminarRango'),
                        {
                            rangoId: rango.id
                        })
                      .then(function (resp) {

                          if (resp.data.error == 0) {
                              HideLoader();
                              utiles.quitarItem($scope.rangos, indexActual);
                          } else {
                              ShowMessageBox(messageType_Error, "Error", resp.data.message);
                          }

                      }, function (resp) { HideLoader(); });

                }
            });
           
        };

        $scope.intactivarRango = function (rango) {

            var mensaje = "Confirma desactivar el rango de comprobantes físicos seleccionado?";

            bootbox.confirm(mensaje, function (result) {

                if (result) {

                    ShowLoader();

                    $http.post(GetUrlForService('/ComprobantesFisicos/InactivarRangoDeComprobantes'),
                        {
                            rangoId: rango.id
                        })
                      .then(function (resp) {

                          if (resp.data.error == 0) {
                              HideLoader();
                              rango.activo = false;
                          } else {
                              ShowMessageBox(messageType_Error, "Error", resp.data.message);
                          }

                      }, function (resp) { HideLoader(); });

                }
            });

        };


        $scope.abrirNuevo = function () {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/comprobantesFisicos/nuevoRangoDeComprobanteFisico.html',
                controller: 'nuevoRangoDeComprobanteFisicoController',
                size: 'lg',
                backdrop: 'static'                
            });

            modal.result.then(function () {
                
            }, function () {
                
            });
        };

        onInit();

    }]);

mainApp.controller('nuevoRangoDeComprobanteFisicoController',
            ['$scope', '$http', '$uibModalInstance', 
    function ($scope ,  $http ,  $uibModalInstance ) {

        $scope.rango = {};

        var init = function () {

            $http.get(GetUrlForService('/ComprobantesFisicos/GetDataForNuevo'), {})
               .then(function (resp) {

                   HideLoader();

                   if (resp.data.error == 0) {
                       $scope.repartos = resp.data.repartos;
                       $scope.tiposComprobantes = resp.data.tiposComprobantes;

                       $scope.rango.reparto_id = $scope.repartos[0].id;
                       $scope.rango.tipoDeComprobanteFisico_ids = $scope.tiposComprobantes[0].valor_ids;
                   }

               }, function (resp) { HideLoader(); });
        };

        init();

        $scope.guardar = function () {

            ShowLoader();

            $http.post(GetUrlForService('/ComprobantesFisicos/CrearRango'),
                {
                    rango: $scope.rango
                })
              .then(function (resp) {

                  HideLoader();

                  if (resp.data.error == 0) {

                      $uibModalInstance.close('');
                  } else {
                      ShowMessageBox(messageType_Error, "Error", resp.data.message);
                  }

              }, function (resp) { HideLoader(); });
        };

        $scope.cancelar = function () {
            $uibModalInstance.close('');
        };

    }]);
