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
};

function SeleccionarCliente(cliente_id)
{
    
}