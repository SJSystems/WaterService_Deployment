
mainApp.controller('migracionDeVentasController', ['$scope', '$http', 'fileUploaderService',
    function ($scope, $http, fileUploaderService) {

        $scope.migracion = {};
        $scope.procesandoArchivos = false;

        var init = function() {


        };

        $scope.subirArchivos = function() {
            try {
                $scope.procesandoArchivos = true;
                $scope.resultadoMigracion = "Procesando...";
                fileUploaderService.uploadFiles($scope.migracion, GetUrlForService('/HojasDeRuta/MigrarVentasTemporales'))
                .then(function(resp) {
                    if (resp.error == 0) {
                        $scope.resultadoMigracion = resp.resultado;
                    } else {
                        $scope.resultadoMigracion = "Error:" +resp.message;
                    }
                });

            } catch (e) {
                $scope.procesandoArchivos = false;
                $scope.resultadoMigracion = "Error al procesar";
            } 

        };

        init();
    }]);