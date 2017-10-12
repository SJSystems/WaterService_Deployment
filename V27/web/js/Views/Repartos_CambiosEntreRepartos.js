/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $('.dd').nestable({ maxDepth: 1 });
        $('.dd-handle a').on('mousedown', function (e) {
            e.stopPropagation();
        });

        $("#btn_GuardarCambios").click(
            function () {
                Modelo.GuardarCambios();
                }
            );

        $("#btn_obtenerReparto").click(
            function () {
                Modelo.ObtenerDatosDeReparto();
            }
        );

        //$("#txt_buscarCliente").keyup(function (event) {
        //    Modelo.BuscarClienteEnLista(event);
        //});

        //$("#cmb_repartos").val(getParameterByName("origen_reparto_id"));
        //$("#cmb_dias").val(getParameterByName("dia_id"));

    }
    , GuardarCambios: function () {
        try {

            ShowLoader();

            var clientesOrdenados = $("#list_Ordenados").find(".row_cliente");
            var clientesNoOrdenados = $("#list_NoAsignados").find(".row_cliente");;

            var reparto_id = getParameterByName("reparto_id");
            var dia_id = getParameterByName("dia_id");

            for (var i = 0; i < clientesOrdenados.length; i++) {

                var posicion = i + 1;

                var cliente = $(clientesOrdenados[i]);

                var ordenActual = cliente.attr("ordenCliente").replace(",00", "").replace(".00", "");

                if (posicion != ordenActual) {

                    cliente.find(".haCambiado").val("1");
                    cliente.find(".orden").val(posicion);
                }
            }

            for (var i = 0; i < clientesNoOrdenados.length; i++) {

                var cliente = $(clientesNoOrdenados[i]);

                var ordenActual = cliente.attr("ordenCliente").replace(",00", "").replace(".00", "");

                if (ordenActual != "0") {

                    cliente.find(".haCambiado").val("1");
                    cliente.find(".orden").val("0");
                }
            }

            var form = $('#form_hojaDeRuta');

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

                        HideLoader();

                        ShowMessageBox(messageType_Success, "Exitoso: ", data.message);

                        window.location.reload();
                    }
                    else {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error: ", data.message);
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
    , ObtenerDatosDeReparto: function () {

        window.location.href = GetCurrentURLRoot() + "/Repartos/CambiosRepartos?origen_reparto_id=" + $("#cmb_repartos_origen").val() + "&origen_dia_id=" + $("#cmb_dias_origen").val() + "&destino_reparto_id=" + $("#cmb_repartos_destino").val() + "&destino_dia_id=" + $("#cmb_dias_destino").val();
    }
    , BuscarClienteEnLista: function (event) {

        var valorBuscado = $("#txt_buscarCliente").val().toUpperCase();

        if (valorBuscado.trim() == "")
        {
            $(".registroCliente").removeClass("registroEncontrado");
            return;
        }

        var resultados = $(".valorBuscar");

        $(".registroCliente").removeClass("registroEncontrado");

        for (var i = 0; i < resultados.length; i++) {

            if ($(resultados[i]).val().toUpperCase().indexOf(valorBuscado) >= 0) {

                var cliente_id = $(resultados[i]).attr("cliente_id");
                $("#registro_" + cliente_id).addClass("registroEncontrado");
            }
            else {

            }
        }

    }
}

