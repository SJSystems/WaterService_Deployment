mainApp.controller('repFacturasController', ['$scope', '$http',
function ($scope, $http) {

    $scope.estadoFactura = {
        valor_ids : 0
    }
    $scope.esFacturaElectronica = false;

    var init = function () {
        
        ShowLoader();

        $http.get(GetUrlForService('/Facturacion/ObtenerEstadosFacturas'), {
        }).success(function (data, status, headers, config) {
            HideLoader();
            if (data.error == 0) {
                HideLoader();
                $scope.estadosFactura = data.estadosFactura;
            }

        }).error(function (data, status, headers, config) {
            HideLoader();
        });

    };

    $scope.buscar = function () {
        ShowLoader();

        $http.post(GetUrlForService('/Reportes/ObtenerFacturas'),
        {
            
            fechaCreacionDesde: $scope.desdeHastaCreacion.startDate,
            fechaCreacionHasta: $scope.desdeHastaCreacion.endDate,
            fechaVencimientoDesde: $scope.desdeHastaVencimiento.startDate,
            fechaVencimientoHasta: $scope.desdeHastaVencimiento.endDate,
            clienteId: $scope.clienteSeleccionado == null ? null : $scope.clienteSeleccionado.cliente_id,
            estadoFactura: $scope.estadoFactura.valor_ids == 0 ? null : $scope.estadoFactura.valor_ids,
            esFacturaElectronica: $scope.esFacturaElectronica
           
        }).then(function (resp) {

            HideLoader();

            if (resp.data.error === 0) {

                $scope.facturas = resp.data.facturas;

            } else {
                ShowMessageBox(messageType_Error, "Error", resp.data.message);
            }
        }, function(error) {
            HideLoader();
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
        });
        
    };

    $scope.ExportarCSV = function () {
        if ($scope.facturas.length != 0) {

            $http.post(GetUrlForService("/Reportes/GetFacturasCSV"),
                    {
                        facturas: $scope.facturas
                    }).then(function (resp) {

                        HideLoader();

                        if (resp.data != null) {

                            var file = new Blob([resp.data], {
                                type: 'application/csv'
                            });
                            var fileURL = URL.createObjectURL(file);
                            var a = document.createElement('a');
                            a.href = fileURL;
                            a.target = '_blank';
                            a.download = 'reportFacturas.csv';
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

    init();

}]);