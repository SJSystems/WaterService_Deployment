/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

mainApp.controller('opcionesXRolesController', ['$scope', '$http',
    function($scope, $http) {
        $scope.todosRolesSelected = false;
        $scope.roles = [];
        $scope.opciones = [];
        $scope.opcionesXRoles = [];

        $scope.configuraciones = [];

        $scope.init = function() {

            $http.get(GetUrlForService('/Security/ObtenerRolesYOpciones'), null).
                success(function(data, status, headers, config) {

                    if (data.error == 0) {

                        $scope.roles = data.roles;
                        $scope.opciones = data.opciones;
                        $scope.opcionesXRoles = data.opcionesXRoles;

                        for (var i = 0; i < $scope.opciones.length; i++) {
                            var config = obtenerOpcion($scope.opciones[i], $scope.roles, $scope.opcionesXRoles);
                            $scope.configuraciones.push(config);
                        }

                        var modulos = [];

                        angular.forEach($scope.configuraciones, function (config, i) {

                            var item = config.opcion;

                            var m = modulos.filter(function (x) { return x.nombre == item.modulo });
                            var modulo = null;

                            if (m.length == 0) {
                                modulo = { nombre: item.modulo, funcionalidades: [] };
                                modulos.push(modulo);
                            } else {
                                modulo = m[0];
                            }

                            var f = modulo.funcionalidades.filter(function (x) { return x.nombre == item.funcionalidad});
                            var funcionalidad = null;

                            if (f.length == 0) {
                                funcionalidad = { nombre: item.funcionalidad, configuraciones:[] };
                                modulo.funcionalidades.push(funcionalidad);
                            } else {
                                funcionalidad = f[0];
                            }
                            
                            funcionalidad.configuraciones.push(config);

                        });

                        $scope.modulos = modulos;

                    } else {

                    }

                }).error(function(data, status, headers, config) {

                });
        };

        $scope.asignarPermiso = function ( _opcionId, _rolId) {

            ShowLoader();

            $http.post(GetUrlForService('/Security/AsignarPermiso'),
              {
                  opcionId: _opcionId,
                  rolId: _rolId
              }).
              success(function (data, status, headers, config) {

                if (data.error == 0) {
                    $scope.asignarPermisoOpcion(data.opcion_id, data.rol_id, true);
                }

                HideLoader();

              }).error(function (data, status, headers, config) {
                  HideLoader();
                  ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
              });
        };

        $scope.quitarPermiso = function (_opcionId, _rolId) {

            ShowLoader();

            $http.post(GetUrlForService('/Security/QuitarPermiso'),
              {
                  opcionId: _opcionId,
                  rolId: _rolId
              }).
              success(function (data, status, headers, config) {

                  if (data.error == 0) {
                      $scope.asignarPermisoOpcion(data.opcion_id, data.rol_id, false);
                  }

                  HideLoader();

              }).error(function (data, status, headers, config) {
                  HideLoader();
                  ShowMessageBox(messageType_Error, "Error", "Se ha producido un error al modificar los precios.");
              });
        };
        
        $scope.asignarPermisoOpcion = function (opcionId, rolId, valor) {
            for (var i = 0; i < $scope.configuraciones.length; i++) {
                if ($scope.configuraciones[i].opcion.id == opcionId) {
                    for (var j = 0; j < $scope.configuraciones[i].roles.length; j++) {
                        if ($scope.configuraciones[i].roles[j].rol.id == rolId) {
                            $scope.configuraciones[i].roles[j].asignado = valor;
                            return;
                        }
                    }
                }
            }
        };

        $scope.onTodosRolesSelectedClick = function () {

            angular.forEach($scope.roles, function (item, i) {
                item.visible = $scope.todosRolesSelected; 
            });
        }

        $scope.init();

    }]);

var obtenerOpcion= function(opcion, roles, configuracion) {

    var config = { opcion: opcion, roles:[] };

    for (var i = 0; i < roles.length; i++) {
        config.roles.push({ rol: roles[i], asignado: false });
    }

    for (var j = 0; j < configuracion.length; j++) {

        if (configuracion[j].opcion_id == opcion.id) {

            for (var k = 0; k < config.roles.length; k++) {
                if (config.roles[k].rol.id == configuracion[j].rol_id) {
                    config.roles[k].asignado = true;
                }
            }
        }
    }
    
    return config;
}
