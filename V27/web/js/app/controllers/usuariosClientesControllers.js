/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('dashboardCuentaCliente', ['$scope', '$http', 
    function ($scope, $http) {

        $scope.clienteId = clienteId;

    }]);

mainApp.controller('cuentaClienteController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        var init = function () {
            
            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6)) ;
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

            RunTimer($scope.obtenerDatosDeCuenta, 300);

            ShowLoader();

            $http.get(GetUrlForService('/UsuariosClientes/ObtenerCliente')).then(
                function (resp) {

                    HideLoader();

                    $scope.cliente = resp.data.cliente;

                }, function (resp) {
                    HideLoader();
                });

        };

        $scope.obtenerDatos = function () {

            if ($scope.onObtenerComprobantes != null) $scope.onObtenerComprobantes();
            if ($scope.onObtenerConsumos != null) $scope.onObtenerConsumos();
            if ($scope.onObtenerCobros != null) $scope.onObtenerCobros();
            if ($scope.onObtenerOrdenesDeTrabajo != null) $scope.onObtenerOrdenesDeTrabajo();
        };
        $scope.onObtenerComprobantes = null;
        $scope.onObtenerConsumos = null;
        $scope.onObtenerCobros = null;
        $scope.onObtenerOrdenesDeTrabajo = null;

        init();

    }]);

mainApp.controller('facturasController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.init = function () {

            $scope.facturas = [];
           
            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6));
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

            RunTimer($scope.obtenerFacturas, 300);

            ShowLoader();
            $http.get(GetUrlForService('/UsuariosClientes/GetDataFor_Facturas'), {}).
                success(function (data, status, headers, config) {
                    
                    if (data.error == 0) {

                        $scope.cliente = data.cliente;
                    }

                }).error(function (data, status, headers, config) { HideLoader(); });

        };

        $scope.obtenerFacturas = function () {

            ShowLoader();

            $http.post(GetUrlForService('/UsuariosClientes/ObtenerFacturas'), {
                desde: $scope.fechaDesde,
                hasta: $scope.fechaHasta,
            }).success(function (data, status, headers, config) {

                $scope.facturas = [];
               
                if (data.error == 0) {

                    $scope.facturas = data.facturas;
                   
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

        $scope.init();

    }]);

mainApp.controller('remitosController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.init = function () {

            $scope.remitos = [];

            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6));
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

            RunTimer($scope.obtenerRemitos, 300);

            ShowLoader();
            $http.get(GetUrlForService('/UsuariosClientes/GetDataFor_Remitos'), {}).
                success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.cliente = data.cliente;
                    }

                }).error(function (data, status, headers, config) { HideLoader(); });

        };

        $scope.obtenerRemitos = function () {

            ShowLoader();

            $http.post(GetUrlForService('/UsuariosClientes/ObtenerRemitos'), {
                desde: $scope.fechaDesde,
                hasta: $scope.fechaHasta,
            }).success(function (data, status, headers, config) {

                $scope.facturas = [];

                if (data.error == 0) {

                    $scope.remitos = data.remitos;

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

        $scope.init();

    }]);

mainApp.controller('visitasController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.init = function () {

            $scope.visitas = [];

            $scope.fechaDesde = getDateToShow(new Date().addMonths(-6));
            $scope.fechaHasta = getDateToShow(new Date().addMonths(1));

            RunTimer($scope.obtenerVisitas, 300);

            ShowLoader();
            $http.get(GetUrlForService('/UsuariosClientes/GetDataFor_Visitas'), {}).
                success(function (data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.cliente = data.cliente;
                    }

                }).error(function (data, status, headers, config) { HideLoader(); });

        };

        $scope.obtenerVisitas = function () {

            ShowLoader();

            $http.post(GetUrlForService('/UsuariosClientes/ObtenerVisitas'), {
                desde: $scope.fechaDesde,
                hasta: $scope.fechaHasta,
            }).success(function (data, status, headers, config) {

                $scope.visitas = [];

                if (data.error == 0) {

                    $scope.visitas = data.visitas;

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

        $scope.init();

    }]);

mainApp.controller('cambioPasswordDeUsuario', ['$scope', '$http', 
    function ($scope, $http) {

        $scope.cliente = null;
        $scope.modelo = {
            newPassword: null,
            newPasswordRep: null,
            currentPassword: null
        };

        var init = function () {

            
        };

        $scope.confirmarCambioDePassword = function () {

            ShowLoader();

            $http.post(GetUrlForService('/UsuariosClientes/CambiarPassword'), {
                newPassword: $scope.modelo.newPassword,
                newPasswordRep: $scope.modelo.newPasswordRep,
                currentPassword: $scope.modelo.currentPassword
            }).then(function (resp) {

                HideLoader();

                if (resp.data.error == 0) {
                    ShowMessageBox(messageType_Success, "Exitoso", "El cambio de contraseña se ha realizado exitósamente");
                    $scope.modelo.newPassword = null;
                    $scope.modelo.newPasswordRep = null;
                    $scope.modelo.currentPassword = null;
                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }

                }, function (resp) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    ShowLoader();
            });
        };

        init();

    }]);

