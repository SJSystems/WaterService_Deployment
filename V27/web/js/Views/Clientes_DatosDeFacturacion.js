/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_facturacion").click(
                function () { Modelo.GuardarDatosFacturacion(); }
            );
        

        $("#btn_borrarCiclo").click(
                function (event) {
                    Modelo.EliminarCiclo(event);
                }
            );

        $("#dialog_ciclosFacturacion").dialog
          (
              {
                  autoOpen: false,
                  height: 500,
                  width: 700,
                  modal: true
              }
          );
        
        $("#dialog_diasFacturacion").dialog
          (
              {
                  autoOpen: false,
                  height: 500,
                  width: 700,
                  modal: true
              }
          );

        //$("#btn_collapse").click();

    }

    ,GuardarDatosFacturacion: function () {
        
        try {
            
            var form = $('#form_edit');

            //Si está seleccionado Consumidor Final
            if ($("#DatosFacturacionModelo_condicionIva_ids").val()=="2") {

                $("#DatosFacturacionModelo_domicioFiscal").removeClass("validate");
                $("#DatosFacturacionModelo_cuit").removeClass("validate");
                $("#DatosFacturacionModelo_ingresosBrutos").removeClass("validate");
                $("#DatosFacturacionModelo_dniPersona").addClass("validate");
                
            } else {
                $("#DatosFacturacionModelo_domicioFiscal").addClass("validate");
                $("#DatosFacturacionModelo_cuit").addClass("validate");
                $("#DatosFacturacionModelo_ingresosBrutos").addClass("validate");
                $("#DatosFacturacionModelo_dniPersona").removeClass("validate");
            }
            
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

                    if (data.error == 0) {
                        ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar los datos: ", data.message)
                    }

                    HideLoader();
                }
                , error: function (data) {
                    HideLoader();
                }
            });
        } catch (e) {
            HideLoader();
        }
    
    }
    ,AbrirDialogoCiclosFacturacion: function () {

        //$("#dialog_ciclosFacturacion").dialog('open');
        
        $("#dialog_diasFacturacion").dialog('open');
    }
    ,AgregarCiclo: function () {

        var nuevoTr = $("#tr_template").clone();       
        var nuevoIndice = $(".tr_resultado").length;
        nuevoTr.removeClass("hide");
        nuevoTr.addClass("tr_resultado");

        nuevoTr.html(nuevoTr.html().split("{0}").join(nuevoIndice));

        var tbody_resultado = $("#tbody_resultado")[0];
        tbody_resultado.appendChild(nuevoTr[0]);

        SetFieldDecimalFormat();

    }
    ,EliminarCiclo: function (event) {

        var btn = $(event);
        
        btn.parent().parent().addClass("hide");
        btn.parent().parent().find(".txt_eliminado").val("1");

    }
    ,MostrarErrorCiclos:function(mensaje){

        var alerta = $("#div_errorAlert");

        alerta.removeClass("hide");

        $("#mensajeResultado").text(mensaje);
    }
    , GuardarCiclosFacturacion: function () {

        try {

            var form = $('#form_cicloFacturacion');

            var validation = ValidateForm(form);
            if (!validation.validated) {

                Modelo.MostrarErrorCiclos(validation.mensaje);
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

                        $("#dialog_ciclosFacturacion").dialog("close");

                        ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);

                        window.location.reload();
                    }
                    else {

                        Modelo.MostrarErrorCiclos(data.message);                       
                    }

                }
                , error: function (data) {
                    Modelo.MostrarErrorCiclos("Error");
                }
            });
        } catch (e) {
            Modelo.MostrarErrorCiclos("Error");
        }
    }
    , RedirectOrdenDeCompra: function (id) {
        //$("ul.tabs li").removeClass("active"); //Remove any "active" class
        $("#tabs ul li").removeClass("active")

        $(this).addClass("active"); //Add "active" class to selected tab
        $(".tab_content").hide(); //Hide all tab content

        var activeTab = $(this).find("a").attr("href"); //Find the href attribute value to
        //identify the active tab + content
        $(activeTab).fadeIn(); //Fade in the active ID content
        //return false;

        window.location.href = "/Clientes/EditOrdenes/" + id;
    }
}