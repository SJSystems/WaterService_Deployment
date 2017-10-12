/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

mainApp.controller('publicacionesController', ['$scope', '$http', '$uibModal',
    function ($scope, $http, $uibModal) {

        $scope.init = function () {

        };

        $scope.obtenerPublicaciones = function () {

            ShowLoader();

            $http.get(GetUrlForService('/Publicaciones/ObtenerPublicaciones')).then(
                function (resp) {
                    HideLoader();
                    $scope.publicaciones = resp.data.publicaciones;
                },
                function () {
                    HideLoader();
                }
            );
        };

        $scope.nuevaPublicacion = function () {

            var modal = $uibModal.open({
                templateUrl: '/js/app/views/publicaciones/nuevaPublicacion.html',
                controller: 'nuevaPublicacion',
                size: 'lg',
                backdrop: 'static'
            });
            modal.result.then(function () {

            }, function () {

            });
        };

        $scope.eliminarPublicacion = function (publicacion) {

            bootbox.confirm("Está seguro que desea eliminar la publicación '" + publicacion.titulo + "'", function (result) {

                if (result) {
                    ShowLoader();

                    $http.post(GetUrlForService('/Publicaciones/Eliminar'), {
                        id: publicacion.id,
                        archivos: publicacion.archivos
                    })
                    .success(function (data) {

                        if (data.error == 0) {
                            ShowMessageBox(messageType_Success, "Publicación eliminada con éxito. ");
                            $scope.obtenerPublicaciones();
                        }
                        HideLoader();
                    })
                    .error(function (data) {
                        HideLoader();
                    });
                }
            });
        };

        $scope.init();
    }]);


mainApp.controller('nuevaPublicacion', ['$scope', '$http', '$uibModalInstance', 'fileUploaderService',
    function ($scope, $http, $uibModalInstance, fileUploaderService) {

        $scope.publicacion = {};

        $scope.init = function () {

            $http.get(GetUrlForService('/Publicaciones/GetDataForCrearPublicacion')).then(
                function (resp) {
                    $scope.tiposPublicaciones = resp.data.tiposPublicaciones;

                    if ($scope.tiposPublicaciones.length > 0)
                        $scope.publicacion.tipoPublicacion_ids = $scope.tiposPublicaciones[0].valor_ids;
                }
            );
        };

        $scope.validar = function () {
            var msj = "";

            //if ($scope.movil.descripcion == null || $scope.movil.descripcion == "")
            //    msj = msj + "Debe ingresar una descripción. ";

            return { isValid: (msj == ""), message: msj };
        };

        $scope.crearPublicacion = function () {

            var validation = $scope.validar();

            if (!validation.isValid) {
                ShowMessageBox(messageType_Error, "Error de validación", validation.message);
                return;
            }

            try {

                ShowLoader();

                fileUploaderService.uploadFiles($scope.publicacion, GetUrlForService('/Publicaciones/CrearPublicacion'))
                    .then(function (resp) {

                        HideLoader();

                        if (resp.error == 0) {
                            $uibModalInstance.close();
                        } else {
                            ShowMessageBox(messageType_Error, "Error", resp.message);
                        }
                    });

            } catch (e) {
                HideLoader();
            }

        };

        $scope.cerrar = function () {
            $uibModalInstance.dismiss();
        };

        $scope.init();
    }]);

