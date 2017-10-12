mainApp.controller('repMantenimientosPorDispenserController', ['$scope', '$http',
function ($scope, $http) {

    $scope.dispenser = {};
    $scope.mantenimientos = [];

    var init = function () {
        $scope.dispenser_id = getParameterByName("dispenserId") * 1;

        ShowLoader();

        $http.get(GetUrlForService('/Dispensers/ObtenerDispenser'), {
            params: {
                dispenser_id: $scope.dispenser_id
            }
        }).success(function (data, status, headers, config) {
            HideLoader();
            if (data.error == 0) {
                HideLoader();
                $scope.dispenser = data.dispenser;
            }

        }).error(function (data, status, headers, config) {
            HideLoader();
        });

    };

    $scope.buscar = function () {
        ShowLoader();

        $http.get(GetUrlForService('/ServiciosTecnicos/ObtenerMantenimientosPorDispenser'), {
            params: {
                dispenserId: $scope.dispenser_id
            }
        }).success(function (data, status, headers, config) {
            HideLoader();
            if (data.error == 0) {
                HideLoader();
                $scope.mantenimientos = data.mantenimientos;
            }

        }).error(function (data, status, headers, config) {
            HideLoader();
        });
    };

    $scope.ExportarCSV = function () {
        if ($scope.mantenimientos.length != 0) {

            $http.post(GetUrlForService("/Reportes/GetMantenimientosCSV"),
                    {
                        mantenimientos: $scope.mantenimientos
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
                            a.download = 'reportMantenimientos.csv';
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