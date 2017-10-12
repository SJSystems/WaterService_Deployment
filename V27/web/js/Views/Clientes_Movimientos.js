/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {
        // llamada ajax al otro controller, simulando como si hubiera hecho click en un boton

        Modelo.LlamarMovimientos();

    }

    , LlamarMovimientos: function () {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Movimientos/BuscarMovimientos"),
                data: {
                    cliente_id: $("#ClienteModelo_id").val()
                },
                success: function (data) {

                    $("#div_resultadoBusqueda").html(data);

                    HideLoader();

                    PrepareView();

                    MovimientosModelo.Init();

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