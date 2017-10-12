
mainApp.controller('repErroresDeEmails', ['$scope', '$http',
        function ($scope, $http) {

            $scope.init = function () {
                
            };

            $scope.buscar = function () {

                ShowLoader();

                $http.post(GetUrlForService("/Reportes/ObtenerErroresDeEmail"),
                {
                    fechaDesde: $scope.desdeHasta.startDate,
                    fechaHasta: $scope.desdeHasta.endDate
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.comprobantes = resp.data.comprobantes;
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function (error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };
            
            $scope.init();

        }]
);
