
mainApp.controller('repEstadosDeCuentasClientesController', ['$scope', '$http',
        function ($scope, $http) {

            $scope.busqueda = { repartos: {}, estados: {}, tipos: {}, dias: {}};
            $scope.repartosSeleccionados = null;

            var init = function () {

                setNumericControl();
            };

            var obtenerParametros = function () {

                var idsRepartos = $scope.busqueda.repartos.itemsSelected == null ? null : $scope.busqueda.repartos.itemsSelected.map(function (x) { return x.id; });
                var idsTiposClientes = $scope.busqueda.tipos.valorSateliteSeleccionado == null ? null : $scope.busqueda.tipos.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
                var idsDiasDeSemana = $scope.busqueda.dias.diasSelected == null ? null : $scope.busqueda.dias.diasSelected.map(function (x) { return x.id; });;
                var idsEstados = $scope.busqueda.estados.valorSateliteSeleccionado == null ? null : $scope.busqueda.estados.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });

                var diasUltimaEntrega = $("#diasUltimaEntrega").val() * 1;
                var diasUltimoCobro = $("#diasUltimoCobro").val() * 1;

                var params = {
                    idsRepartos: idsRepartos,
                    idsTiposClientes: idsTiposClientes,
                    idsDiasDeSemana: idsDiasDeSemana,
                    idsEstados: idsEstados,
                    diasUltimaEntrega: diasUltimaEntrega,
                    diasUltimoCobro: diasUltimoCobro
                };

                return params;
            }

            $scope.buscar = function () {

                ShowLoader();
                
                $http.get(GetUrlForService("/Reportes/ObtenerEstadosDeCuentasClientes"),
                {
                    params: obtenerParametros()
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.resultado = resp.data.resultado;

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

                $http.post(GetUrlForService("/Reportes/ObtenerEstadosDeCuentasClientesExcel"), obtenerParametros(),
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

            init();

        }]
);
