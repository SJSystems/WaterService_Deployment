/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('buscarListaDePreciosCtrl', ['$scope', '$http', 'abmServices',
    function ($scope, $http, abmServices) {

        $scope.onObtenerListas = null;
        $scope.filtros = {
            tipoLista_ids: 0,
            nombreLista: "",
            activo: true,
        };

        $scope.listas = [];
        $scope.tiposDeListasDePrecios = [];
        

        $scope.init = function () {

            var url = GetUrlForService("/ListaDePrecios/GetDataForIndex");

            $http.get(url, {})
                .then(function (resp) {

                    if (resp.data.error == 0) {
                        $scope.tiposDeListasDePrecios = resp.data.tiposDeListasDePrecios;
                        $scope.tiposDeListasDePrecios.insert(0, { valor_ids: 0, valorTexto: '-- todas --' });
                    }
                }, function (resp) { });

        };

        $scope.buscarListas = function () {
            ShowLoader();
            if ($scope.onObtenerListas != null) {                
                $scope.onObtenerListas($scope.filtros);
            }
            HideLoader();
        };

        $scope.abrirDialogoAgregar = function () {

            var templateUrl = '/js/app/views/ListaDePrecios/editarListaDePrecios.html';
            var controller = 'editarListaDePreciosCtrl';

            var resolve = {
                listaId: function () {
                    return listaId = 0;
                }
            }

            var onClose = function (exitoso) {
                if (exitoso) {                    
                    $scope.buscarListas();
                }
            };

            abmServices.abrirDialogo(templateUrl, controller, resolve, onClose);
            
        };

        
        $scope.init();

    }]);

mainApp.controller('editarListaDePreciosCtrl', ['$scope', '$http', 'listaId', '$uibModalInstance', 'abmServices',
function ($scope, $http, listaId, $uibModalInstance, abmServices) {

    $scope.listaId = listaId;
    $scope.obtenerArticulos = null;

    $scope.lista = {};

    $scope.articulosActivos = [],
    $scope.articulosInactivos = [],


    $scope.init = function () {

        var url = GetUrlForService("/ListaDePrecios/GetDataForIndex");
        $http.get(url, {})
            .then(function (resp) {

                if (resp.data.error == 0) {
                    $scope.tiposDeListasDePrecios = resp.data.tiposDeListasDePrecios;
                }
            });

        if ($scope.listaId != null && $scope.listaId != 0) {

            $scope.esEdicion = true;
            $scope.tituloAccion = "Editar lista de precios: ";

            var url = GetUrlForService("/ListaDePrecios/GetDataForEdit");
            $http.get(url, {
                params: {
                    lista_id: $scope.listaId
                }
            }).then(function (resp) {

                if (resp.data.error == 0) {
                    $scope.lista = resp.data.lista;
                }
            });

        }
        else {

            $scope.esEdicion = false;
            $scope.tituloAccion = "Agregar lista de precios: ";
        }
    };

    $scope.validarCamposLista = function () {
        var msj = "";

        if ($scope.lista.nombre == null || $scope.lista.nombre == "")
            msj = msj + "Debe ingresar un nombre para la lista. ";

        if ($scope.lista.descripcion == null || $scope.lista.descripcion == "")
            msj = msj + "Debe ingresar una descripción para la lista. ";

        if ($scope.lista.tipoDeLista_ids == null || $scope.lista.tipoDeLista_ids == 0)
            msj = msj + "Debe seleccionar un tipo de lista. ";

        return { isValid: (msj == ""), message: msj };
    };

    $scope.guardarLista = function () {

        ShowLoader();

        var validation = $scope.validarCamposLista();

        if (!validation.isValid) {
            ShowMessageBox(messageType_Error, "Error de validación: ", validation.message);
            HideLoader();
        }
        else {
            
            var url = GetUrlForService('/ListaDePrecios/Save');
            
            $http.post(url,
                {
                    lista: $scope.lista
                })
                .then(function (resp) {

                    if (resp.data.error == 0) {
                        ShowMessageBox(messageType_Success, "Lista guardada con éxito.");

                        $scope.lista = resp.data.lista;

                        if ($scope.esEdicion) {
                            $uibModalInstance.close();

                            HideLoader();
                            return;
                        }

                        $scope.listaId = $scope.lista.id;
                        $scope.init();
                        HideLoader();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al Guardar");
                        HideLoader();
                    }

                }, function () {
                    ShowMessageBox(messageType_Error, "Error al Guardar");
                    HideLoader();
                });                
        }
    };

    $scope.cerrar = function () {
        $scope.lista = {};

        $uibModalInstance.dismiss();
    };

    $scope.obtenerArticulos = function () {
        if ($scope.onObtenerArticulos != null) {
            $scope.onObtenerArticulos($scope.lista.id);
        }
    };
    
    
    $scope.init();
}]);


