mainApp.controller('repCobrosCuentaCorrienteController', ['$scope', '$http',
function ($scope, $http) {

    $scope.formasPago = {
        valor_ids: 0
    }

    var init = function () {

        ShowLoader();

        $http.get(GetUrlForService('/Facturacion/ObtenerFormasDePago'), {
        }).success(function (data, status, headers, config) {
            HideLoader();
            if (data.error == 0) {
                HideLoader();
                $scope.formasDePago = data.formasDePago;
            }

        }).error(function (data, status, headers, config) {
            HideLoader();
        });
    };

    $scope.buscar = function () {
        ShowLoader();

        $http.post(GetUrlForService('/Reportes/ObtenerCobrosCuentaCorriente'),
        {
            fechaDesde: $scope.desdeHasta.startDate,
            fechaHasta: $scope.desdeHasta.endDate,
            clienteId: $scope.clienteSeleccionado == null ? null : $scope.clienteSeleccionado.cliente_id,
            formaDePago: $scope.formasPago.valor_ids == 0 ? null : $scope.formasPago.valor_ids

        }).then(function (resp) {

            HideLoader();

            if (resp.data.error === 0) {

                $scope.cobrosCuentaCorriente = resp.data.cobros;

            } else {
                ShowMessageBox(messageType_Error, "Error", resp.data.message);
            }
        }, function (error) {
            HideLoader();
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
        });

    };

    $scope.ExportarCSV = function () {
        if ($scope.cobrosCuentaCorriente.length != 0) {

            $http.post(GetUrlForService("/Reportes/GetCobrosCuentaCorrienteCSV"),
                    {
                        cobrosCuentaCorriente: $scope.cobrosCuentaCorriente
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
                            a.download = 'reportCobrosCuentaCorriente.csv';
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