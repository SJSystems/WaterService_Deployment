/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_buscar").click(
          function () { Modelo.Buscar(); return false; }
      );

    },
    Buscar: function () {

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
                        $('#tb_resultadoBarrios').dataTable();
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

    EliminarBarrio: function (barrio_id) {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/Barrios/EliminarBarrio"),
                data: { barrio_id: barrio_id },
                success: function (data) {

                    if (data.error == "0") {

                        HideLoader();
                        ShowMessageBox(messageType_Success, "Se eliminó con éxito: ", data.message);
                        Modelo.Buscar();
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
    }
};
