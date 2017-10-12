/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_guardar").click(
                function () { Modelo.Guardar(); }
            );
    },
    

    Guardar: function () {

        try {

            ShowLoader();

            var form = $('#form_edit');

            var validation = ValidateForm(form);
            if (!validation.validated) {

                ShowMessageBox(messageType_Error, "Error: ", validation.mensaje);
                return false;
            }

            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: form.attr('action'),
                data: form.serialize(),
                success: function (data) {
                    
                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);
                        window.location.href = "/Dispensers/Edit/" + data.dispenser_id;
                        //window.location.reload;
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar el Dispenser: ", data.message)
                    }
                    HideLoader();
                }
                , error: function (data) {

                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }
    }
    
}