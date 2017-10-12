/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('planificacionDeCargaController', ['$scope', '$http', 
        function ($scope, $http) {
            
            $scope.init = function () {

                $scope.fechasDeReferencia = [];

                $scope.factor = 1;

                //$http.get(GetUrlForService('/Envases/GetDataForSolicitudesDeStock'))
                //    .then(function (resp) {

                //    }, function (resp) {
                //        HideLoader();
                //    });
            };

            $scope.agregarFechasDeReferencia = function() {

                $scope.fechasDeReferencia.push(null);

                RunTimer(function() { RePrepareView($("#div_pantalla")); }, 100);
            };

            $scope.onFechaAPlanificarChange = function() {

                calcularFechasReferencias();
            };

            $scope.quitarFecha = function(index) {

                utiles.quitarItem($scope.fechasDeReferencia, index);
            };

            $scope.generarPlanificacion = function() {

                try {
                    
                    ShowLoader();

                    $http.post(GetUrlForService('/PlanificacionDeCarga/GenerarPlanificacion'), {
                        fecha: $scope.fechaAPlanificar,
                        fechasReferenia : $scope.fechasDeReferencia,
                        factor: $scope.factor
                    })
                        .then(function (resp) {

                            HideLoader();

                            if (resp.data.error == 0) {

                                $scope.datosDePlanificacion = resp.data.planificacion;
                                generarDatosParaGrilla();
                            }
                            
                        }, function (resp) {
                            HideLoader();
                        });

                } catch (e) {

                } 
            };

            $scope.obtenerCantidadDeArticuloDeReparto = function(repartoId, articuloId) {

                var datos = $scope.datosDePlanificacion.Articulos.filter(x=>x.reparto_id == repartoId && x.articulo_id ==articuloId);

                return datos != null && datos.length > 0 ? datos[0].cantidadFinal : 0;
            };
            
            $scope.editarCantidad = function(item) {

                item.editando = true;
                $scope.editandoCantidad = true;

                item.cantidadEditada = item.cantidadActual;
            };

            $scope.confirmarEdicion = function(item) {

                item.editando = false;
                $scope.editandoCantidad = false;

                var articulo = $scope.datosDePlanificacion.Articulos
                    .filter(x=>x.reparto_id == item.reparto_id && x.articulo_id == item.articulo_id)[0];

                if (!utiles.isNumeric(item.cantidadEditada)) {
                    item.cantidadActual = 0;
                    articulo.cantidadFinal = 0;
                    return;
                }
                
                item.cantidadActual = item.cantidadEditada;
                articulo.cantidadFinal = item.cantidadEditada;

                calcularPesoDeRepartos();
                calcularTotalDeArticulos();
            };

            $scope.cancelarEdicion = function(item) {

                item.editando = false;
                $scope.editandoCantidad = false;
                
            };
            
            $scope.guardarModificaciones = function() {
                
                try {

                    var articulos = [];

                    for (var i = 0; i < $scope.articulos.length; i++) {
                        var articulo = $scope.articulos[i];
                        var itemsModificados = articulo.repartos.filter(
                            function(x) {return x.cantidadOriginal != x.cantidadActual;});

                        var items = itemsModificados.map(function(x) {
                            return {
                                articulo_id: articulo.articulo_id,
                                reparto_id: x.reparto_id,
                                cantidadFinal: x.cantidadActual
                            };
                        });

                        articulos.push(...items);
                    }

                    ShowLoader();

                    $http.post(GetUrlForService('/PlanificacionDeCarga/GuardarModificacionesDeCantidades'), {
                        articulos: articulos,
                        planificacionId: $scope.datosDePlanificacion.id
                    })
                        .then(function (resp) {

                            HideLoader();

                            if (resp.data.error == 0) {

                                ShowMessageBox(messageType_Success, "Exitoso", "Las modificaciones se han guardado correctamente");
                            } else {
                                ShowMessageBox(messageType_Error, "Error", resp.data.message);
                            }
                            
                        }, function (resp) {
                            HideLoader();
                        });

                } catch (e) {

                } 
            }
            
            $scope.obtenerPlanificacion = function() {

                ShowLoader();

                $http.get(GetUrlForService('/PlanificacionDeCarga/ObtenerPlanificacionPorFecha'), {
                    params: {
                        fecha: $scope.fechaBuscada
                    }
                })
                    .then(function (resp) {

                        HideLoader();

                        if (resp.data.error == 0) {

                            $scope.datosDePlanificacion = resp.data.planificacion;
                            generarDatosParaGrilla();
                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.data.message);
                        }

                        RunTimer(function () { RePrepareView($("#div_pantalla")); }, 100);

                    }, function (resp) {
                        HideLoader();
                    });
            }

            $scope.imprimir = function printdiv() {

                var printpage = 'div_planificacion';
                var newstr = document.all.item(printpage).innerHTML;

                var mywindow = window.open('', 'my div', 'height=400,width=600');
                mywindow.document.write('<html></html>');
                mywindow.document.documentElement.innerHTML = document.documentElement.innerHTML;
                mywindow.document.body.innerHTML= newstr;

                RunTimer(function() { mywindow.print(); }, 1000);

            };
            
            var calcularFechasReferencias = function() {

                ShowLoader();

                $http.get(GetUrlForService('/PlanificacionDeCarga/ObtenerFechasDeReferencia'), {
                    params: {
                        fecha: $scope.fechaAPlanificar
                    }
                })
                    .then(function (resp) {

                        HideLoader();

                        if (resp.data.error == 0) {

                            $scope.fechasDeReferencia = resp.data.fechas;
                        }

                        RunTimer(function () { RePrepareView($("#div_pantalla")); }, 100);

                    }, function (resp) {
                        HideLoader();
                    });
            }
            
            var generarDatosParaGrilla = function() {

                var repartos = $scope.datosDePlanificacion.Articulos.map(function(x) {
                    return { reparto_id: x.reparto_id, nombreReparto: x.nombreReparto };
                });

                var articulos = $scope.datosDePlanificacion.Articulos.map(function(x) {
                    return { 
                        articulo_id: x.articulo_id, 
                        nombreArticulo: x.nombreArticulo, 
                        codigoInterno: x.codigoInterno,
                        pesoKilos:x.pesoKilos
                    };
                });

                $scope.repartos = obtenerSinDuplicados(repartos, "reparto_id");
                $scope.articulos = obtenerSinDuplicados(articulos, "articulo_id");

                angular.forEach( $scope.repartos, function(rep) {
                    var vehiculo = $scope.datosDePlanificacion.Vehiculos.filter(x=>x.reparto_id==rep.reparto_id);
                    if (vehiculo.length > 0)
                        rep.vehiculo = vehiculo[0].Vehiculo;
                });

                calcularPesoDeRepartos();

                $scope.articulos.map(function(x) {
                    x.repartos = $scope.repartos.map(function(y) {
                        var item = {
                            reparto_id: y.reparto_id, 
                            articulo_id: x.articulo_id,
                            cantidadActual: $scope.obtenerCantidadDeArticuloDeReparto(y.reparto_id, x.articulo_id),
                            editando:false,
                            cantidadEditada:null
                        };
                        item.cantidadOriginal = item.cantidadActual;
                        return item;
                    });
                });

                calcularTotalDeArticulos();
            };

            var calcularTotalDeArticulos = function() {
                
                $scope.articulos.map(function(x) {
                    
                    var cantidadTotal = 0;

                    angular.forEach( x.repartos, function(rep) {
                        cantidadTotal += rep.cantidadActual;
                    });

                    x.cantidadTotal = cantidadTotal;
                });
            };

            var calcularPesoDeRepartos = function() {

                $scope.repartos.map(function(x) {

                    var articulosDelReparto = $scope.datosDePlanificacion.Articulos.filter(y=>y.reparto_id == x.reparto_id);
                    var pesoDeReparto = 0;

                    angular.forEach(articulosDelReparto, function(art) {
                        pesoDeReparto += art.pesoKilos * art.cantidadFinal;
                    });

                    x.totalPeso = pesoDeReparto;
                });
            };

            var obtenerSinDuplicados = function(datos , campoAComprar) {

                var resultado = [];

                for (var i = 0; i < datos.length; i++) {
                    
                    var item = datos[i];

                    var datoExistente = resultado.filter(x=>x[campoAComprar] ==item[campoAComprar]);

                    if (datoExistente.length == 0) {
                        resultado.push(item);
                    }
                }

                return resultado;
            };

            $scope.init();
        }]
);

function Popup(data) 
{
    var mywindow = window.open('', 'my div', 'height=400,width=600');
    mywindow.document.write('<html><head><title>my div</title>');
    /*optional stylesheet*/ //mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
    mywindow.document.write('</head><body >');
    mywindow.document.write(data);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10

    mywindow.print();
    mywindow.close();

    return true;
}