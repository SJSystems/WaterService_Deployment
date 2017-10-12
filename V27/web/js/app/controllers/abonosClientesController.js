/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('abonoClientesCtrl', ['$scope', '$http', '$uibModal', 'dispensersService',
        function ($scope, $http, $uibModal, dispensersService) {
            
            //declaraciones
            $scope.modelo = {
                clienteActual_id:0,
                clienteSeleccionado: null,
                
                dispenser: null,
                textDispenser: "",
                
                abono_id: 0,
            };
            var aux_ultimoTexto = "";
            $scope.mensajeError = "";
            
            $scope.sucursalesDisponibles = [];
            
            $scope.AbrirDialogo_AgregarDispenser = function (abono_id) {

                $scope.modelo.abono_id = abono_id;
                
                var onSeleccionarDispensers = function (haConfirmado, dispensersSeleccionados) {

                    if (haConfirmado && dispensersSeleccionados != null) {
                      
                        $scope.ConfirmarAgregarDispensers(dispensersSeleccionados.map(function (x) { return x.id; }), $scope.modelo.abono_id);
                    }
                };

                dispensersService.seleccionarDispensers(false, null, [], false, onSeleccionarDispensers);

            };

            $scope.validarAsignacionDispenser = function() {

                var mensaje = "";

                if ($scope.modelo.dispenser == null)
                    mensaje += "Debe seleccionar un dispenser";
                
                if ($scope.modelo.clienteSeleccionado == null)
                    mensaje += "Debe seleccionar una locación";

                return { isValid: mensaje == "", message: mensaje };
            };

            $scope.ConfirmarAgregarDispenser = function () {
                
                ShowLoader();
                
                $http.post(GetUrlForService("/AbonosCliente/AsignarDispenserAAbono"), {
                    abono_id: $scope.modelo.abono_id,
                    dispenser_id: $scope.modelo.dispenser.id,
                    cliente_id: $scope.modelo.clienteSeleccionado.cliente_id
                }).
                success(
                    function (data, status, headers, config) {
                        
                        HideLoader();
                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Confirmación", data.message);
                            window.location.reload();

                        } else {
                            
                            $scope.mensajeError = data.message;
                            //ShowMessageBox(messageType_Error, "Error", data.message);
                        }

                    }
                    ).error(function (data) {
                        HideLoader();
                        //ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        $scope.mensajeError = data.message;
                    });

            };
            
            $scope.ConfirmarAgregarDispensers = function (idsDispensers, abonoId) {

                ShowLoader();

                $http.post(GetUrlForService("/AbonosCliente/AsignarDispensersAAbono"), {
                    abono_id: abonoId,
                    idsDispensers: idsDispensers,
                    cliente_id: $scope.modelo.clienteSeleccionado.cliente_id
                }).
                success(
                    function (data, status, headers, config) {

                        HideLoader();
                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Confirmación", data.message);
                            window.location.reload();

                        } else {

                            $scope.mensajeError = data.message;
                            //ShowMessageBox(messageType_Error, "Error", data.message);
                        }

                    }
                    ).error(function (data) {
                        HideLoader();
                        //ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        $scope.mensajeError = data.message;
                    });

            };
            
            $scope.QuitarDispenserDeAbono = function (_dispenser_id) {
                
                ShowLoader();

                $http.post(GetUrlForService("/AbonosCliente/QuitarAsignacionDeDispenser"), {
                    dispenser_id: _dispenser_id
                }).
                success(
                    function (data, status, headers, config) {

                        HideLoader();
                        
                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Confirmación", data.message);
                            window.location.reload();

                        } else {
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }

                    }
                    ).error(function (data) {
                        HideLoader();
                        //ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        $scope.mensajeError = data.message;
                    });

            };

            $scope.imputarAbonos = function() {
                
                ShowLoader();

                var abonos = [];
                var chbs = $(".ckb-abonoSelected");

                for (var i = 0; i < chbs.length; i++) {
                    if ($(chbs[i]).prop("checked") === true) {
                        abonos.push($(chbs[i]).attr("abonoId") * 1);
                    }
                }

                $http.post(GetUrlForService("/AbonosCliente/ImputarAbonosCliente"), {
                    cliente_id: $scope.modelo.clienteActual_id,
                    fechaImputacion: $scope.fechaImputacion,
                    abonosIds: abonos
                }).
                success(
                    function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {

                            ShowMessageBox(messageType_Success, "Confirmación", data.message);
                          
                        } else {
                            ShowMessageBox(messageType_Error, "Error", data.message);
                        }
                    }
                    ).error(function (data) {
                        HideLoader();
                        //ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                        $scope.mensajeError = data.message;
                    });
            };
            
            $scope.init = function () {
                
                //GLOBAL_CONFIG.finishLoading = false;
                $scope.modelo.clienteActual_id = $("#ClienteModelo_id").val();
                
                var autoCompleteModel = {};
                autoCompleteModel.urlTemplate = "/js/app/views/shared/template_autocomplete_dispensers.html";
                autoCompleteModel.searchItems = function () {
                    return {
                        success: function (f) {

                            if (aux_ultimoTexto == $scope.modelo.textDispenser)
                                return;

                            $scope.modelo.dispenser = null;
                            aux_ultimoTexto = $scope.modelo.textDispenser;

                            if ($scope.modelo.textDispenser.length < 2) {
                                return;
                            }

                            $http.post(GetUrlForService('/Dispensers/BusquedaRapida'),
                                {
                                    valorBuscado: $scope.modelo.textDispenser
                                }
                            ).success(
                                function (data, status, headers, config) {

                                    if (data.error === 0) {
                                        f(data.data);
                                    }
                                }
                            );

                        }
                    };
                };
                autoCompleteModel.onItemSelected = function (item, index) {
                    //this function is called when the user click or enter on one item of the items diplayed
                    $scope.modelo.dispenser = item;
                    $scope.modelo.textDispenser = item.numeroSerie + " - " + item.numeroInterno + " - " + item.tipoDispenser + " - " + item.marcaDispenser;
                    aux_ultimoTexto = $scope.modelo.textDispenser;
                };
                //After you have completed the object set up, give it to the scope to send it to the view
                $scope.autoCompleteModel = autoCompleteModel;

                //Obtener sucursales disponibles
                $http.post(GetUrlForService('/Clientes/ObtenerSucursalesJson'), {
                    cliente_id: $scope.modelo.clienteActual_id
                }).
                success(function (data, status, headers, config) {

                        if (data.error == 0) {

                            $scope.sucursalesDisponibles = data.data;
                            $scope.modelo.clienteSeleccionado = $scope.sucursalesDisponibles[0];
                            
                           //GLOBAL_FUNCTIONS.hideLoadingScreen();
                        } else {
                            
                           // GLOBAL_FUNCTIONS.hideLoadingScreen();
                        }

                })
                .error(function (data, status, headers, config) {
                        //GLOBAL_FUNCTIONS.hideLoadingScreen();
                });
                
                setTimeout(function () {

                    $("#div_agregarDispenser").dialog(
                      {
                          autoOpen: false,
                          height: 300,
                          width: 800,
                          modal: true
                      }
                    );
                    
                }, 300);

               
            };

            $scope.init();

        }]
);
