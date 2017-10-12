/// <reference path="../General_OnLoad.js" />

var ModeloBuscarClientes = {

    Init: function () {

      //  $("#btn_submit").click(
      //    function () { ModeloBuscarClientes.BuscarClientes(); return false; }
      //);
    }
    
    ,BuscarClientes: function () {

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
                        RePrepareView($("#div_resultadoBusqueda"));
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
    , GetDatosCliente: function (cliente_id) {
        
        var r=  $.ajax({
            cache: false,
            async: false,
            type: "POST",
            url: GetUrlForService("/Clientes/ObtenerDatosCliente"),
            data: {
                cliente_id: cliente_id
            }
        });

        return r.responseJSON;

    }
}