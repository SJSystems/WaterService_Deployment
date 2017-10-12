/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_guardarCliente").click(
                function () { Modelo.GuardarCliente(); }
            );

        $("#dialog_sucursales").dialog(
        {
            autoOpen: false,
            height: 550,
            width: 850,
            modal: true
        }
    );
    },

    GuardarCliente: function () {

        try {
            
            var form = $('#form_edit');

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

                    if (data.error == 0) {
                        ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error en el ingreso: ", data.message)
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

    ,VerSucursales:function(){
        
        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/ObtenerSucursales"),
                data: {
                    cliente_id: $("#ClienteModelo_id").val()
                },
                success: function (data) {

                    $("#dialog_sucursales").html(data);
                    HideLoader();

                    $("#dialog_sucursales").dialog("open");
                }
                , error: function (data) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                }
            });
        } catch (e) {
            HideLoader();
        }
    
    }

    , CompletarCliente: function (cliente_id) {

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
                url: GetUrlForService("/Clientes/CompletarCliente"),
                data: { cliente_id: cliente_id },
                success: function (data) {

                    if (data.error == "0") {

                        HideLoader();
                        ShowMessageBox(messageType_Success, "Exitoso: ", data.message);
                    }
                    else {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error al completar el cliente: ", data.message);
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
}