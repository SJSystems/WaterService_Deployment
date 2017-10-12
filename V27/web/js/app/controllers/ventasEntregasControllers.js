/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var mainApp = angular.module(
   'app_ventasEntregas',
    [
        'ventasEntregasControllers'
    ]
);

mainApp.filter("mydate", function () {
    var re = /\\\/Date\(([0-9]*)\)\\\//;
    return function (x) {
        var m = x.match(re);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
});


var ventasEntregasControllers = angular.module('ventasEntregasControllers', []);

ventasEntregasControllers.controller('ventasEntregasCreateCtrl', ['$scope', '$http',
    function ($scope, $http) {

        //GLOBAL_CONFIG.finishLoading = false;
        
        //Model definition
        $scope.Model = {
            cliente_id: null,
            clienteDeHojaDeRuta: {},
            hojaDeRuta_id: 0,
            indexActual: 0,
            esHojaDeRuta: false,
            esVentaExtra:false,
            cantidadTotal:0,
            
            articulosRetornables: [],
            prestamosDevoluciones: [], //Modelo.prestamosDevoluciones
            eventosPrestamosDevoluciones: [{ valor: 1, texto: 'Préstamo' }, { valor: 2, texto: 'Devolución' }]
        };
        
        //Obtiene los datos necesarios para la pantalla
        $http.get(GetUrlForService('/Articulos/ObtenerArticulosRetornables'), {}).
            success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.Model.articulosRetornables = data.data;
                } 
                
                GLOBAL_FUNCTIONS.hideLoadingScreen();
                
            }).error(function(data, status, headers, config) {
                GLOBAL_FUNCTIONS.hideLoadingScreen();
            });

        ng_Model = $scope.Model; //Globalizo el modelo

        setTimeout(function () { $scope.Model.checkEsHojaDeRuta(); }, 300);
        
        //Eventos ============================================================
        $scope.agregarPrestamoDevolucion = function() {

            $scope.Model.prestamosDevoluciones.push(
                {
                    articulo: $scope.Model.articulosRetornables[0],
                    cantidad: 0,
                    comentarios: "",
                    evento: $scope.Model.eventosPrestamosDevoluciones[0],
                }
            );

            GLOBAL_FUNCTIONS.runTimer(setNumericControl, 200);

        };

        $scope.eliminarPrestamoDevolucion = function (index) {

            $scope.Model.prestamosDevoluciones.splice(index,1);
        };

        $scope.Model.confirmarVisita = function (ausente) {
          
            GLOBAL_FUNCTIONS.showLoadingScreen();
            
            $http.post(GetUrlForService('/VentasEntregas/ConfirmarVisita'), {
                //int clienteId, long hojaDeRutaId, bool esAusente, string longitud, string latitud
                clienteId: $scope.Model.clienteDeHojaDeRuta.cliente_id,
                hojaDeRutaId: $scope.Model.hojaDeRuta_id,
                esAusente: ausente,
                longitud: "",
                latitud:""
            }).
                success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.Model.clienteSiguiente();
                    }
                    
                }).error(function (data, status, headers, config) {
                    GLOBAL_FUNCTIONS.hideLoadingScreen();
                });
            
        };

        $scope.Model.clienteSiguiente = function () {

            $scope.Model.indexActual++;
            $scope.Model.obtenerClienteActual();
        };

        $scope.Model.esUltimoCliente = function() {

            return ($scope.Model.indexActual+1) >= $scope.Model.cantidadTotal;
        };

        $scope.Model.clienteAnterior = function () {

            $scope.Model.indexActual--
            $scope.Model.obtenerClienteActual();
        };

        $scope.Model.checkEsHojaDeRuta = function () {
            
            var esHojaDeRuta = getParameterByName('esHojaDeRuta');
            if (esHojaDeRuta != "true") {
                $scope.Model.esHojaDeRuta = false;
                return ;
            }

            $scope.Model.esHojaDeRuta = true;

            var hojaDeRuta_id = getParameterByName('hojaDeRuta');
            var indexActual = getParameterByName('index');

            $scope.Model.hojaDeRuta_id = hojaDeRuta_id * 1;
            $scope.Model.indexActual = indexActual * 1;

            $scope.Model.obtenerClienteActual();
        };

        $scope.Model.obtenerClienteActual = function() {

            GLOBAL_CONFIG.finishLoading = false;
            GLOBAL_FUNCTIONS.showLoadingScreen();

            
            //Obtiene los datos necesarios para la pantalla
            $http.get(GetUrlForService('/HojasDeRuta/ObtenerClienteDeHojaDeRuta'), {
                params: {
                    hojaDeRuta_id: $scope.Model.hojaDeRuta_id,
                    posicion: $scope.Model.indexActual
            } }).success(function (data, status, headers, config) {

                GLOBAL_FUNCTIONS.hideLoadingScreen();
                
                    switch (data.error) {
                    case 0:

                        $scope.Model.clienteDeHojaDeRuta = data.data;
                        $scope.Model.cantidadTotal = data.cantidadTotal;
                        
                        if($scope.Model.clienteDeHojaDeRuta.visitado===false)
                        {
                            Modelo.SeleccionarCliente($scope.Model.clienteDeHojaDeRuta.cliente_id);
                            $scope.Model.prestamosDevoluciones = [];
                            $scope.Model.esHojaDeRuta = true;
                        }

                        break;
                        
                        case 1:                            
                            ShowMessageBox(messageType_Error, "Error", data.message);
                            $scope.Model.esHojaDeRuta = false;
                        break;

                    case 2:
                        ShowMessageBox(messageType_Error, "Error", data.message);
                        $scope.Model.esHojaDeRuta = false;
                        break;
                        
                    default:
                        break;
                    }

                    

                }).error(function (data, status, headers, config) {
                    GLOBAL_FUNCTIONS.hideLoadingScreen();
                });

        };
        
    }]);

var ng_Model = {};