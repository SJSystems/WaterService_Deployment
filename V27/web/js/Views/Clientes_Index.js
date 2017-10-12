/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_submit").click(
          function () { Modelo.BuscarClientes(); return false;}
      );
    }
    , BuscarClientes: function () {

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
                        $('#tb_resultadoClientes').dataTable();
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
                data: {cliente_id:cliente_id},
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
    , EliminarCliente: function (clienteId) {

        var clienteSeleccionado = clienteId;
        var self = this;
        
        bootbox.confirm("Confirma que desea el cliente (" + clienteId + ")? " +
            "Podrá ser activado nuevamente por un administrador.", function (result) {
                if (result) {

                    ShowLoader();

                    ShowLoader();
                    $.ajax({
                        cache: false,
                        async: true,
                        type: "POST",
                        url: GetUrlForService('/Clientes/EliminarCliente'),
                        data: {
                            clienteId: clienteSeleccionado
                        },
                        success: function (data) {

                            HideLoader();
                            if (data.error == 0) {

                                ShowMessageBox(messageType_Success, "Exitoso", data.message);
                                self.BuscarClientes();

                            } else {
                                ShowMessageBox(messageType_Error, "Error", data.message);
                            }
                        }
                        , error: function (data) {
                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
                        }
                    });

                }
            });


    }
}