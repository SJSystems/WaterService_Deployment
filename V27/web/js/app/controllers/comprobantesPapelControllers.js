mainApp.controller('buscarComprobantesPapelCtrl',
                ['$scope', '$http', '$uibModal',
        function ($scope, $http, $uibModal) {
            $scope.totalFacturas = 0;
            // Declaraciones:
            $scope.comprobantes = {};
            $scope.soloPendientes = false;
            
            // Métodos:
            $scope.Init = function () {
                ShowLoader();

                $http.get(GetUrlForService("/ComprobantesFisicos/GetDataForBuscarTipoPapel"), {})
                 .success(function (data, status, headers, config) {
                     if (data.error == 0) {
                         $scope.centros = data.centros;
                         $scope.centros.insert(0, { id: 0, razonSocial: '--seleccione--' });
                         $scope.centroId = 0;

                         $scope.tiposComprobantes = data.tiposComprobantes;
                         $scope.tiposComprobantes.insert(0, { valor_ids: 0, valorTexto: '--seleccione--' });
                         $scope.tipoComprobanteId = 0;
                     }

                     HideLoader();
                 })
                 .error(function (data) {
                     HideLoader();
                 });
            };

            $scope.ValidarCampos = function () {
                var msj = "";

                if ($scope.centroId == null || $scope.centroId == 0)
                    msj = msj + "Debe seleccionar un centro de facturación. ";

                if ($scope.tipoComprobanteId == null || $scope.tipoComprobanteId == 0)
                    msj = msj + "Debe seleccionar un tipo de comprobante. ";

                if ($scope.fechaDesde == null || $scope.fechaDesde == "")
                    msj = msj + "Debe ingresar una fecha Desde. ";

                if ($scope.fechaHasta == null || $scope.fechaHasta == "")
                    msj = msj + "Debe ingresar una fecha Hasta. ";

                return { isValid: (msj == ""), message: msj };
            };

            $scope.BuscarComprobantes = function () {

                ShowLoader();

                var validation = $scope.ValidarCampos();

                if (!validation.isValid) {

                    ShowMessageBox(messageType_Error, "Error de validación: ", validation.message);

                    HideLoader();
                }
                else {

                    $http.post(GetUrlForService("/ComprobantesFisicos/BuscarComprobantesPapel"),
                    {
                        fechaDesde: $scope.fechaDesde,
                        fechaHasta: $scope.fechaHasta,

                        centroId: $scope.centroId == 0 ? null : $scope.centroId,
                        tipoComprobanteId: $scope.tipoComprobanteId == 0 ? null : $scope.tipoComprobanteId,
                        soloPendientes: $scope.soloPendientes
                    })
                    .then(function (resp) {

                        if (resp.data.error == 0) {

                            $scope.comprobantes = resp.data.comprobantes;
                            $scope.totalFacturas = 0;
                            angular.forEach($scope.comprobantes, function (item, i) {

                                item.orden = i + 1;
                                $scope.totalFacturas = $scope.totalFacturas + (item.montoTotal == null ? 0 : item.montoTotal);
                            });

                            HideLoader();

                            RunTimer(function () { RePrepareView($("#tablaResultado")); }, 200);
                        }

                    }, function (resp) {
                        console.log('...error al llamar método /ComprobantesFisicos/BuscarComprobantesPapel');
                        HideLoader();
                    });
                }
            };

            $scope.AsignarNro = function (pComprobante) {
               
                var modal = $uibModal.open({
                    templateUrl: '/js/app/views/comprobantesFisicos/asignarNros.html',
                    controller: 'asignarNrosComprobantesCtrl',
                    size: 'md',
                    backdrop: 'static',
                    resolve: {
                        comprobante: function () { return angular.copy(pComprobante); }
                    }
                });
                modal.result.then(function () {

                    $scope.BuscarComprobantes();
                }
                , function () {
                });
            };
            
            // Llamadas:
            $scope.Init();

            $scope.asignarNumeroDeComprobante = function (comprobante) {

                var comprobantes = $scope.comprobantes.filter(function (x) { return x.orden >= comprobante.orden; });
                var nroAsignado = comprobante.nroAsignado * 1;
                var fechaComprobante = comprobante.fechaAsignada;

                angular.forEach(comprobantes, function (item, i) {

                    item.nroAsignado = nroAsignado + i;
                    item.fechaAsignada = fechaComprobante;

                });
            };

            $scope.asignarNumeracionAComprobantes = function () {

                bootbox.confirm("Está seguro que desea asignar la numeración a los comprobantes que aparecen en pantalla?",
                    function (result) {

                        if (result) {

                            ShowLoader();

                            var comprobantes = $scope.comprobantes.map(
                                function (x) { return { comprobanteId: x.id, nroAsignado: x.nroAsignado, fecha: x.fechaAsignada }; }
                            );

                            $http.post(GetUrlForService("/ComprobantesFisicos/AsignarNumeracionAComprobantes"),
                                {
                                    comprobantes: comprobantes
                                })
                                .success(function (data) {

                                    HideLoader();

                                    if (data.error == 0) {

                                        ShowMessageBox(messageType_Success, "Comprobante guardado con éxito.");
                                        $scope.BuscarComprobantes();
                                    }
                                    else {
                                        ShowMessageBox(messageType_Error, "Error al Guardar. " + data.message);
                                    }
                                })
                                .error(function (data) {
                                    HideLoader();
                                    ShowMessageBox(messageType_Error, "Error al Guardar." + data.message);                                   
                                });

                        }
                    });
            };

        }]);

mainApp.controller('asignarNrosComprobantesCtrl',
            ['$scope', '$http', 'comprobante', '$uibModalInstance',
    function ($scope,   $http,   comprobante,   $uibModalInstance) {

        // Declaraciones:
        $scope.comprobanteXAsignar = comprobante;
        $scope.soloUno = false;

        // Métodos:
        $scope.Init = function () {
            $scope.tituloAccion = "Asignar número de comprobante";
            
        };

        $scope.Save = function () {
            ShowLoader();

            if ($scope.comprobanteXAsignar.numeroComprobante == "" || $scope.comprobanteXAsignar.numeroComprobante == null) {
                ShowMessageBox(messageType_Error, "Error de validación", "Ingrese el número del comprobante.");
            }
            else {
                

                //var fechaConvertida = new Date($scope.comprobanteXAsignar.fechaFactura.match(/\d+/)[0] * 1);
                //$scope.comprobanteXAsignar.fechaFactura = fechaConvertida;

                $http.post(GetUrlForService("/ComprobantesFisicos/Save"),
                    {
                        //comprobante: $scope.comprobante,
                        comprobanteId: $scope.comprobanteXAsignar.id,
                        nroComprobante: $scope.comprobanteXAsignar.numeroComprobante,
                        soloUno: $scope.soloUno
                    })
                .success(function (data) {

                    if (data.error == 0) {
                        //$scope.comprobante = {};

                        ShowMessageBox(messageType_Success, "Comprobante guardado con éxito.");
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al Guardar. " + data.message);
                    }

                    HideLoader();
                    $uibModalInstance.close();

                })
                .error(function (data) {
                    HideLoader();
                    console.log('... volvio por el error() del post /ComprobantesFisicos/Save');

                    ShowMessageBox(messageType_Error, "Error al Guardar." + data.message);
                    $uibModalInstance.close();
                });
            }
        };

        $scope.Cerrar = function () {
            $uibModalInstance.dismiss();
        };

        // Llamadas:
        $scope.Init();
    }]);


