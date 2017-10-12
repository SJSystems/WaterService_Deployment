/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_agregarOrden").click(
            function () { Modelo.AbrirDialogoCreate(); }
            );

        $("#div_addOrden").dialog(
                {
                    autoOpen: false,
                    height: 550,
                    width: 800,
                    modal: true
                }
            );


        //When page loads...
        $(".tab_content").hide(); //Hide all content
        $("ul.myTab li:first").addClass("active").show(); //Activate first tab
        $(".tab_content:first").show(); //Show first tab content
    }

    , GuardarOrdenDeCompra: function () {

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

                    $("#div_addOrden").dialog("close");

                    if (data.error == 0) {

                        window.location.reload();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar la orden del cliente: ", data.message);
                    }
                 
                }
                , error: function (data) {
                    $("#div_addOrden").dialog("close");
                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }


    }

    , AbrirDialogoCreate: function () {
        
        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/OrdenesDeCompra/Create") ,
                data: {
                    cliente_id: $("#ClienteModelo_id").val()
                },
                success: function (data) {
                    
                    $("#div_OrdenContent").html(data);

                    //Para mostrar el combo segun el Tipo de Orden elegido:
                    $("#div_abonos").hide();
                    $("#div_comodatos").hide();
                    $("#div_articulos").hide();

                    //Para mostrar los input de vigencia segun cant. y fecha
                    $("#div_Cant").hide();
                    $("#div_FechaDesde").hide();
                    $("#div_FechaHasta").hide();
                    
                    $("#div_addOrden").dialog("open");

                    HideLoader();
                                       

                    PrepareView();

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

    , AbrirDialogoEdit: function (orden_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/OrdenesDeCompra/EditFromCliente"),
                data: {
                    orden_id: orden_id
                },
                success: function (data) {

                    $("#div_OrdenContent").html(data);
                    HideLoader();
                    
                    $("#div_addOrden").dialog("open");
                    
                    PrepareView();

                    //Para mostrar el combo segun el Tipo de Orden elegido:
                    $("#div_abonos").hide();
                    $("#div_comodatos").hide();
                    $("#div_articulos").hide();

                    //Para mostrar los input de vigencia segun cant. y fecha
                    $("#div_Cant").hide();
                    $("#div_FechaDesde").hide();
                    $("#div_FechaHasta").hide();

                    Modelo.TipoItemOrden_OnChange();
                    Modelo.VigenciaXCant_OnChange();
                    Modelo.VigenciaXFecha_OnChange();
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

    , RedirectDatosFacturacion: function (id) {
        $("ul.myTab li").removeClass("active"); //Remove any "active" class
        $(this).addClass("active"); //Add "active" class to selected tab
        $(".tab_content").hide(); //Hide all tab content

        var activeTab = $(this).find("a").attr("href"); //Find the href attribute value to
        //identify the active tab + content
        $(activeTab).fadeIn(); //Fade in the active ID content
        //return false;

        window.location.href = "/Clientes/DatosFacturacion/" + id;
    }

    , TipoItemOrden_OnChange: function () {
        if ($("#cmb_TipoItems").val() == 1) {
            $("#div_abonos").show();
            SetChosenSelectControl($("#cmb_abonos"));
            $("#div_comodatos").hide();
            $("#div_articulos").hide();

        }
        else if ($("#cmb_TipoItems").val() == 2) {
            $("#div_comodatos").show();
            SetChosenSelectControl($("#cmb_comodatos"));
            $("#div_abonos").hide();
            $("#div_articulos").hide();
        }
        else {
            $("#div_abonos").hide();
            $("#div_comodatos").hide();
            $("#div_articulos").show();
            SetChosenSelectControl($("#cmb_articulos"));
        }
    }

    , VigenciaXCant_OnChange: function () {
        if ($("#chk_Cant").prop('checked')) {
            $("#div_Cant").show();
            SetChosenSelectControl($("#txt_Cant"));
        }
        else {
            $("#div_Cant").hide();
            //SetChosenSelectControl($("#txt_Cant"));
        }
    }   

    , VigenciaXFecha_OnChange: function() { 
        if ($("#chk_Fecha").prop('checked')) {
            $("#div_FechaDesde").show();
            $("#div_FechaHasta").show();
            SetChosenSelectControl($("#txt_FechaDesde"));
            SetChosenSelectControl($("#txt_FechaHasta"));
        }
        else {
            $("#div_FechaDesde").hide();
            //SetChosenSelectControl($("#txt_FechaDesde"));
            $("#div_FechaHasta").hide();
            //SetChosenSelectControl($("#txt_FechaHasta"));
        }
    }

}


