/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />

var mainApp = angular.module(
   'mainApp',
    [
        'usuariosControllers'
    ]
);

var usuariosControllers = angular.module('usuariosControllers', []);

usuariosControllers.controller('buscarUsuariosController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.usuarios = [];
        $scope.nombreApellido = "";

        $scope.EliminarUsuario = function (id) {
            ShowLoader();

            $http.post(GetUrlForService('/Usuarios/Delete'), {
                id: id
            }).success(function (data, status, headers, config) {
                if (data.error == 0) {

                    HideLoader();
                    ObtenerUsuarios();

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


        $scope.ObtenerUsuarios = function () {

            ShowLoader();

            $http.post(GetUrlForService('/Usuarios/ObtenerUsuarios'), {
                nombreApellido: $scope.nombreApellido
            }).success(function (data, status, headers, config) {

                $scope.usuarios = null;

                if (data.error == 0) {

                    $scope.usuarios = data.usuarios;

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
    }]);

usuariosControllers.controller('nuevoUsuarioController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.id = getParameterByName("id");
        $scope.roles = [];
        $scope.grupos = [];
        $scope.rolesUsuario = [];
        $scope.accion = "";
        $scope.usuario =
        {
            id: 0,
            activo: true
        };

        $scope.nombreApellido = "";

        $scope.Init = function () {

            $scope.ObtenerRoles();

            if ($scope.id != 0) {
                $scope.GetUserById();
                $scope.accion = "Editar Usuario";
            } else {
                $scope.accion = "Registrar Usuario";
            }
        };

        $scope.ObtenerRoles = function () {

            $http.get(GetUrlForService('/Usuarios/ObtenerRoles'), null
            ).success(function (data, status, headers, config) {

                if (data.error == 0) {

                    $scope.roles = data.roles;
                    $scope.grupos = data.grupos;
                    seleccionarRoles();
                    seleccionarGrupos();
                }

            }).error(function (data, status, headers, config) {
            });
        };        
        
        $scope.GetUserById = function () {
            $http.post(GetUrlForService('/Usuarios/ObtenerUsuarioById'),
            {
                id: $scope.id

            }).success(function (data, status, headers, config) {
                if (data.error == 0) {
                    $scope.usuario = data.usuario;
                    seleccionarRoles();
                    seleccionarGrupos();
                }
            }).error(function (data, status, headers, config) {
                HideLoader();
            });
        };

        $scope.ValidateUser = function () {
            var msj = "";

            if ($scope.usuario.nombreApellido == null)
                msj = "Debe ingresar el nombre del usuario. ";
            if ($scope.usuario.userName == null)
                msj = msj + "Debe ingresar un usuario. ";
            if ($scope.usuario.password == null)
                msj = msj + "Debe ingresar un password. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.Save = function () {
            var validation = $scope.ValidateUser();
            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
            } else {

                if ($scope.grupos!=null)
                    $scope.usuario.IdsGrupos = $scope.grupos.filter(function (x) { return x.selected === true; }).map(function (x) { return x.valor_ids });

                ShowLoader();
                $http.post(GetUrlForService('/Usuarios/Save'),
                {
                    usuario: $scope.usuario,
                    roles: obtenerRolesSeleccionados()

                }).success(function (data, status, headers, config) {
                    if (data.error == 0) {
                        HideLoader();
                        window.location.href = "/Usuarios/BuscarUsuario/";
                    } else {
                        HideLoader();
                    }
                }).error(function (data, status, headers, config) {
                    HideLoader();
                });
            }
        };

        $scope.Init();

        var obtenerRolesSeleccionados = function() {
            var rolesSeleccionados = [];

            for (var i = 0; i < $scope.roles.length; i++) {
                if ($scope.roles[i].selected)
                    rolesSeleccionados.push({ rol_id: $scope.roles[i].id });
            }

            return rolesSeleccionados;
        };

        var seleccionarRoles = function() {

            if ($scope.usuario.RolesDelUsuario == null || $scope.roles == [])
                return;

            for (var i = 0; i < $scope.roles.length; i++) {
                $scope.roles[i].selected = tieneRol($scope.roles[i].id, $scope.usuario.RolesDelUsuario);
            }

        };

        var seleccionarGrupos = function () {

            if ($scope.usuario.IdsGrupos == null || $scope.grupos == null || $scope.grupos == [])
                return;

            for (var i = 0; i < $scope.grupos.length; i++) {
                $scope.grupos[i].selected = tieneGrupo($scope.grupos[i].valor_ids);
            }

        };

        var tieneGrupo = function (idGrupo) {

            var grupo = $scope.usuario.IdsGrupos.filter(function (x) { return x == idGrupo; });
            return grupo.length > 0;
        };

        var tieneRol = function(rolId, rolesDelUsuario) {

            for (var i = 0; i < rolesDelUsuario.length; i++) {
                if (rolesDelUsuario[i].rol_id == rolId)
                    return true;
            }

            return false;
        };

    }]);

