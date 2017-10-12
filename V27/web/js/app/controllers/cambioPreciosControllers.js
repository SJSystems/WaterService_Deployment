/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

var mainApp = angular.module(
   'mainApp',
    [
        'cambiosPreciosControllers'
    ]
);

var cambiosPreciosControllers = angular.module('cambiosPreciosControllers', []);

cambiosPreciosControllers.controller('cambiosPreciosCtrl', ['$scope', '$http',
    function($scope, $http) {

        $scope.init = function () {

            $scope.entidadAumento = 2;
            $scope.parametroAumento = 1;
            $scope.tipoDeCliente = 0;
            $scope.articulos = [];
            $scope.articuloSelected = null;
            $scope.montoAumento = null;
            $scope.porcentajeAumento = null;
            $scope.precioTope = null;
            
            $http.get(GetUrlForService('/Articulos/ObtenerArticulosResumen'), {}).
            success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.articulos = data.data;

                    //GLOBAL_FUNCTIONS.runTimer(function () {
                    //    SetChosenSelectControl($("#select_articulos"));
                    //}, 200);

                } else {
                    
                }

            }).error(function (data, status, headers, config) {
                
            });

            $http.get(GetUrlForService('/TablasSatelites/ObtenerValores'), {
                params: {
                    idsTablas: [690]
                }
            }).then(function(resp) {

                if (resp.data.error == 0) {
                    $scope.zonas = resp.data.valores;
                    $scope.zonas.insert(0, { valor_ids: -1, valorTexto: '-- Todas las zonas --' });
                    $scope.zonaSeleccionada = $scope.zonas[0];
                }
            }, function(resp) {});

        };

        $scope.confirmarCambioDePrecio = function () {

            var mensajeError = "";

            if ($scope.parametroAumento == 1) {
                if (!isNumeric($scope.porcentajeAumento))
                    mensajeError += "Valor incorrecto en el campo Porcentaje de aumento. ";
            }
            else if ($scope.parametroAumento == 2) {
                if (!isNumeric($scope.montoAumento))
                    mensajeError += "Valor incorrecto en el campo Monto de aumento. ";
            }
            else if ($scope.parametroAumento == 3) {
                if (!isNumeric($scope.precioFinalAumento))
                    mensajeError += "Valor incorrecto en el campo Precio final. ";
            }

            if ($scope.precioTope != null && $scope.precioTope!="" && !isNumeric($scope.precioTope)) {
                mensajeError += "Valor incorrecto en el campo Precio tope. ";
            }

            if (mensajeError != "") {
                ShowMessageBox(messageType_Error, "Error", mensajeError);
                return;
            }
            
            //===================================

            var mensaje = "";
            var metodo = "";
            var tipoAumento = "";

            if ($scope.entidadAumento == 1) {
                mensaje += "Entidad: ABONOS. ";
                metodo = "CambiarDePrecioDeAbonos";
            }
            else if ($scope.entidadAumento == 2) {
                mensaje += "Entidad: ARTÍCULOS DE ABONOS. Artículo: " + ($scope.articuloSelected == null ? "Todos" : $scope.articuloSelected.articulo) + ". ";
                metodo = "CambiarDePrecioDeArticulosDeAbonos";
            }
            else if ($scope.entidadAumento == 3) {
                mensaje += "Entidad: COMODATOS. Artículo: " +  ($scope.articuloSelected==null?"Todos": $scope.articuloSelected.articulo ) + ". ";
                metodo = "CambiarDeComodatos";
            }
            
            //==================================

            if ($scope.parametroAumento == 1) {
                mensaje += "Parámetro: PORCENTAJE " + $scope.porcentajeAumento + "%. ";
                tipoAumento = "1";
            }
            else if ($scope.parametroAumento == 2) {
                mensaje += "Parámetro: ADICIÓN DE MONTO $" + $scope.montoAumento + ". ";
                tipoAumento = "2";
            }
            else if ($scope.parametroAumento == 3) {
                mensaje += "Parámetro: PRECIO FINAL $" + $scope.precioFinalAumento + ". ";
                tipoAumento = "3";
            }

            if ($scope.precioTope != null && $scope.precioTope != 0) {
                mensaje += "PRECIO TOPE: $" + $scope.precioTope;
            } else {
                $scope.precioTope = 0;
            }

            //========================================
            if ($scope.tipoDeCliente == 1) {
                mensaje += ". Tipo de cliente: FAMILIA";
            }
            else if ($scope.tipoDeCliente == 2) {
                mensaje += ". Tipo de cliente: EMPRESA";
            }
            else if ($scope.tipoDeCliente == 0) {
                mensaje += ". Tipo de cliente: TODOS";
            }

            //=========================================
            if ($scope.zonaSeleccionada.valor_ids == -1) {
                mensaje += ". Zona: TODAS";
            } else {
                mensaje += ". Zona: " + $scope.zonaSeleccionada.valorTexto;
            }
            
            bootbox.confirm("Confirma el siguiente cambio de precio?\n" + mensaje, function (result) {
                if (result) {

                    ShowLoader();
                    
                    $http.post(GetUrlForService('/AbonosCliente/' + metodo),
                       {
                           tipoModificacion: tipoAumento,
                           porcentajeAumento: $scope.porcentajeAumento == null ? 0 : $scope.porcentajeAumento,
                           montoAumento: $scope.montoAumento == null ? 0 : $scope.montoAumento,
                           topeMaximoFinal: $scope.precioTope,
                           tipoDeCliente: $scope.tipoDeCliente,
                           precioFinal: $scope.precioFinalAumento == null ? 0 : $scope.precioFinalAumento,
                           rubro_id: null,
                           articulo_id: $scope.articuloSelected == null ? null : $scope.articuloSelected.id,
                           zona_ids: $scope.zonaSeleccionada.valor_ids > 0 ? $scope.zonaSeleccionada.valor_ids : null,
                       }).
                       success(function (data, status, headers, config) {

                           HideLoader();

                           if (data.error == 0) {

                               ShowMessageBox(messageType_Success, "Exitoso", data.message);
                               window.location.reload();
                           } else {
                               ShowMessageBox(messageType_Error, "Error", data.message);
                           }

                       }).error(function (data, status, headers, config) {
                           HideLoader();
                           ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
                       });
                }
            });

        };

        $scope.init();
    }]);