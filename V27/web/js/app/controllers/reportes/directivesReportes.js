
mainApp.directive('ctrSeleccionarRepartidor', function ($http, $compile, $templateCache, $rootScope) {

    return {
        restrict: 'E',
        scope: {
            repartidorSeleccionado: "=",
            placeholder: "@"
        },
        templateUrl: "/js/app/views/shared/template_control_repartidor.html",
        link: function (scope, element, attrs) {
            


            scope.Init = function() {

                return $http.get(GetUrlForService('/Usuarios/ObtenerRepartidores')
                     ).then(
                        function (data, status, headers, config) {

                            if (data.data.error === 0)
                                scope.repartidores = data.data.data;
                            else
                                return [];
                        }
                    );
            };
            scope.Init();
        }
    };
});

mainApp.directive('ctrSeleccionarReparto', function ($http, $compile, $templateCache, $rootScope) {

    return {
        restrict: 'E',
        scope: {
            repartoSeleccionado: "=",
            placeholder: "@"
        },
        templateUrl: "/js/app/views/shared/template_control_reparto.html",
        link: function (scope, element, attrs) {



            scope.Init = function (textoBuscado) {

                return $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles')
                     ).then(
                        function (data, status, headers, config) {

                            if (data.data.length != 0)
                                scope.repartos = data.data.repartos;
                            else
                                return [];
                        }
                    );
            };
            scope.Init();
        }
    };
});

mainApp.directive('ctrSeleccionarCliente', function ($http, $compile, $templateCache, $rootScope) {

    return {
        restrict: 'E',
        scope: {
            ngClienteSeleccionado: "=",
            placeholder: "@"
        },
        templateUrl: "/js/app/views/shared/template_control_autocompleteCliente.html",
        link: function (scope, element, attrs) {

            scope.buscarClientes = function (textoBuscado) {

                return $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'),
                         {
                             modelo: {
                                 datosCliente: textoBuscado
                             }
                         }
                     ).then(
                         function (data, status, headers, config) {

                             if (data.data.error === 0)
                                 return data.data.data;

                             else
                                 return [];
                         }
                     );
            };

        }
    };
});

mainApp.directive('uiSeleccionarRepartos', function ($http) {

    return {
        restrict: 'E',
        scope: {
            dirModel: "=",
            optionItems: "=?",
            multiple: "@",
            allowClear: "@"
        },
        templateUrl: "/js/app/views/shared/template_seleccionar_repartos_ui.html",
        link: function (scope, element, attrs) {
            scope.dirModel.itemsSelected = [];
            var init = function (textoBuscado) {

                return $http.get(GetUrlForService('/Repartos/ObtenerRepartosDisponibles')
                ).then(
                    function (resp) {
                        scope.optionItems = resp.data.repartos
                    });
            };

            init();
        }
    };
});

mainApp.directive('uiSeleccionarRepartidores', function ($http) {

    return {
        restrict: 'E',
        scope: {
            dirModel: "=",
            optionItems: "=?",
            multiple: "@",
            allowClear: "@"
        },
        templateUrl: "/js/app/views/shared/template_seleccionar_repartidores_ui.html",
        link: function (scope, element, attrs) {
            scope.dirModel.itemsSelected = [];
            var init = function (textoBuscado) {

                return $http.get(GetUrlForService('/Usuarios/ObtenerRepartidores')
                ).then(
                    function (resp) {
                        scope.optionItems = resp.data.data
                    });
            };

            init();
        }
    };
});

mainApp.directive('uiSeleccionarUsuariosPorRol', function ($http) {

    return {
        restrict: 'E',
        scope: {
            dirModel: "=",
            optionItems: "=?",
            multiple: "@",
            allowClear: "@",
            rolId: "@",
            placeholder:"@"
        },
        templateUrl: "/js/app/views/shared/template_seleccionar_usuarios_ui.html",
        link: function (scope, element, attrs) {
            scope.dirModel.itemsSelected = [];
            var init = function (textoBuscado) {

                return $http.get(GetUrlForService('/Usuarios/ObtenerUsuariosPorRol'),
                    {
                        params: {
                            rolId:scope.rolId
                        }
                    }
                ).then(
                    function (resp) {
                        scope.optionItems = resp.data.usuarios
                    });
            };

            init();
        }
    };
});

mainApp.directive('uiSeleccionarDias', function () {

    return {
        restrict: 'E',
        scope: {
            dirModel: "=",
            optionItems: "=?",
            multiple: "@",
            allowClear: "@"
        },
        templateUrl: "/js/app/views/shared/template_seleccionar_dias_ui.html",
        link: function (scope, element, attrs) {

            var init = function () {

                if (scope.dirModel == null) scope.dirModel = {};
                if (scope.dirModel.diasSelected == null) scope.dirModel.diasSelected = [];

                scope.optionItems = [
                    { id: 1, nombre: 'Lunes' },
                    { id: 2, nombre: 'Martes' },
                    { id: 3, nombre: 'Miércoles' },
                    { id: 4, nombre: 'Jueves' },
                    { id: 5, nombre: 'Viernes' },
                    { id: 6, nombre: 'Sábado' },
                    { id: 7, nombre: 'Domingo' },
                ];
            };

            init();
        }
    };
});

