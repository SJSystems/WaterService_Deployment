
mainApp.controller('importarCobrosController', ['$scope', '$http', 'fileUploaderService',
    function ($scope, $http, fileUploaderService) {

        $scope.importacion = {
            idAgencia:1
        };

        $scope.agencias = [
            { id: 1, nombre: 'PagoMisCuentas' },
            { id: 2, nombre: 'Rapipago' },
        ];

        $scope.procesandoArchivos = false;
        
        var init = function() {


        };

        $scope.subirArchivos = function() {
            try {
                $scope.procesandoArchivos = true;

                fileUploaderService.uploadFiles($scope.importacion, GetUrlForService('/Facturacion/SubirArchivoDeCobranzas'))
                .then(function (resp) {
                    $scope.procesandoArchivos = false;
                    if (resp.error == 0) {
                        
                        ShowMessageBox(messageType_Success, "Exitoso",
                                    "La importación se ha realizado exitósamente.");

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.message);
                    }
                },function(resp) {
                    $scope.procesandoArchivos = false;
                });

            } catch (e) {
                $scope.procesandoArchivos = false;
            } 

        };

        $scope.buscarCobranzas = function() {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/BuscarCobranzas'), {
                desde: $scope.fechaDesde,
                hasta: $scope.fechaHasta,
                idAgencia: $scope.importacion.idAgencia})
                .then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {
                            
                        if (resp.data.idAgencia == 1) {
                            $scope.cobranzasPMC = resp.data.cobranzas;
                        } else if (resp.data.idAgencia == 2) {
                            $scope.cobranzasRP = resp.data.cobranzas;
                        }

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                            
                }, function (resp) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        
        //=========================================================================================================
        $scope.imputarCobranzaPagoMisCuentas = function (cobranza) {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/ImputarCobranzaPagoMisCuentas'), {
                    idCobranza: cobranza.id
                })
                .then(function(resp) {

                    HideLoader();

                    ShowMessageBox(messageType_Success, "Exitoso", "Se han imputado los cobros. Alguno puede tener un error individual. Verifiquelo buscándolo por fecha.");

                }, function(resp) {
                    $scope.buscarCobranzas();
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.imputarDetalleDeCobranzaPagoMisCuentas = function (detalle) {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/ImputarDetalleDeCobranzaPagoMisCuentas'), {
                idDetalleCobranza: detalle.id
            })
                .then(function (resp) {

                    $scope.buscarCobranzas();
                    HideLoader();

                    ShowMessageBox(messageType_Success, "Exitoso", "Se han imputado el cobro.");

                }, function (resp) {

                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.eliminarCobranzaPagoMisCuentas = function (cobranza) {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/EliminarCobranzaPagoMisCuentas'), {
                idCobranza: cobranza.id
            })
                .then(function (resp) {

                    $scope.buscarCobranzas();
                    HideLoader();

                    ShowMessageBox(messageType_Success, "Exitoso", "La cobranza se ha eliminado, debe subirla nuevamente");

                }, function (resp) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };
        //=========================================================================================================
        $scope.imputarCobranzaRapipago = function (cobranza) {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/ImputarCobranzaRapipago'), {
                idCobranza: cobranza.id
            })
                .then(function (resp) {

                    HideLoader();

                    ShowMessageBox(messageType_Success, "Exitoso", "Se han imputado los cobros. Alguno puede tener un error individual. Verifiquelo buscándolo por fecha.");

                }, function (resp) {
                    $scope.buscarCobranzas();
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        $scope.imputarDetalleDeCobranzaRapipago = function (detalle) {

            ShowLoader();

            $http.post(GetUrlForService('/Facturacion/ImputarDetalleDeCobranzaRapipago'), {
                idDetalleCobranza: detalle.id
            })
                .then(function (resp) {

                    $scope.buscarCobranzas();
                    HideLoader();

                    ShowMessageBox(messageType_Success, "Exitoso", "Se han imputado el cobro.");

                }, function (resp) {

                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });
        };

        //=========================================================================================================

        init();
    }]);