mainApp.directive('listasDePrecios', function ($http, abmServices) {

    return {
        restrict: 'E',
        scope: {
            onObtenerListas: "="
        },
        templateUrl: "/js/app/views/ListaDePrecios/listas.html",
        link: function (scope, element, attrs) {

            var init = function () {
            };

            scope.onObtenerListas = function (pFiltros) {

                scope.filtros = pFiltros;

                $http.get(GetUrlForService('/ListaDePrecios/Obtener'),
                    {
                        params: {
                            pActivos: pFiltros.activo,
                            pNombre: pFiltros.nombreLista,
                            pTipoDeLista_ids: pFiltros.tipoLista_ids
                        }
                    }).then(function (resp) {                   

                        if (resp.data.error == 0) {
                            if (resp.data.listas.length == 0) {
                                ShowMessageBox(messageType_Info, "Información: ", " No hay resultados de búsqueda para los parámetros seleccionados.");
                            }
                            else {
                                scope.listas = resp.data.listas;
                                scope.filtros = pFiltros;
                            }
                        }
                    },
                    function (resp) { });
            };

            scope.abrirDialogoEditar = function (pLista) {

                var templateUrl = '/js/app/views/ListaDePrecios/editarListaDePrecios.html';
                var controller = 'editarListaDePreciosCtrl';

                var resolve = {
                    listaId: function () {
                        return listaId = pLista.id;
                    }
                };

                var onClose = function (exitoso) {
                    if (exitoso) {
                        scope.onObtenerListas(scope.filtros);
                    }
                };

                abmServices.abrirDialogo(templateUrl, controller, resolve, onClose);
            };

            scope.eliminar = function (listaId) {
                var url = GetUrlForService('/ListaDePrecios/Delete');

                var onClose = function (exitoso) {
                    if (exitoso) {
                        scope.onObtenerListas(scope.filtros);
                    }
                };

                abmServices.eliminar(listaId, url, onClose);
            };
            
            init();
        }
    };
});

mainApp.directive('articulosDeLista', function ($http, abmServices) {

    return {
        restrict: 'E',
        scope: {
            listaId: "="
        },
        templateUrl: "/js/app/views/ListaDePrecios/articulosDeLista.html",
        link: function (scope, element, attrs) {

            var init = function () {

                if (scope.listaId == null) 
                    scope.listaId = listaId;

                else if ( listaId == 0)
                    listaId = scope.listaId;

                var url = GetUrlForService('/ListaDePrecios/ObtenerArticulosDeLista');
                $http.get(url,
                  {
                      params: {
                          lista_id: listaId
                      }
                  })
                  .then(function (resp) {

                      if (resp.data.error == 0) {
                          scope.articulosActivosDeLista = resp.data.articulosActivosDeLista;
                          scope.articulosInactivosDeLista = resp.data.articulosInactivosDeLista;
                      }
                      else {
                          ShowMessageBox(messageType_Info, "Información: ", " No hay resultados de búsqueda para los parámetros seleccionados.");

                      }
                  }, function (resp) { });

                scope.obtenerArticulosParaElegir();

            };

            scope.obtenerArticulosParaElegir = function () {
                var url = GetUrlForService('/ListaDePrecios/ObtenerArticulosParaElegir');

                $http.get(url, {})
                    .then(function (resp) {
                        if (resp.data.error == 0) {
                            scope.articulosParaElegir = resp.data.articulosParaElegir;
                        }
                    }, function (resp) { });

            };

            scope.eliminar = function (articuloId, repetido) {

                if (!repetido) 
                    var textoModalEliminar = "¿Está seguro que desea eliminar?";                
                else 
                    var textoModalEliminar = "¿Articulo existe en lista, desea continuar y pasar a Inactivo el precio anterior?";
                

                bootbox.confirm(textoModalEliminar, function (result) {

                    if (result) {
                        ShowLoader();

                        var url = GetUrlForService('/ListaDePrecios/DeleteArticuloDeLista');
                        $http.post(url,
                        {
                            id: articuloId
                        })
                            .success(function (data, status, headers, config) {
                                if (data.error == 0) {

                                    HideLoader();

                                    init();
                                    return;
                                }
                                else {
                                    HideLoader();
                                    ShowMessageBox(messageType_Error, "Error al Guardar");
                                }
                            })
                            .error(function (data, status, headers, config) {
                                HideLoader();
                                ShowMessageBox(messageType_Error, "Error al Guardar");
                            });
                    }
                });

            };

            scope.agregarArticuloLista = function () {
                ShowLoader();

                var validation = scope.validarCamposArticulosDeLista();

                if (!validation.isValid) {
                    ShowMessageBox(messageType_Error, "Error de validación: ", validation.message);
                    HideLoader();
                }
                else {

                    var articuloId = scope.articuloNuevo.articuloSelected.id;
                    var articuloDeListaPorAgregar = {
                        id: 0,
                        articulo_id: articuloId,
                        listaDePrecio_id: scope.listaId,
                        precio: scope.articuloNuevo.precio,
                        activo: true,
                        fechaAlta: null,
                        usuarioAlta_id: null,
                        fechaBaja: null,
                        usuarioBaja_id: null
                    };

                    angular.forEach(scope.articulosActivosDeLista, function (articulo) {

                        if (articulo.articulo_id == articuloId) {
                            scope.eliminar(articulo.id, true);
                        }
                    });

                    var url = GetUrlForService('/ListaDePrecios/SaveArticuloDeLista');
                    $http.post(url,
                    {
                        articuloDeLista: articuloDeListaPorAgregar
                    })
                        .success(function (data, status, headers, config) {
                            if (data.error == 0) {
                                HideLoader();

                                init();
                                scope.articuloNuevo = {};
                                return;
                            }
                            else {
                                HideLoader();
                                ShowMessageBox(messageType_Error, "Error al Guardar");
                            }
                        })
                        .error(function (data, status, headers, config) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error al Guardar");
                        });

                }
            };

            scope.validarCamposArticulosDeLista = function () {
                var msj = "";

                if (scope.articuloNuevo == null) {
                    msj = msj + "Debe completar los campos de pantalla.";
                }
                else {
                    if (scope.articuloNuevo.articuloSelected == null || scope.articuloNuevo.articuloSelected == undefined)
                        msj = msj + "Debe ingresar un articulo. ";

                    if (scope.articuloNuevo.precio == null || scope.articuloNuevo.articuloSelected == "" || scope.articuloNuevo.articuloSelected <= 0)
                        msj = msj + "Debe ingresar un precio válido. ";
                }
                return { isValid: (msj == ""), message: msj };
            };


            init();

        }
    };
});

