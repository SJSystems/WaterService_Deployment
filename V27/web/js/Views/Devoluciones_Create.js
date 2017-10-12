/// <reference path="../General_OnLoad.js" />

var Modelo = {
    Init: function() {

        $("#div_BuscarClienteDialogo").dialog(
            {
                autoOpen: false,
                height: 500,
                width: 1000,
                modal: true
            }
        );
        

    }
    , AbrirDialogo_SeleccionarCliente: function () {

        try {

            if (this.PantallaBusquedaClienteCargada) {
                $("#div_BuscarClienteDialogo").dialog("open");
                return;
            }

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/BusquedaRapida"),
                success: function (data) {

                    $("#div_BuscarClienteDialogo").html(data);
                    HideLoader();
                    $("#div_BuscarClienteDialogo").dialog("open");

                    RePrepareView($("#div_BuscarClienteDialogo"));

                    $("#btn_submit").click(
                        function () {
                            ModeloBuscarClientes.BuscarClientes();
                            return false;
                        }
                    );

                    Modelo.PantallaBusquedaClienteCargada = true;
                },
                error: function (data) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                }
            });
        } catch (e) {
            HideLoader();
        }
    }
    ,SeleccionarCliente: function(cliente_id) {

    try {

        //Trae los datos del cliente seleccionado
        $("#div_BuscarClienteDialogo").dialog("close");
        ShowLoader();

        $.ajax({
            cache: false,
            async: true,
            type: "POST",
            url: GetUrlForService("/Devoluciones/ObtenerSeccionClienteDevolucion"),
            data: {
                cliente_id: cliente_id
            },
            success: function(data) {

                if (data != null && data != "") {

                    $("#div_SeccionCliente").html(data);
                    RePrepareView($("#div_SeccionCliente"));

                    $("#txt_clienteSeleccionado").val($("#ClienteActual_nombreCliente").val());
                    $("#txt_clienteId").val($("#ClienteActual_cliente_id").val());
                    
                    HideLoader();

                    Set_Eventos_Change();
                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
                }


            },
            error: function(data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
            }
        });

    } catch(e) {
        HideLoader();
    }

    }

};

//function SeleccionarCliente(cliente_id) {
//    Modelo.SeleccionarCliente(cliente_id);
//}