mainApp.controller('repCobrosFacturacionController', ['$scope', '$http',
function ($scope, $http) {

    var init = function () {


    };

    $scope.buscar = function () {
        ShowLoader();

        $http.post(GetUrlForService('/Reportes/ObtenerCobrosFacturacion'),
        {

        }).then(function (resp) {

            HideLoader();

            if (resp.data.error === 0) {

                $scope.cobrosFacturacion = resp.data.cobros;

            } else {
                ShowMessageBox(messageType_Error, "Error", resp.data.message);
            }
        }, function (error) {
            HideLoader();
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
        });

    };

    $scope.ExportarCSV = function () {
        if ($scope.cobrosFacturacion.length != 0) {

            $http.post(GetUrlForService("/Reportes/GetCobrosFacturacionCSV"),
                    {
                        cobrosFacturacion: $scope.cobrosFacturacion
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
                            a.download = 'reportCobrosFacturacion.csv';
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