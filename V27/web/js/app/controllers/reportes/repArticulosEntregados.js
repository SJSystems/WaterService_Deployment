
mainApp.controller('repArticulosEntregadosController', ['$scope', '$http',
        function ($scope, $http) {
            
            $scope.init = function () {
                var tablaDetalle = $('#tblDetalle');
                $scope.tablaDetalle = tablaDetalle;
                $scope.tabShowing = 'resumen';
            };

            $scope.showTab = function (tab) {
                $scope.tabShowing = tab;
            }

            $scope.buscar = function() {

                ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerVentasPorRubro"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate,
                    repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                    repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.ventasPorRubro = resp.data.ventasPorRubro;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function(error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };

            $scope.buscarVentaPorArticulos = function (rubroId) {

                ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerVentasPorArticulo"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate,
                    repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                    repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id,
                    rubroId: rubroId == null ? null : rubroId
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.ventasPorArticulo = resp.data.ventasPorArticulo;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };

            $scope.buscarArticulosEntregados = function (rubroId) {

                //ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerArticulosEntregados"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate,
                    repartidorId: $scope.repartidorSeleccionado == null ? null : $scope.repartidorSeleccionado.usuario_id,
                    repartoId: $scope.repartoSeleccionado == null ? null : $scope.repartoSeleccionado.id,
                    rubroId: rubroId == null ? null : rubroId
                }).then(function (resp) {

                   // HideLoader();

                    if (resp.data.error === 0) {

                        $scope.articulosEntregados = resp.data.articulosEntregados;
                    } 
                }, function (error) {

                });

            };

            $scope.verDetalle = function (venta, row) {
                if ($scope.showingVenta != venta) {
                    $scope.showingVenta = venta;
                    $scope.ventasPorArticulo = null;
                    $scope.buscarVentaPorArticulos(venta.rubro_ids);
                    $scope.buscarArticulosEntregados(venta.rubro_ids);
                    $scope.row = row;
                    $('tr#detalle').remove();
                    $('<tr id="detalle"></tr>').insertAfter('#' + row).append('<td></td>').append('<td id="detalle" colspan="4"></td>');
                    $('td#detalle').append($scope.tablaDetalle);
                
                } else {
                    $scope.showingVenta = null;
                    $('tr#detalle').remove();
                }
            }

            $scope.ExportarCSV = function () {
                if ($scope.articulosEntregados.length != 0) {
                    for (i = 0; i < $scope.articulosEntregados.length; i++) {
                        $scope.articulosEntregados[i].fechaRuta = GetDateTimeFromJson($scope.articulosEntregados[i].fechaRuta);
                    }
                    $http.post(GetUrlForService("/Reportes/GetArticulosEntregadosCSV"),
                    {
                        articulosEntregados: $scope.articulosEntregados
                    }).then(function (resp) {

                        HideLoader();

                        if (resp.data != null ) {

                            var file = new Blob([resp.data], {
                                type: 'application/csv'
                            });
                            var fileURL = URL.createObjectURL(file);
                            var a = document.createElement('a');
                            a.href = fileURL;
                            a.target = '_blank';
                            a.download = 'reporteArticulosEntregados.csv';
                            document.body.appendChild(a);
                            a.click();

                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }
                    }, function (error) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
                }
            }

            $scope.init();

            var rellenarCeros = function(valor, cantidad) {

                var v = valor.toString();

                while (v.length < cantidad) {
                    v = "0" + v;
                }

                return v;
            };
        }]
);
