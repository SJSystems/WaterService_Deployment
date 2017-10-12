/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_submit").click(
          function () { Modelo.BuscarArticulos(); return false; }
      );
    },
    BuscarArticulos: function () {

        try {

            ShowLoader();

            var form = $('#form_buscar');

            var validation = ValidateForm(form);
            if (!validation.validated) {
                ShowMessageBox(messageType_Error, "Error: ", validation.mensaje);
                return false;
            }
            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: form.attr('action'),
                data: form.serialize(),
                success: function (data) {

                    if (data != null && data != "") {

                        $("#div_resultadoBusqueda").html(data);
                        $('#tb_resultadoArticulos').dataTable();
                        HideLoader();
                    }
                    else {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
                    }
                }
                , error: function (data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
                }
            });

        } catch (e) {
            HideLoader();
        }
    },
    EliminarArticulo: function (Articulo_id) {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/Articulos/EliminarArticulo"),
                data: { Articulo_id: Articulo_id },
                success: function (data) {

                    if (data.error == "0") {

                        HideLoader();
                        ShowMessageBox(messageType_Success, "Se eliminó con éxito: ", data.message);
                        Modelo.BuscarArticulos();
                    }
                    else {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error al eliminar el articulo: ", data.message);
                    }
                }
                , error: function (data) {
                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }
    },
    AbrirMovimientoDeStock: function (articuloId) {

        var scope = angular.element($("#div-buscar-articulos")).scope();
        scope.abrirMovimientoDeStock(articuloId);
    }
};
