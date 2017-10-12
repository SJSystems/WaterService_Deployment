/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarArticulosController', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

        var init = function () {

        };

        $scope.abrirMovimientoDeStock = function (articuloId) {
            
            var modal = $uibModal.open({
                templateUrl: '/js/app/views/articulos/altaMovimientoDeStock.html',
                controller: 'altaMovimientoDeStockController',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    articuloId: articuloId,
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar(true);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false);
            });

        };

        init();

    }]);

mainApp.controller('altaMovimientoDeStockController', ['$scope', '$http', '$uibModalInstance', 'articuloId',
    function ($scope, $http, $uibModalInstance, articuloId) {

        $scope.movimiento = { articulo_id: articuloId, costo: "", cantidad:"" };

        var init = function () {

            $http.get(GetUrlForService('/Articulos/GetDataForMovimientoDeStock'),
                {
                    params: {
                        articuloId: $scope.movimiento.articulo_id
                    }
                }).
              then(function (resp) {

                  if (resp.data.error == 0) {

                      $scope.articulo = resp.data.articulo;
                      $scope.motivos = resp.data.motivos;

                      $scope.movimiento.motivoMovimiento_ids = $scope.motivos[0].valor_ids;
                  }
              });

        };

        var validar = function () {

            if ($scope.movimiento.costo * 1 == 0) return { isValid: false, message: "Debe ingresar un costo." }

            if ($scope.movimiento.cantidad * 1 == 0) return { isValid: false, message: "Debe ingresar una cantidad." }

            return { isValid: true };
        };

        $scope.guardar = function () {

            ShowLoader();

            var validacion = validar();

            if (!validacion.isValid) {
                ShowMessageBox(messageType_Error, "Error", validacion.message);
                HideLoader();
                return;
            }

            $http.post(GetUrlForService('/Articulos/GuardarMovimientoDeStock'),
            {
                movimiento: $scope.movimiento

            }).then(function (resp) {

                if (resp.data.error == 0) {
                    HideLoader();
                    $uibModalInstance.close();
                    ShowMessageBox(messageType_Success, "Exitoso", "Se ha guardado movimiento de stock.");
                } else {
                    HideLoader();
                    $uibModalInstance.close();
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

            }, function (data, status, headers, config) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar el movimiento de stock.");
            });

        };

        $scope.cancelar = function () {
            $uibModalInstance.dismiss();
        };

        init();

    }]);