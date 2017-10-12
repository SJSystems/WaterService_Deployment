
mainApp.controller('repGestionesPorHojaDeRutaController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.init = function () {
                $scope.agrupador = 'porDia';
            };

            $scope.buscar = function () {

                ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerGestionesPorHojaDeRuta"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate,
                    repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                    repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.reporte = resp.data.reporte;

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

                $http.post(GetUrlForService("/Reportes/ObtenerGestionesPorHojaDeRutaExcel"),
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
                    link.download = "EnvasesPorHojaDeRuta.xlsx";
                    link.click();
                    
                 }, function (error) {
                     $scope.descangando = false;
                     ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                 });
            }

            $scope.init();

        }]
);
