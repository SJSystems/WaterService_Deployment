/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        //Capturo y configuro el click de los botones
        $("#btn_guardarContacto").click(
            function () {  Modelo.GuardarContacto();}
            );

        $("#btn_agregarContacto").click(
            function () { Modelo.AbrirDialogoCreate(); }
            );

        //Convierto a Dialog los div que deseo
        $("#div_addContact").dialog(
                {
                    autoOpen: false,
                    height: 550,
                    width: 800,
                    modal: true
                }
            );
    }
    ,GuardarContacto: function() {

        try {

            ShowLoader();

            var form = $('#form_create');

            var validation = ValidateForm(form);
            if (!validation.validated) {

                ShowMessageBox(messageType_Error, "Error: ", validation.mensaje);
                return false;
            }
            // 
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: form.attr('action'),
                data: form.serialize(),
                success: function (data) {

                    HideLoader();

                    $("#div_addContact").dialog("close");

                    if (data.error == 0) {

                        window.location.reload();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar el cliente: ", data.message);
                    }
                 
                }
                , error: function (data) {
                    $("#div_addContact").dialog("close");
                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }


    }
    ,EliminarContacto: function (contacto_id) {

        bootbox.confirm("Confirma eliminar el contacto seleccionado?", (confirm) => {

            if (confirm) {

                ShowLoader();

                $.ajax({
                    cache: false,
                    async: true,
                    type: "POST",
                    url: "/Clientes/EliminarContacto",
                    data: {
                        contacto_id: contacto_id
                    },
                    success: function (data) {

                        HideLoader();

                        if (data.error == 0) {
                            window.location.reload();
                        }
                        else {
                            ShowMessageBox(messageType_Error, "Error al guardar el cliente: ", data.message);
                        }

                    }
                    , error: function (data) {
                        HideLoader();
                    }
                });
            }
        });

    }
    ,AbrirDialogoCreate: function () {
        
        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/CreateContacto"),
                data: {
                    cliente_id: $("#ClienteModelo_id").val()
                },
                success: function (data) {
                    
                    $("#div_ContactoContent").html(data);
                    HideLoader();
                    
                    $("#div_addContact").dialog("open");
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
    ,AbrirDialogoEdit: function (contacto_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/EditContacto"),
                data: {
                    contacto_id: contacto_id
                },
                success: function (data) {

                    $("#div_ContactoContent").html(data);
                    HideLoader();

                    $("#div_addContact").dialog("open");
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

}
