/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_submit").click(
          function () { Modelo.BuscarVentas(); return false; }
      );
    },

    BuscarVentas: function () {

        try {

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
                        $('#tbl_Ventas').dataTable();
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
    }
}