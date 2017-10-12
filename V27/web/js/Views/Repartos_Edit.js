/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $('.dd').nestable({ maxDepth: 1 });
        $('.dd-handle a').on('mousedown', function (e) {
            e.stopPropagation();
        });

        $("#ConfigurarRuta").click(
            function () {

                Modelo.GuardarCambios();
            }

            );

    }
    , GuardarCambios: function () {


    }
    , ObtenerDatosDeReparto: function () {


    }


}