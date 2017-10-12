mainApp.controller('repVentasCobrosPorRepartosController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.busqueda = { repartos: {}, repartidores: {}};

    var init = function () {


    };

    $scope.buscar = function () {
        ShowLoader();

        var idsRepartos = $scope.busqueda.repartos.itemsSelected.map(function (x) { return x.id; });

        $http.post(GetUrlForService('/Reportes/ObtenerVentasYCobrosPorRepartos'),
            {
                desde: $scope.periodo.startDate,
                hasta: $scope.periodo.endDate,
                idsRepartos: idsRepartos,
            }).then(function (resp) {

            HideLoader();

            if (resp.data.error === 0) {

                $scope.datos = resp.data.datos;

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

        var idsRepartos = $scope.busqueda.repartos.itemsSelected.map(function (x) { return x.id; });

        $http.post(GetUrlForService("/Reportes/ObtenerVentasYCobrosPorRepartosExcel"),
            {
                desde: $scope.periodo.startDate,
                hasta: $scope.periodo.endDate,
                idsRepartos: idsRepartos,
            },
            { responseType: 'arraybuffer' }
        ).then(function (response) {

            $scope.descangando = false;

            var headers = response.headers();
            var blob = new Blob([response.data], { type: headers['content-type'] });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "VentasCobrosPorRepartos.xlsx";
            link.click();

        }, function (error) {
            $scope.descangando = false;
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
        });
    };

    init();

}]);