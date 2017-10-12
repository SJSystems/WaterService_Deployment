/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_agregarComodato").click(
            function () { Modelo.AbrirDialogoCreate(); }
            );

        $("#div_addComodato").dialog(
                {
                    autoOpen: false,
                    height: 550,
                    width: 800,
                    modal: true
                }
            );
    }
    ,GuardarComodato: function() {

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

                    $("#div_addComodato").dialog("close");

                    if (data.error == 0) {

                        window.location.reload();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar el comodato del cliente: ", data.message);
                    }
                 
                }
                , error: function (data) {
                    $("#div_addComodato").dialog("close");
                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }


    }
    ,DesactivarComodato: function (comodato_id) {
        
        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/Comodatos/DesactivarComodato"),
                data: {
                    comodato_id: comodato_id
                },
                success: function (data) {

                    HideLoader();

                    $("#div_addComodato").dialog("close");

                    if (data.error == 0) {

                        window.location.reload();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar el comodato del cliente: ", data.message);
                    }
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
    ,AbrirDialogoCreate: function () {
        
        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Comodatos/CreateFromCliente"),
                data: {
                    cliente_id: $("#ClienteModelo_id").val()
                },
                success: function (data) {
                    
                    $("#div_ComodatoContent").html(data);
                    
                    HideLoader();
                    
                    $("#div_addComodato").dialog("open");

                    //PrepareView();

                    SetChosenSelectControl($("#ComodatoModel_articulo_id"));
                    RePrepareView($("#div_addComodato"));
                    

                    //SetFieldDecimalFormat();
                    //SetChosenSelect();
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
    , AbrirDialogoEdit: function (comodato_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Comodatos/EditFromCliente"),
                data: {
                    comodato_id: comodato_id
                },
                success: function (data) {

                    $("#div_ComodatoContent").html(data);
                    HideLoader();

                    $("#div_addComodato").dialog("open");
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