mainApp.directive('uiSeleccionarValoresTablaSatelite', function ($http) {

    return {
        restrict: 'E',
        scope: {
            dirModel: "=",
            multiple: "@",
            allowClear: "@",
            tablaSateliteId: "@"
        },
        templateUrl: "/js/app/views/shared/template_seleccionar_valores_satelites_ui.html",
        link: function (scope, element, attrs) {

            var init = function (textoBuscado) {

                if (scope.dirModel == null) scope.dirModel = {};
                if (scope.dirModel.valorSateliteSeleccionado == null) scope.dirModel.valorSateliteSeleccionado = [];

                return $http.get(GetUrlForService('/TablasSatelites/ObtenerValores'),
                    {
                        params: {
                            idsTablas: [scope.tablaSateliteId * 1]
                        }
                    }
                ).then(
                    function (resp) {
                        scope.optionItems = resp.data.valores
                    });
            };

            init();
        }
    };
});

mainApp.directive('popOverCliente', function ($http) {

    return {
        restrict: 'E',
        scope: {
            clienteId: "="
        },
        templateUrl: "/js/app/views/shared/pop-over-cliente.html",
        link: function (scope, element, attrs) {

            scope.datosCliente = null;

            scope.popover = {
                templateUrl: "/js/app/views/shared/pop-over-cliente-content.html"
            };

            scope.onInit = function () {

                if (scope.datosCliente == null) {

                    return $http.get(GetUrlForService('/Clientes/ObtenerDatosDeClienteParaPopover'),
                        {
                            params: {
                                clienteId: scope.clienteId
                            }
                        }
                    ).then(
                        function (resp) {
                            scope.datosCliente = resp.data.datos
                        });
                }
            }
        }
    };
});

mainApp.filter('propsFilter', function propsFilter() {

        return filterFilter;
        
        function filterFilter(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];

                        if (props[prop] == null || props[prop] == undefined) return out;

                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
});

mainApp.directive('ctrPeriodo', function ($http) {

    return {
        restrict: 'E',
        scope: {
            fechasPeriodo: "=",
            placeholder: "@",
            titulo: "@",
        },
        templateUrl: "/js/app/views/shared/template_control_periodo.html",
        link: function (scope, element, attrs) {

            scope.mostrarSoloCampo = scope.soloCampo == 'true';
        }
    };
});

mainApp.directive('uiPeriodo', function ($http) {

    return {
        restrict: 'E',
        scope: {
            modelPeriodo: "=",
            placeholder: "@",
        },
        templateUrl: "/js/app/views/shared/template_ui_periodo.html",
        link: function (scope, element, attrs) {

            scope.mostrarSoloCampo = scope.soloCampo == 'true';

            if (scope.modelPeriodo == null) scope.modelPeriodo = {};
            scope.modelPeriodo.periodo = null;
        }
    };
});

//mainApp.directive('smartFloat', function ($filter) {
//    var FLOAT_REGEXP_1 = /^\$?\d+.(\d{3})*(\,\d*)$/; //Numbers like: 1.123,56
//    var FLOAT_REGEXP_2 = /^\$?\d+,(\d{3})*(\.\d*)$/; //Numbers like: 1,123.56
//    var FLOAT_REGEXP_3 = /^\$?\d+(\.\d*)?$/; //Numbers like: 1123.56
//    var FLOAT_REGEXP_4 = /^\$?\d+(\,\d*)?$/; //Numbers like: 1123,56

//    return {
//        require: 'ngModel',
//        link: function (scope, elm, attrs, ctrl) {
//            ctrl.$parsers.unshift(function (viewValue) {
//                if (FLOAT_REGEXP_1.test(viewValue)) {
//                    ctrl.$setValidity('float', true);
//                    return parseFloat(viewValue.replace('.', '').replace(',', '.'));
//                } else if (FLOAT_REGEXP_2.test(viewValue)) {
//                    ctrl.$setValidity('float', true);
//                    return parseFloat(viewValue.replace(',', ''));
//                } else if (FLOAT_REGEXP_3.test(viewValue)) {
//                    ctrl.$setValidity('float', true);
//                    return parseFloat(viewValue);
//                } else if (FLOAT_REGEXP_4.test(viewValue)) {
//                    ctrl.$setValidity('float', true);
//                    return parseFloat(viewValue.replace(',', '.'));
//                } else {
//                    ctrl.$setValidity('float', false);
//                    return undefined;
//                }
//            });

//            ctrl.$formatters.unshift(
//                function (modelValue) {
//                    return $filter('number')(parseFloat(modelValue), 2);
//                }
//            );
//        }
//    };
//});

//mainApp.directive('linksDeCliente', function ($http, $compile, $templateCache) {

//    return {
//        restrict: 'E',
//        scope: {
//            clienteId: "="
//        },
//        templateUrl: "/js/app/views/shared/links_de_cliente.html",
//        link: function (scope, element, attrs) {

//        }
//    };
//});