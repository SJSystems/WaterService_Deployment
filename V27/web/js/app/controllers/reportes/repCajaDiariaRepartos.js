
mainApp.controller('repCajaDiariaController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.init = function () {
                $scope.agrupador = 'porDia';
            };

            $scope.buscar = function () {

                ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerCajasDeRepartosPorDia"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate,
                    repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                    repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.cajasDeRepartos = resp.data.cajasDeRepartos;
                        $scope.cajasDeRepartosMensual = resp.data.cajasDeRepartosMensual;
                        $scope.totales = resp.data.totales;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };

            $scope.descargarExcel = function () {

                $scope.descangando = true;

                $http.post(GetUrlForService("/Reportes/ObtenerCajasDeRepartosPorDiaExcel"),
                 {
                     fechaDesde: $scope.desdeHasta.startDate,
                     fechaHasta: $scope.desdeHasta.endDate,
                     repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                     repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id
                 },
                 { responseType: 'arraybuffer' }
                 ).then(function (response) {

                    $scope.descangando = false;

                    var headers = response.headers();
                    var blob = new Blob([response.data], { type: headers['content-type'] });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = "ObtenerCajasDeRepartosPorDia.xlsx";
                    link.click();
                    
                 }, function (error) {
                     $scope.descangando = false;
                     ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                 });
            }

            $scope.mostrarDetallesDeCaja = function(caja) {

                if (caja.detalle != null) {
                    caja.mostrarDetalles = !caja.mostrarDetalles;
                    return;
                }

                $http.get(GetUrlForService("/Reportes/ObtenerDetallesDeCaja"),
                {
                    params: {
                        hojaDeRutaId: caja.id
                    }
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        caja.detalle = resp.data.detalle;
                        caja.mostrarDetalles = !caja.mostrarDetalles;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };

            $scope.obtenerEstiloPorDiferencias = function (item) {
                if (item.saldoDisponible < 0) {
                    return "background-color: #f9d31c;";
                }
                else if (item.saldoDisponible > 0 && item.totalUtilizadoTemporal < item.importe) {
                    return "background-color: #fd5c5c;";
                }  else {
                    return "";
                }
            };

            $scope.init();

        }]
);
