/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_submit").click(
            function () { Modelo.BuscarClientes(); return false; }
        );
        
        $("#dialogo_seleccionRepartoDias").dialog(
               {
                   autoOpen: false,
                   height: 500,
                   width: 800,
                   modal: true
               }
           );
    }
    , Preguntar_CambiarReparto: function () {
       
        //bootbox.confirm("Está seguro que desea cambiar el reparto y el día para los clientes seleccionados?", function (result) {

        //    if (result) {
        //        Modelo.ConfirmarCambioReparto();
        //    }
        //});

        $("#dialogo_seleccionRepartoDias").dialog('open');
    }
    , ConfirmarCambioReparto: function () {
        
        var reparto_id = $("#cmb_nuevoRepartos").val();
        var dias = new Array();
        var clientes = new Array();
        
        //Por cada día
        var chk_dias = $(".checkbox-dia");
        for (var i = 0; i < chk_dias.length; i++) {

            //Pregunto si está tildado
            if ($(chk_dias[i]).prop('checked')) {
                dias.push($(chk_dias[i]).attr("dia_id"));
            }
        }

        //Buscar clientes seleccionados
        var chk_clientes = $(".seleccionar-cliente");
        for (var i = 0; i < chk_clientes.length; i++) {
            
            if ($(chk_clientes[i]).prop('checked')) {
                clientes.push($(chk_clientes[i]).attr("cliente_id"));
            }
        }

        var mantenerOrden = $("#ck-mantener-orden").prop('checked');

        var mensaje = "";

        if (clientes.length == 0) {
            mensaje += "Debe seleccionar al menos un cliente. ";
        }
        
        if (dias.length == 0) {
            mensaje += "Debe seleccionar al menos un día de la semana. ";
        }

        if (mensaje!="") {
            ShowStaticMessage_Error(mensaje, "#dialogo_seleccionRepartoDias");
            return;
        }
        
        //Proceso de guardar
        try {

            ResetStaticMessage("#dialogo_seleccionRepartoDias");
            $("#btn_confirmarCambios").attr("disabled", true);

            $.post(
                GetUrlForService("/Repartos/CambioMasivoRepartosDias"),
                $.param(
                {
                    clientes_id: clientes,
                    reparto_id: reparto_id,
                    dias_id: dias,
                    mantenerOrden: mantenerOrden
                }, true),
                function (data) {

                    if (data.error == 0) {

                        $("#dialogo_seleccionRepartoDias").dialog("close");
                        //ShowMessageBox(messageType_Success, "Exitoso", data.message);
                        Modelo.BuscarClientes();
                    }
                    else {
                        ShowStaticMessage_Error(data.message, "#form_createAbono");                        
                    }

                    $("#btn_confirmarCambios").attr("disabled", false);

                });

        } catch (e) {
            HideLoader();
        }
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
                        //$('#tb_resultadoClientes').dataTable();

                        $('#ck-seleccionar-todos').change(function () {

                            var todosSeleccionados = $(this).is(":checked");

                            //Buscar clientes seleccionados
                            var chk_clientes = $(".seleccionar-cliente");
                            for (var i = 0; i < chk_clientes.length; i++) {

                                $(chk_clientes[i]).prop('checked', todosSeleccionados);
                            }

                        });



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
}

