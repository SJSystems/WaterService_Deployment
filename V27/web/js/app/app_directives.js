(function () {

    mainApp.directive('autoComplete', function ($http, $compile, $templateCache) {
        return {
            restrict: 'A',
            scope: {
                autoCompleteModel: "=autoComplete"
            },
            link: function (scope, element, attrs) {

                var aux_canHide = true;

                scope.visible = false;
                scope.element = element;
                scope.selectedIndex = -1;

                scope.select = function (index) {
                    scope.selectedIndex = index;
                    scope.visible = false;

                    var item = scope.autoCompleteModel.dataSource[scope.selectedIndex];
                    scope.autoCompleteModel.onItemSelected(item, scope.selectedIndex);
                };

                scope.isSelected = function (index) {
                    return (scope.selectedIndex === index);
                };

                element.bind("keyup", function (event) {

                    if (event.which === 40) { //Down key

                        if (scope.selectedIndex < scope.autoCompleteModel.dataSource.length - 1)
                            scope.selectedIndex = scope.selectedIndex + 1;

                    } else if (event.which === 38) { // Up key

                        if (scope.selectedIndex > -1)
                            scope.selectedIndex = scope.selectedIndex - 1;

                    } else if (event.which === 13) { // Enter key
                        scope.select(scope.selectedIndex);
                    } else {

                        scope.autoCompleteModel.searchItems().success(function (data) {
                            scope.autoCompleteModel.dataSource = data;
                            scope.selectedIndex = -1;
                            scope.visible = true;
                        });

                    }

                    scope.$apply();

                });

                element.bind("focusout", function (event) {

                    if (aux_canHide) {
                        scope.visible = false;
                        scope.$apply();
                    }

                });

                $http.get(scope.autoCompleteModel.urlTemplate, { cache: $templateCache }). //cache: $templateCache
                    success(function (content) {

                        var compiledContent = $compile(content)(scope);

                        scope.width = element[0].clientWidth;
                        var offset = getPosition(element[0]);
                        scope.top = offset.y + element[0].clientHeight + 1 + 'px';
                        scope.left = offset.x + 'px';

                        $(scope.element[0]).after(compiledContent[0]);

                        $(compiledContent[0]).off("hover").on("hover", function (e) {
                            aux_canHide = false;
                        });

                        $(compiledContent[0]).off("mouseleave").on("mouseleave", function () {
                            aux_canHide = true;
                        });

                    });

                scope.onMouseOver = function () {
                    aux_canHide = false;
                };

            }
        };
    });

    mainApp.directive('autoCompleteClientes', function ($http, $compile, $templateCache) {
        return {
            restrict: 'E',
            scope: {
                autoCompleteModel: "=autoComplete"
            },
            link: function (scope, element, attrs) {

                var aux_canHide = true;

                scope.visible = false;
                scope.element = element;
                scope.selectedIndex = -1;

                scope.select = function (index) {
                    scope.selectedIndex = index;
                    scope.visible = false;

                    var item = scope.autoCompleteModel.dataSource[scope.selectedIndex];
                    scope.autoCompleteModel.onItemSelected(item, scope.selectedIndex);
                };

                scope.isSelected = function (index) {
                    return (scope.selectedIndex === index);
                };

                element.bind("keyup", function (event) {

                    if (event.which === 40) { //Down key

                        if (scope.selectedIndex < scope.autoCompleteModel.dataSource.length - 1)
                            scope.selectedIndex = scope.selectedIndex + 1;

                    } else if (event.which === 38) { // Up key

                        if (scope.selectedIndex > -1)
                            scope.selectedIndex = scope.selectedIndex - 1;

                    } else if (event.which === 13) { // Enter key
                        scope.select(scope.selectedIndex);
                    } else {

                        scope.autoCompleteModel.searchItems().success(function (data) {
                            scope.autoCompleteModel.dataSource = data;
                            scope.selectedIndex = -1;
                            scope.visible = true;
                        });

                    }

                    scope.$apply();

                });

                element.bind("focusout", function (event) {

                    if (aux_canHide) {
                        scope.visible = false;
                        scope.$apply();
                    }

                });

                $http.get(scope.autoCompleteModel.urlTemplate, { cache: $templateCache }). //cache: $templateCache
                    success(function (content) {

                        var compiledContent = $compile(content)(scope);

                        scope.width = element[0].clientWidth;
                        var offset = getPosition(element[0]);
                        scope.top = offset.y + element[0].clientHeight + 1 + 'px';
                        scope.left = offset.x + 'px';

                        $(scope.element[0]).after(compiledContent[0]);

                        $(compiledContent[0]).off("hover").on("hover", function (e) {
                            aux_canHide = false;
                        });

                        $(compiledContent[0]).off("mouseleave").on("mouseleave", function () {
                            aux_canHide = true;
                        });

                    });

                scope.onMouseOver = function () {
                    aux_canHide = false;
                };

            }
        };
    });

    var getPosition = function (element) {
        var xPosition = 0;
        var yPosition = 0;

        while (element) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }
        return { x: xPosition, y: yPosition };
    };

    mainApp.filter("mydate", function () {
        var re = /\\\/Date\(([0-9]*)\)\\\//;
        return function (x) {
            var m = x.match(re);
            if (m) return new Date(parseInt(m[1]));
            else return null;
        };
    });

    mainApp.filter("dformat", function () {

        return function (x) {
            if (x != null)
                return x.slice(6, -2);
            return null;
        };
    });

    mainApp.filter("operacionEnvase", function () {

        return function (x) {
            if (x == 1)
                return "Préstamo";
            else if (x == 2)
                return "Devolución";
            else if (x == 3)
                return "Relevamiento";
        };
    });

    mainApp.directive('operacionesConCliente', function ($http, $compile, $templateCache) {

        return {
            restrict: 'E',
            scope: {
                operaciones: "="
            },
            templateUrl: "/js/app/views/shared/template_operacionesConCliente.html",
            link: function (scope, element, attrs) {

            }
        };
    });

    mainApp.directive('operacionesTempConCliente', function ($http, $compile, $templateCache) {

        return {
            restrict: 'E',
            scope: {
                operaciones: "="
            },
            templateUrl: "/js/app/views/shared/template_operacionesTempConCliente.html",
            link: function (scope, element, attrs) {

                scope.obtenerTipoDeEvento = function (tipoEventoId) {

                    if (tipoEventoId == 1)
                        return "Prestamo";
                    else if (tipoEventoId == 2)
                        return "Devolucion";
                    else if (tipoEventoId == 3)
                        return "Relevamiento";
                    else return null;

                };

            }
        };
    });

    mainApp.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    mainApp.directive('ngEscape', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 27) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEscape);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    mainApp.directive('seleccionarClientes', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                codigo: "@"
            },
            templateUrl: "/js/app/views/shared/template_seleccionarClientes.html",
            link: function (scope, element, attrs) {

                scope.element = element;
                scope.clientes = [];

                scope.$on('onOpenSeleccionarCliente', function (event, data) {
                    if (scope.codigo == data) {
                        scope.codigo = data;
                        $(scope.element).dialog("open");
                    }
                });

                scope.buscarClientes = function () {

                    ShowLoader();

                    $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'), {
                        modelo: {
                            datosCliente: scope.clienteTexto,
                            telefono: scope.telefono,
                            domicilio: scope.domicilio
                        }
                    }).success(function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {
                            scope.clientes = data.data;
                        } else {

                        }

                    }).error(function (data, status, headers, config) {
                        HideLoader();
                    });
                };

                scope.seleccionarCliente = function (cliente) {

                    $rootScope.$broadcast('onClienteSelected', { cliente: cliente, codigo: scope.codigo });
                    $(scope.element).dialog("close");
                };

                scope.seleccionarClientes = function () {

                    var clientes = [];

                    for (var i = 0; i < scope.clientes.length; i++) {
                        if (scope.clientes[i].selected === true) {
                            clientes.push(scope.clientes[i]);
                        }
                    }

                    $rootScope.$broadcast('onClientesSelected', clientes);
                };

                var init = function () {

                    RunTimer(function () {

                        $(scope.element).dialog(
                         {
                             autoOpen: false,
                             height: 600,
                             width: 900,
                             modal: false
                         }
                     );

                        $(".seleccionar-clientes-template").removeClass('hide');

                    }, 300);

                };

                init();
            }
        };
    });

    mainApp.directive('autocompleteSeleccionarCliente', function ($http, $compile, $templateCache, $rootScope) {

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

    mainApp.directive('autocompleteSeleccionarDispenser', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                ngDispenserSeleccionado: "=",
                placeholder: "@"
            },
            templateUrl: "/js/app/views/shared/template_control_autocompleteDispenser.html",
            link: function (scope, element, attrs) {

                scope.buscarDispensers = function (textoBuscado) {

                    return $http.post(GetUrlForService('/Dispensers/BusquedaRapida'),
                             {
                                 valorBuscado: textoBuscado
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

    mainApp.directive('seleccionarCheques', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {},
            templateUrl: "/js/app/views/shared/template_seleccionarCheques.html",
            link: function (scope, element, attrs) {

                scope.element = element;
                scope.clientes = [];

                scope.$on('onOpenSeleccionarCheques', function (event, data) {

                    scope.data = data;

                    ShowLoader();

                    var fechaHasta = new Date();
                    var fechaDesde = new Date();
                    fechaDesde.setMonth(fechaDesde.getMonth() - 3);

                    $http.post(GetUrlForService('/ChequesDepositos/ObtenerChequesDepositos'), {
                        clienteId: scope.data.cliente.cliente_id,
                        fechaDesde: getDateToShow(fechaDesde),
                        fechaHasta: getDateToShow(fechaHasta)
                    }).success(function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {
                            scope.cheques = data.cheques;
                        } else { }

                    })
                        .error(function (data, status, headers, config) {
                            HideLoader();
                        });

                    $(scope.element).dialog("open");
                });

                scope.seleccionarCheque = function (cheque) {

                    $rootScope.$broadcast('onChequeSelected', { cheque: cheque, data: scope.data });
                    $(scope.element).dialog("close");
                };

                var init = function () {
                    RunTimer(function () {
                        $(scope.element).dialog(
                         {
                             autoOpen: false,
                             height: 600,
                             width: 1000,
                             modal: false
                         }
                     );
                    }, 300);
                };

                init();
            }
        };
    });

    mainApp.directive('seleccionarDepositos', function ($http, $compile, $templateCache, $rootScope) {

        return {

            restrict: 'E',
            scope: {},
            templateUrl: "/js/app/views/shared/template_seleccionarDepositos.html",
            link: function (scope, element, attrs) {

                scope.element = element;
                scope.clientes = [];

                scope.$on('onOpenSeleccionarDepositos', function (event, data) {

                    scope.data = data;

                    ShowLoader();

                    var fechaHasta = new Date();
                    var fechaDesde = new Date();
                    fechaDesde.setMonth(fechaDesde.getMonth() - 3);

                    $http.post(GetUrlForService('/ChequesDepositos/ObtenerChequesDepositos'), {
                        clienteId: scope.data.cliente.cliente_id,
                        fechaDesde: getDateToShow(fechaDesde),
                        fechaHasta: getDateToShow(fechaHasta)
                    }).success(function (data, status, headers, config) {

                        HideLoader();

                        if (data.error == 0) {
                            scope.depositos = data.depositos;
                        } else { }

                    })
                        .error(function (data, status, headers, config) {
                            HideLoader();
                        });

                    $(scope.element).dialog("open");
                });

                scope.seleccionarDeposito = function (deposito) {

                    $rootScope.$broadcast('onDepositoSelected', { deposito: deposito, data: scope.data });
                    $(scope.element).dialog("close");
                };

                var init = function () {
                    RunTimer(function () {
                        $(scope.element).dialog(
                         {
                             autoOpen: false,
                             height: 600,
                             width: 1000,
                             modal: false
                         }
                     );
                    }, 300);
                };

                init();
            }
        };
    });

    mainApp.directive('escribirLog', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                codigo: "@",
                entity: "@",
                entityId: "@",
                functionality: "@",
                type: "@",
                title: "@"
            },
            templateUrl: "/js/app/views/shared/template_escribirLog.html",
            link: function (scope, element, attrs) {

                scope.element = element;
                scope.log = [];

                var dataReceived = null;

                scope.$on('onOpenEscribirLog', function (event, data) {
                    if (scope.codigo == data.code) {

                        dataReceived = data;

                        scope.log = [];
                        scope.codigo = data.code;
                        scope.entityId = data.entidadId;
                        scope.log.funcionalidad = scope.functionality;
                        scope.log.entidad = scope.entity;
                        scope.log.entidadId = scope.entityId;
                        scope.log.tipoDeLog = scope.type;
                        $(scope.element).dialog("open");
                    }
                });

                scope.WriteLog = function () {

                    var textoMensaje = (dataReceived.textoAnterior != null && dataReceived.textoAnterior != undefined ? dataReceived.textoAnterior : "")
                                    + scope.log.comentario
                                    + (dataReceived.textoPosterior != null && dataReceived.textoPosterior != undefined ? dataReceived.textoPosterior : "");

                    $http.post(GetUrlForService('/Misc/SaveLog'), {
                        mensaje: textoMensaje,
                        tipoDeLog: scope.log.tipoDeLog,
                        funcionalidad: scope.log.funcionalidad,
                        entidad: scope.log.entidad,
                        entidadId: scope.log.entidadId
                    }).success(function (data, status, headers, config) {
                        HideLoader();
                        if (data.error == 0) {
                            $rootScope.$broadcast('onLogEscrito', dataReceived);
                            $(scope.element).dialog("close");
                        } else {

                        }

                    }).error(function (data, status, headers, config) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error al guardar el comentario.", "Ha ocurrido un erro al intentar agregar el comentario al incidente.");
                    });

                    //  $rootScope.$broadcast('onLogSaved', { cliente: cliente, codigo: scope.codigo });

                };

                var init = function () {

                    RunTimer(function () {
                        $(scope.element).dialog(
                         {
                             autoOpen: false,
                             height: 200,
                             width: 685,
                             modal: false
                         }
                     );
                    }, 300);

                };

                init();
            }
        };
    });

    mainApp.directive('multipleSelect', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                codigo: "@",
                placeHolder: "@"

            },
            templateUrl: "/js/app/views/shared/template_multipleSelect.html",
            link: function (scope, element, attrs) {
                scope.element = element;
                scope.items = [];
                scope.selectedItems = new Array();
                scope.listState = false;
                var dataReceived = null;

                scope.$on('onCreateMultipleSelect', function (event, data) {
                    if (scope.codigo == data.code) {
                        dataReceived = data;
                        scope.items = angular.copy(data.items);
                        scope.codigo = data.code;
                        RunTimer(function () {
                        }, 300);
                    }
                });

                scope.IsShowingList = function () {
                    return scope.listState;
                };

                scope.Toggle = function () {
                    if (scope.listState) {
                        scope.listState = false;
                    } else {
                        scope.listState = true;
                    }
                };
                var init = function () {

                };

                scope.AddElement = function (item) {
                    if (!scope.IsItemSelected(item)) {
                        var index
                        scope.selectedItems.push(angular.copy(item));
                    }
                    scope.ReturnSelected();
                };

                scope.RemoveElement = function (item) {
                    if (scope.IsItemSelected(item)) {
                        for (i = 0; i < scope.selectedItems.length; i++) {
                            if (scope.selectedItems[i].id == item.id) {
                                scope.selectedItems.splice(i, 1);
                                scope.ReturnSelected();
                                break;
                            }
                        }
                    }
                };

                scope.IsItemSelected = function (item) {
                    for (i = 0; i < scope.selectedItems.length; i++) {
                        if (scope.selectedItems[i].id == item.id) {
                            return true;
                        }
                    }
                    return false;
                };

                scope.ReturnSelected = function () {
                    var returnItems = new Array();
                    for (i = 0; i < scope.selectedItems.length; i++) {
                        returnItems.push(scope.selectedItems[i].id);
                    }
                    $rootScope.$broadcast('onMultipleElementsSelected', { selectedItems: returnItems, codigo: scope.codigo });
                };

                init();
            }
        };

    });

    mainApp.directive('smartFloat', function ($filter) {
        var FLOAT_REGEXP_1 = /^\$?\d+.(\d{3})*(\,\d*)$/; //Numbers like: 1.123,56
        var FLOAT_REGEXP_2 = /^\$?\d+,(\d{3})*(\.\d*)$/; //Numbers like: 1,123.56
        var FLOAT_REGEXP_3 = /^\$?\d+(\.\d*)?$/; //Numbers like: 1123.56
        var FLOAT_REGEXP_4 = /^\$?\d+(\,\d*)?$/; //Numbers like: 1123,56

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (FLOAT_REGEXP_1.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace('.', '').replace(',', '.'));
                    } else if (FLOAT_REGEXP_2.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace(',', ''));
                    } else if (FLOAT_REGEXP_3.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue);
                    } else if (FLOAT_REGEXP_4.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace(',', '.'));
                    } else {
                        ctrl.$setValidity('float', false);
                        return undefined;
                    }
                });

                ctrl.$formatters.unshift(
                   function (modelValue) {
                       return $filter('number')(parseFloat(modelValue), 2);
                   }
               );
            }
        };
    });

    mainApp.directive('buscarClientes', function ($http, $compile, $templateCache, $rootScope) {

        return {
            restrict: 'E',
            scope: {
                clientes: "=",
            },
            templateUrl: "/js/app/views/clientes/buscarClientes.html",
            link: function (scope, element, attrs) {

                scope.datosBusqueda = {};
                scope.parametros = {};
                scope.cargandoDatos = false;
                scope.buscandoClientes = false;
                scope.clientes = [];

                var init = function () {

                    scope.cargandoDatos = true;

                    $http.get(GetUrlForService('/Clientes/ObtenerDatosParaBuscarClientes')).then(
                        function (resp) {

                            scope.cargandoDatos = false;

                            if (resp.data.error == 0) {
                                scope.datosBusqueda.repartos = resp.data.repartos;
                                scope.datosBusqueda.estados = resp.data.estados;
                                scope.datosBusqueda.promotores = resp.data.promotores;
                                scope.datosBusqueda.tiposDeClientes = resp.data.tiposDeClientes;
                                scope.datosBusqueda.dias = resp.data.dias;

                                scope.parametros.tipoCliente_ids = 0;
                                scope.parametros.estado_ids = 0;
                                scope.parametros.promotor_id = 0;
                                scope.parametros.reparto_id = 0;
                                scope.parametros.dia_ids = 0;
                            }

                        }, function (resp) {
                            scope.cargandoDatos = false;
                        });
                };

                scope.buscarClientes = function () {

                    scope.buscandoClientes = true;

                    $http.post(GetUrlForService('/Clientes/BusquedaRapidaResultJson'), {
                        datosCliente: scope.parametros.datosCliente,
                        domicilio: scope.parametros.domicilio,
                        tipo_id: scope.parametros.tipoCliente_ids,
                        estado_id: scope.parametros.estado_ids,
                        promotor_id: scope.parametros.promotor_id,
                        reparto_id: scope.parametros.reparto_id,
                        telefono: scope.parametros.telefono,
                        dia_id: scope.parametros.dia_ids,
                    }).then(
                        function (resp) {

                            scope.buscandoClientes = false;

                            if (resp.data.error == 0) {
                                scope.clientes = resp.data.data;
                            }

                        }, function (resp) {
                            scope.buscandoClientes = false;
                        });
                };

                init();
            }
        };

    });

    mainApp.factory("fileUploaderService", [
        "$q", "$http",
        function ($q, $http) {
            
            var getModelAsFormData = function (data) {

                var dataAsFormData = new FormData();

                angular.forEach(data, function (value, key) {
                    if (key == "attachment") {
                        console.log(value);
                        for (var i = 0; i < value.length; i++) {
                            dataAsFormData.append(value[i].name, value[i]);
                        }
                    } else {
                        dataAsFormData.append(key, value);
                    }
                });
                return dataAsFormData;
            };

            var uploadFiles = function (data, url) {
                var deferred = $q.defer();
                $http({
                    url: url,
                    method: "POST",
                    data: getModelAsFormData(data),
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).success(function (result) {
                    deferred.resolve(result);
                }).error(function (result, status) {
                    deferred.reject(status);
                });
                return deferred.promise;
            };

            return {
                uploadFiles: uploadFiles
            }
        }
    ]);

    mainApp.directive("fileModel", [
        "$parse",
        function ($parse) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    element.bind("change", function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files);
                        });
                    });
                }
            };
        }
    ]);
    
    mainApp.directive('ngFiles', ['$parse', function ($parse) {
        
        function fn_link(scope, element, attrs) {
            
            var onChange = $parse(attrs.ngFiles);
            element.on('change', function (event) {
                onChange(scope, { $files: event.target.files });
            });
        };

        return {
            link: fn_link
        }
    } ])
    
    mainApp.directive('linksDeCliente', function ($http, $compile, $templateCache) {

        return {
            restrict: 'E',
            scope: {
                clienteId: "="
            },
            templateUrl: "/js/app/views/shared/links_de_cliente.html",
            link: function (scope, element, attrs) {

            }
        };
    });

    mainApp.directive('porcentaje', function ($http, $compile, $templateCache) {

        return {
            restrict: 'E',
            scope: {
                valorA: "=",
                valorB: "="
            },
            templateUrl: "/js/app/views/shared/porcentaje.html",
            link: function (scope, element, attrs) {

                scope.obtenerValor = function () {

                    if (scope.valorA == null || scope.valorB == null) return 0;

                    scope.esPositivo = (scope.valorB - scope.valorA) > 0;

                    return ((scope.valorB - scope.valorA) / scope.valorA) * 100;
                }
            }
        };
    });

    mainApp.directive('setCalendar', function () {
        return {
            restrict: 'A',
            link: function (scope, el, attr) {

                RunTimer(function () {

                    $(el).datepicker({
                        autoclose: true,
                        todayHighlight: true,
                        format: "dd/mm/yyyy"
                    })
                      //show datepicker when clicking on the icon
                      .next().on(ace.click_event, function () {
                          $(this).prev().focus();
                      });

                    var espacio = $(el).val().toString().indexOf(" ");
                    if (espacio >= 0) {
                        $(el).val($(el).val().toString().substring(0, espacio));
                    }

                }, 500);
            }
        };
    });

})();