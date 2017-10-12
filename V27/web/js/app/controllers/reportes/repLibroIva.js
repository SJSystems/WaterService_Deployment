
mainApp.controller('repLibroIvaController', ['$scope', '$http',
        function ($scope, $http) {
            
            $scope.init = function () {

                $http.get(GetUrlForService("/Reportes/GetDataForLibroIva"))
                    .then(function (resp) {

                        HideLoader();

                        if (resp.data.error === 0) {

                            $scope.centros = resp.data.centros;

                            if ($scope.centros.length > 0) {
                                $scope.centroId = $scope.centros[0].id;
                            }

                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }
                    }, function (error) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
            };

            $scope.descargarZipComprobantes = function () {

                ShowLoader();

                $http.get(GetUrlForService("/Reportes/ObtenerPathPdfsDuplicados"),
                    {
                        params: {
                            periodo: $scope.periodoFiscal,
                            centroDeFacturacionId : $scope.centroId
                        }
                    }).then(function (resp) {

                        HideLoader();

                        if (resp.data.error === 0) {

                            var path = resp.data.pathArchivoZip;
                            var win = window.open(path, '_blank');
                            win.focus();

                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }
                    }, function (error) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    });
            };

            $scope.buscar = function() {

                ShowLoader();

                $http.get(GetUrlForService("/Reportes/ObtenerLibroIva"),
                {
                    params: {
                        periodo: $scope.periodoFiscal,
                        centroFacturacionId: $scope.centroId
                    }
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error === 0) {

                        $scope.comprobantes = resp.data.comprobantes.items;
                        $scope.totales = resp.data.comprobantes.totales;
                        $scope.total = resp.data.comprobantes.total;

                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }
                }, function(error) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                });

            };

            $scope.obtenerComprobante = function (comp) {

                var idComprobante = "(" + rellenarCeros(comp.tipoComprobanteAfip_id, 3) + ")";
                var codigoComprobante = comp.comprobanteAFIPCodigo;
                var puntoDeVenta = rellenarCeros(comp.puntoDeVenta, 4);
                var numComp = rellenarCeros(comp.numeroComprobante, 8);
                
                return idComprobante + " " + codigoComprobante + " " + puntoDeVenta + "-" + numComp + "/" + numComp;
            };

            $scope.obtenerDocumento = function (comp) {
                return comp.condicionIva_ids == 2 ? comp.dniPersona : comp.cuit;
            };

            $scope.ExportarCSV = function () {
                if ($scope.comprobantes.length != 0) {
                    for (i = 0; i < $scope.comprobantes.length; i++) {
                        $scope.comprobantes[i].fecha = GetDateTimeFromJson($scope.comprobantes[i].fecha);
                    }
                    $http.post(GetUrlForService("/Reportes/GetLivroIVACSV"),
                    {
                        comprobantes:$scope.comprobantes
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
                            a.download = 'reportLibroIVA.csv';
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

            $scope.expotarComprobantes = function () {

                var win = window.open("/Reportes/ObtenerComprobantesParaExportar?centroDeFacturacionId="+$scope.centroId+"&periodo=" + $scope.periodoFiscal, '_blank');
                win.focus();
            };

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