mainApp.controller('publicacionesController', ['$scope', '$http',
    function ($scope, $http) {

        var init = function () {
            
            $scope.obtenerDatos();
        };

        $scope.obtenerDatos = function () {

            ShowLoader();

            $http.get(GetUrlForService('/UsuariosClientes/ObtenerPublicaciones'))
                .then(function (resp) {

                    if (resp.data.error == 0) {

                        $scope.tiposDePublicaciones = resp.data.tipos;
                        $scope.publicaciones = resp.data.publicaciones;

                        RunTimer(function () {

                            $("#tab_tab_0").trigger("click");

                        }, 100);            

                        HideLoader();

                    } else {
                        HideLoader();
                    }

                }, function (resp) {
                    HideLoader();
                });
        };

        init();

    }]);

//Directives
mainApp.directive('dashboardCliente', function ($http) {

    return {
        restrict: 'E',
        scope: {
            clienteId: "="
        },
        templateUrl: "/js/app/views/usuariosClientes/dashboardCliente.html",
        link: function (scope, element, attrs) {

            var init = function () {

                scope.dashboard = null;

                RunTimer(scope.obtenerDatosDeCuenta, 300);
            };

            scope.obtenerDatosDeCuenta = function () {
                
                $http.get(GetUrlForService('/UsuariosClientes/ObtenerDashboard'),
                        {
                            params: {
                                clienteId : scope.clienteId
                            }
                        }
                    )
                    .then(function (resp) {

                        if (resp.data.error == 0) {

                            scope.dashboard = resp.data.dashboard;

                            scope.saldoActual = null;
                            scope.saldoComprobantes = null;
                            scope.cantidadComprobantesAdeudados = null;
                            scope.montoConsumoActual = null;
                            scope.creditoAFavor = null;

                            scope.consumosDelPeriodo = null;
                            scope.articulosDisponibles = null;
                            scope.comodatos = null;
                            scope.prestamosDeEnvases = null;
                            
                        } else {
                            
                        }

                    }, function (resp) {
                        
                    });
            };

            init();
        }
    };

});

mainApp.directive('comprobantesDeClientes', function ($http, $compile, $templateCache, $rootScope) {

    return {
        restrict: 'E',
        scope: {
            desde: "=",
            hasta: "=",
            onDatoClick:"=",
            onObtenerDatos: "="
        },
        templateUrl: "/js/app/views/usuariosClientes/comprobantes.html",
        link: function (scope, element, attrs) {
            
            var init = function () {
                
            };

            scope.onObtenerDatos = function () {

                scope.cargandoDatos = true;

                $http.get(GetUrlForService('/UsuariosClientes/ObtenerComprobantes'),
                    {
                        params: {
                            desde: scope.desde,
                            hasta: scope.hasta
                        }
                    }).then(
                    function (resp) {

                        scope.cargandoDatos = false;

                        if (resp.data.error == 0) {
                            scope.comprobantes = resp.data.datos.comprobantes;
                        }

                    }, function (resp) {
                        scope.cargandoDatos = false;
                    });
            };
            
            init();
        }
    };

});

