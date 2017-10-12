/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var mainApp = angular.module(
   'mainApp',
    [
        'gastosRepartoControllers'
    ]
);

var gastosRepartoControllers = angular.module('gastosRepartoControllers', []);

gastosRepartoControllers.controller('buscarGastosRepartoController', ['$scope', '$http', '$rootScope',

    function ($scope, $http, $rootScope) {
        $scope.gastos = [];
        $scope.repartos = [];
        $scope.fecha = getToday();

        $scope.EliminarGasto = function (id) {
            ShowLoader();

            $http.post(GetUrlForService('/GastosReparto/Delete'), {
                id: id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {

                    HideLoader();
                    $scope.ObtenerGastos();

                    setTimeout(function () {
                        setTooltip();
                    }, 300);

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ObtenerGastos = function () {

            ShowLoader();

            $http.post(GetUrlForService('/GastosReparto/ObtenerGastos'), {
                repartoId: $scope.reparto.id,
                fecha: $scope.fecha
            }).success(function (data, status, headers, config) {

                $scope.gastos = null;

                if (data.error == 0) {

                    $scope.gastos = data.gastos;

                    HideLoader();

                    setTimeout(function () {
                        setTooltip();
                    }, 300);

                } else {
                    HideLoader();
                }

            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };
        
        var setDialogs = function () {
            $("#dialog_gastos").dialog(
                {
                    autoOpen: false,
                    height: 350,
                    width: 650,
                    modal: true
                }
            );
        };

        $scope.abrirDialogo = function (divId) {
            $("#" + divId).dialog("open");
        };

        $scope.editarGasto = function (gasto) {

            $rootScope.$broadcast('editarGastoClick', gasto);
            $scope.abrirDialogo("dialog_gastos");
        };

        $scope.init = function () {
            
           $http.get(GetUrlForService('/GastosReparto/ObtenerRepartosDisponibles'), {}).
           success(function (data, status, headers, config) {
               $scope.repartos = data;
               $scope.reparto = $scope.repartos[0];
           }).error(function (data, status, headers, config) { });

            setTimeout(function () {
                setDialogs();
            }, 300);
        };
        
        $scope.init();

    }]);

gastosRepartoControllers.controller('nuevoGastoController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.$on('editarGastoClick', function(event, data) {
            console.log(data);

            $scope.gasto = {
                id: data.id,
                monto: data.monto,
                descripcionGasto: data.descripcionGasto
            };

            $scope.fechaReparto = GetDateTimeFromJson(data.fechaRuta);
            $scope.repartoSelected = getRepartoById(data.reparto_id);
            $scope.tipoGastoSelected = getTipoGastoByIds(data.tipoGasto_ids);
        });

        $scope.id = getParameterByName("id");
        $scope.gasto =
        {
            id: 0
        };

        $scope.Init = function () {
            if ($scope.id != 0) {
                $scope.GetGastoById();
                $scope.accion = "Editar Gasto";
            } else {
                $scope.accion = "Registrar Gasto";
            }
            
            $http.get(GetUrlForService('/GastosReparto/ObtenerRepartosDisponibles'), {}).
          success(function (data, status, headers, config) {
              $scope.repartos = data;
              $scope.reparto = $scope.repartos[0];
          }).error(function (data, status, headers, config) { });
            
            $http.get(GetUrlForService('/GastosReparto/ObtenerTiposGastos'), {}).
          success(function (data, status, headers, config) {
              $scope.tiposGastos = data.tiposGastos;
              $scope.tipoGastoSelected = $scope.tiposGastos[0];
          }).error(function (data, status, headers, config) { });

        };

        $scope.GetGastoById = function () {
            $http.post(GetUrlForService('/GastosReparto/ObtenerGastoById'),
            {
                id: $scope.id

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.gasto = data.gasto;
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ValidateGasto = function () {
            var msj = "";

            if ($scope.tipoGastoSelected == null)
                msj = "Debe seleccionar el tipo de gasto. ";
            if ($scope.repartoSelected == null)
                msj = msj + "Debe seleccionar una ruta. ";
            if ($scope.fechaReparto == null)
                msj = msj + "Debe seleccionar una fecha. ";

            if ($scope.gasto.descripcionGasto == null)
                msj = msj + "Debe ingresar una descripción. ";
            if ($scope.gasto.monto == null)
                msj = msj + "Debe ingresar el monto. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {
            var validation = $scope.ValidateGasto();
            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            } else {

                ShowLoader();

                $scope.gasto.tipoGasto_ids = $scope.tipoGastoSelected.valor_ids;
          
                $http.post(GetUrlForService('/GastosReparto/Save'),
                {
                    gasto: $scope.gasto,
                    reparto: $scope.repartoSelected.id,
                    fechaReparto: $scope.fechaReparto,
                }).success(function (data, status, headers, config) {
                    if (data.error == 0) {
                        HideLoader();
                    } else {
                        HideLoader();
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
            }
        };
        
        $scope.Init();

        var getTipoGastoByIds = function(ids) {
            for (var i = 0; i < $scope.tiposGastos.length; i++) {
                if ($scope.tiposGastos[i].valor_ids == ids)
                    return $scope.tiposGastos[i];
            }
            return null;
        };

        var getRepartoById = function(repartoId) {
            for (var i = 0; i < $scope.repartos.length; i++) {
                if ($scope.repartos[i].id == repartoId)
                    return $scope.repartos[i];
            }
            return null;
        };

    }]);