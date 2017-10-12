mainApp.controller('repAntiguedadDeDeudaController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.busqueda = { repartos: {}, estados: {}, tipos: {}, dias: {}};

    var init = function () {


    };

    $scope.buscar = function () {
        ShowLoader();

        var idsRepartos = $scope.busqueda.repartos.itemsSelected.map(function (x) { return x.id; });
        var idsDiasDeVisitas = $scope.busqueda.dias.diasSelected.map(function (x) { return x.id; });
        var idsTipos = $scope.busqueda.tipos.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
        var idsEstados = $scope.busqueda.estados.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });

        $http.post(GetUrlForService('/Reportes/ObtenerAntiguedadDeDeudaDashboard'),
            {
                idsRepartos: idsRepartos,
                idsDiasDeVisitas: idsDiasDeVisitas,
                idsTipos: idsTipos,
                idsEstados: idsEstados
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
        var idsDiasDeVisitas = $scope.busqueda.dias.diasSelected.map(function (x) { return x.id; });
        var idsTipos = $scope.busqueda.tipos.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
        var idsEstados = $scope.busqueda.estados.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });

        $http.post(GetUrlForService("/Reportes/ObtenerAntiguedadDeDeudaExcel"),
            {
                idsRepartos: idsRepartos,
                idsDiasDeVisitas: idsDiasDeVisitas,
                idsTipos: idsTipos,
                idsEstados: idsEstados
            },
            { responseType: 'arraybuffer' }
        ).then(function (response) {

            $scope.descangando = false;

            var headers = response.headers();
            var blob = new Blob([response.data], { type: headers['content-type'] });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "AntiguedadDeDeuda.xlsx";
            link.click();

        }, function (error) {
            $scope.descangando = false;
            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
        });
    };

    init();

}]);