mainApp.directive('consumosDeCliente', function ($http) {

    return {
        restrict: 'E',
        scope: {
            desde: "=",
            hasta: "=",
            onObtenerDatos: "=",
            clienteId:"="
        },
        templateUrl: "/js/app/views/usuariosClientes/consumos.html",
        link: function (scope, element, attrs) {

            scope.modelo = {};

            var init = function () {

                scope.modelo.clientesDisponibles = [{
                    cliente_id: 0,
                    nombreCliente: '-- Todos --'
                }];

                scope.modelo.idClienteSeleccionado = 0;
            };

            scope.onObtenerDatos = function () {

                scope.cargandoDatos = true;

                $http.get(GetUrlForService('/UsuariosClientes/ObtenerConsumos'),
                    {
                        params: {
                            desde: scope.desde,
                            hasta: scope.hasta,
                            clienteId: scope.clienteId == undefined ? null : scope.clienteId
                        }
                    }).then(
                    function (resp) {

                        scope.cargandoDatos = false;

                        if (resp.data.error == 0) {
                            scope.modelo.consumos = resp.data.consumos;
                        }

                        scope.modelo.clientesDisponibles = [{
                            cliente_id: 0,
                            nombreCliente: '-- Todos --'
                        }];

                        angular.forEach(scope.modelo.consumos, function (item, index) {

                            var itemExisted = scope.modelo.clientesDisponibles.filter(function (x) { return x.cliente_id == item.clienteEntrega_id }).length > 0;

                            if (!itemExisted) {
                                scope.modelo.clientesDisponibles.push(
                                    {
                                        cliente_id: item.clienteEntrega_id,
                                        nombreCliente: item.clienteEntrega
                                    });
                            }
                        });

                        scope.modelo.idClienteSeleccionado = 0;

                    }, function (resp) {
                        scope.cargandoDatos = false;
                    });
            };

            scope.obtenerSubtotal = function (articulo) {

                return utiles.redondear(articulo.cantidad * articulo.precioUnitario) * 1;
            };
            init();
        }
    };

});

mainApp.directive('cobrosDeCliente', function ($http) {

    return {
        restrict: 'E',
        scope: {
            desde: "=",
            hasta: "=",
            onObtenerDatos: "="
        },
        templateUrl: "/js/app/views/usuariosClientes/cobros.html",
        link: function (scope, element, attrs) {

            var init = function () {

            };

            scope.onObtenerDatos = function () {

                scope.cargandoDatos = true;

                $http.get(GetUrlForService('/UsuariosClientes/ObtenerCobros'),
                    {
                        params: {
                            desde: scope.desde,
                            hasta: scope.hasta
                        }
                    }).then(
                    function (resp) {

                        scope.cargandoDatos = false;

                        if (resp.data.error == 0) {
                            scope.cobros = resp.data.cobros.Cobros;
                        }

                    }, function (resp) {
                        scope.cargandoDatos = false;
                    });
            };

            init();
        }
    };

});

mainApp.directive('tituloCliente', function ($http) {

    return {
        restrict: 'E',       
        scope: {
            cliente: "=?",        },
        templateUrl: "/js/app/views/usuariosClientes/tituloCliente.html",
        link: function (scope, element, attrs) {

            var init = function () {
                $http.get(GetUrlForService('/UsuariosClientes/ObtenerCliente')).then(
                    function (resp) {
                        
                        scope.cliente = resp.data.cliente;
                    });
            };
          
            init();
        }
    };

});

mainApp.factory('usuarioClienteService', ['$http', '$uibModal',
    function ($http, $uibModal) {

        var service = {};

        service.abrirEditarPassword = function (clienteId, onCerrar) {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/usuariosClientes/formCambiarPasswordCliente.html',
                controller: 'cambioPasswordUsuarioClienteController',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    clienteId: clienteId,
                }
            });

            modal.result.then(function () {
                if (onCerrar != null)
                    onCerrar(true);
            }, function () {
                if (onCerrar != null)
                    onCerrar(false);
            });
        };
        
        return service;
    }]);

mainApp.controller('cambioPasswordUsuarioClienteController',
    ['$scope', '$http', 'clienteId', '$uibModalInstance',
        function ($scope, $http, clienteId, $uibModalInstance) {

            $scope.clienteId = clienteId;

            $scope.cliente = null;
            $scope.modelo = {
                newPassword: null,
                newPasswordRep: null,
                currentPassword: null
            };

            var init = function () {


            };

            $scope.confirmarCambioDePassword = function () {

                ShowLoader();

                $http.post(GetUrlForService('/UsuariosClientes/CambiarPassword'), {
                    newPassword: $scope.modelo.newPassword,
                    newPasswordRep: $scope.modelo.newPasswordRep,
                    currentPassword: $scope.modelo.currentPassword,
                    clienteId: $scope.clienteId
                }).then(function (resp) {

                    HideLoader();

                    if (resp.data.error == 0) {
                        ShowMessageBox(messageType_Success, "Exitoso", "El cambio de contraseña se ha realizado exitósamente");
                        $scope.modelo.newPassword = null;
                        $scope.modelo.newPasswordRep = null;
                        $scope.modelo.currentPassword = null;
                        $uibModalInstance.close();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", resp.data.message);
                    }

                }, function (resp) {
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                    ShowLoader();
                });
            };

            $scope.cerrar = function () { $uibModalInstance.dismiss(); };
            init();

    }]);