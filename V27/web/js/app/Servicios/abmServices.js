

mainApp.factory('abmServices', ['$http', '$uibModal', '$q',
    function ($http, $uibModal, $q) {

        var service = {};

        service.abrirDialogo = function (templateUrl,
                           controller, resolve, onClose) {

            var modal = $uibModal.open({
                templateUrl: templateUrl,
                controller: controller,
                size: 'lg',
                backdrop: 'static',
                resolve: resolve
            });

            modal.result.then(
                function (resp) {
                    if (onClose != null)
                        onClose(true, resp);
                },
                function (resp) {
                    if (onClose != null)
                        onClose(false, resp);
                });
        };

        service.eliminar = function (id, url, onClose) {

            bootbox.confirm("Está seguro que desea eliminar", function (result) {

                if (result) {
                    ShowLoader();

                    $http.post(url, {
                        id: id
                    })
                    .then(function (resp) {

                        if (resp.data.error == 0) {
                            ShowMessageBox(messageType_Success, "Elemento eliminado con éxito. ");
                            HideLoader();
                        }
                        if (onClose != null)
                            onClose(true, resp);
                    }, function (resp) {
                        if (onClose != null)
                            onClose(false, resp);
                    });

                    HideLoader();
                }
            });

        };

        service.buscarAutoCompleteCliente = function (onClose) {

            var url = GetUrlForService('/Clientes/BusquedaRapidaResultJson');
            $http.post(url,
                {
                    modelo: {
                        datosCliente: ""
                    }
                }
                ).then(function (resp) {

                    if (resp.data.error === 0) {
                        var arrayClientes = resp.data.data;

                        if (onClose != null) {
                            onClose(true, arrayClientes);
                        }
                    }
                }, function (resp) {
                    if (onClose != null)
                        onClose(false, resp);
                });
        }



        return service;
    }]);


