    /// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_buscarCalles").click(
          function () { Modelo.BuscarCalles(); return false; }
      );

    },
    BuscarCalles: function () {

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
                        $('#tb_resultadoCalles').dataTable();
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

    EliminarCalle: function (calle_id) {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/Calles/EliminarCalle"),
                data: { calle_id: calle_id },
                success: function (data) {

                    if (data.error == "0") {

                        HideLoader();
                        ShowMessageBox(messageType_Success, "Se eliminó con éxito: ", data.message);
                        Modelo.BuscarCalles();
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
