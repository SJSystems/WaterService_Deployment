/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var devolucionesControllers = angular.module('devolucionesControllers', []);

devolucionesControllers.controller('devolucionesCtrl', ['$scope', '$http',
    function ($scope, $http) {
        
        //Inicializacion de pantalla
        $("#div_BuscarClienteDialogo").dialog(
          {
              autoOpen: false,
              height: 500,
              width: 1000,
              modal: true
          }
      );

        $scope.articulosRecientes = [];
        $scope.repartosDisponibles = [];
        $scope.motivosDeDevolucion = [];
        $scope.fechaDevolucion = getToday();
        $scope.repartoSeleccionado = 0;
        $scope.pantallaCargada = false;
        $scope.clienteSeleccionado = {};
        $scope.esHojaDeRuta = false;
        $scope.abrirDialogoBusquedaCliente = function() {

            var self = this;

            try {

                if (this.pantallaBusquedaCargada) {
                    $("#div_BuscarClienteDialogo").dialog("open");
                    return;
                }

                ShowLoader();

                $.ajax({
                    cache: false,
                    async: true,
                    type: "GET",
                    url: GetUrlForService("/Clientes/BusquedaRapida"),
                    success: function(data) {

                        $("#div_BuscarClienteDialogo").html(data);
                        HideLoader();
                        $("#div_BuscarClienteDialogo").dialog("open");

                        RePrepareView($("#div_BuscarClienteDialogo"));

                        $("#btn_submit").click(
                            function() {
                                ModeloBuscarClientes.BuscarClientes();
                                return false;
                            }
                        );

                        self.pantallaBusquedaCargada = true;
                    },
                    error: function(data) {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    }
                });
            } catch(e) {
                HideLoader();
            }

        };
        $scope.seleccionarCliente = function(cliente_id) {

            ShowLoader();

            //Obengo los artículos disponibles del cliente y datos propios del cliente
            $http.get(GetUrlForService('/Devoluciones/ObtenerArticulosParaDevoluciones') + '&cliente_id=' + cliente_id, {}).
                success(function(data, status, headers, config) {

                    $scope.clienteSeleccionado = data.cliente;
                    $scope.articulosRecientes = data.articulos;

                    //Se agregan las propiedades extras a cada objeto
                    $.each($scope.articulosRecientes, function(index, value) {
                        value.esCambioDirecto = false;
                        value.cantidadDevuelta = 0;
                        value.devuelve = false;
                        value.motivoDevolucion = null;
                    });

                    $("#div_BuscarClienteDialogo").dialog("close");

                    HideLoader();

                }).error(function(data, status, headers, config) { HideLoader(); });
        };
        
        $scope.confirmarDevolucion = function () {

            try {

                ShowLoader();

                var articulosDevueltos = [];

                $.each($scope.articulosRecientes, function (index, value) {

                    if (value.cantidadDevuelta && value.cantidadDevuelta > 0) {

                        articulosDevueltos.push({
                            articulo_id: value.id,
                            cantidadDevuelta: value.cantidadDevuelta,
                            motivoDevolucion_ids: value.motivoDevolucion.valor_ids,
                            esCambioDirecto: value.esCambioDirecto
                        });     

                    }
                });

                if (articulosDevueltos.length > 0) {

                    $http.post(GetUrlForService('/Devoluciones/ConfirmarDevolucionArticulos'),
                        {
                            devoluciones: articulosDevueltos,
                            cliente_id: $scope.clienteSeleccionado.cliente_id,
                            reparto_id: $scope.repartoSeleccionado.id,
                            fechaDevolucion: $scope.fechaDevolucion,
                            esHojaDeRuta:$scope.esHojaDeRuta
                        }).
                        success(function (data, status, headers, config) {

                            HideLoader();
                            
                            if (data.error == 0) {

                                ShowMessageBox(messageType_Success, "Exitoso", data.mensaje);
                                window.location.reload();
                            } else {
                                ShowMessageBox(messageType_Error, "Error", data.mensaje);
                            }

                        }).error(function (data, status, headers, config) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al guardar la devolución");
                        });
                }

              

            } catch(e) {
                HideLoader();
            } 

        };
        
        //Obtiene los repartos disponibles
        $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles'), {}).
            success(function (data, status, headers, config) {
                $scope.repartosDisponibles = data.repartos;
                $scope.repartoSeleccionado = $scope.repartosDisponibles[0];
            }).error(function (data, status, headers, config) { });

        //Obtiene motivos de devolucion
        $http.get(GetUrlForService('/Devoluciones/ObtenerMotivosDeDevolucion'), {}).
            success(function (data, status, headers, config) {
                $scope.motivosDeDevolucion = data;
            }).error(function (data, status, headers, config) { });



        MainScope = $scope;
    }]);

var MainScope;

function SeleccionarCliente(cliente_id) {
    MainScope.seleccionarCliente(cliente_id);
}
