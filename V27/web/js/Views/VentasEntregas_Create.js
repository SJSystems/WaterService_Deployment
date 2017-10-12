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

        $(".ocultarSinCliente").hide();
    },
    AbrirDialogo_SeleccionarCliente: function() {

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
                success: function(data) {

                    $("#div_BuscarClienteDialogo").html(data);
                    HideLoader();
                    $("#div_BuscarClienteDialogo").dialog("open");

                    RePrepareView($("#div_BuscarClienteDialogo"));

                    $("#btn_submit").click(
                        function() {
                            ModeloBuscarClientes.BuscarClientes();
                            return false;
                        }
                    );

                    Modelo.PantallaBusquedaClienteCargada = true;
                },
                error: function(data) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                }
            });
        } catch(e) {
            HideLoader();
        }
    },
    SeleccionarCliente: function(cliente_id) {

        try {

            ng_Model.cliente_id = cliente_id;

            //Trae los datos del cliente seleccionado
            $("#div_BuscarClienteDialogo").dialog("close");
            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/VentasEntregas/ObtenerSeccionCliente"),
                data: {
                    cliente_id: cliente_id
                },
                success: function(data) {

                    if (data != null && data != "") {

                        $("#div_SeccionCliente").html(data);
                        RePrepareView($("#div_SeccionCliente"));

                        $("#txt_clienteSeleccionado").val($("#ClienteActual_nombreCliente").val());
                        $("#txt_clienteId").val($("#ClienteActual_cliente_id").val());
                        
                        $(".tr_articuloTemplate").addClass("hide");
                        HideLoader();
                        $(".ocultarSinCliente").show();
                        Set_Eventos_Change();

                        $(".collapseButton").click();
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

    },
    AgregarNuevoArticulo: function() {

        var nuevoTr = $(".tr_articuloTemplate").clone();
        var nuevoIndice = $(".tr_articulo").length;
        nuevoTr.removeClass("hide");
        nuevoTr.removeClass("tr_articuloTemplate");
        nuevoTr.addClass("tr_articulo");

        //nuevoTr.html(nuevoTr.html().split("{0}").join(nuevoIndice));

        $(nuevoTr.find(".cantidadArticulo")).ace_spinner(
            {
                value: 0,
                min: 0,
                max: 10000,
                step: 1,
                on_sides: true,
                icon_up: 'ace-icon fa fa-plus smaller-75',
                icon_down: 'ace-icon fa fa-minus smaller-75',
                btn_up_class: 'btn-success',
                btn_down_class: 'btn-danger'
            });

        tbody_articulos.appendChild(nuevoTr[0]);

        SetChosenSelectControl(nuevoTr.find(".ListaDeArticulo"));

        Set_Eventos_Change();
    },
    EliminarArticulo: function(event) {

        var btn = $(event);
        btn.parent().parent().remove();
        this.ActualizarTotal();
    },
    ActualizarPrecioArticulo: function(tr_actual) {

        var cmbArticulos = tr_actual.find(".cmb_articulosLista");
        var itemArticulo = cmbArticulos.find("option:selected");

        if (itemArticulo.length == 0) {
            itemArticulo = tr_actual.find(".datosArticulo");
        }

        var precioArticulo = itemArticulo.attr("precioMaximo");

        tr_actual.find(".precioArticulo").text(precioArticulo);

        this.ActualizarSubtotal(tr_actual);
    },
    ActualizarSubtotal: function(tr_actual) {

        var cmbArticulos = tr_actual.find(".cmb_articulosLista");
        itemArticulo = cmbArticulos.find("option:selected");

        var cantidadSinCosto = 0;
        
        //Si no existe el control
        if (itemArticulo.length == 0) {
            itemArticulo = tr_actual.find(".datosArticulo");
            cantidadSinCosto = itemArticulo.attr("cantidadsincosto") * 1;
        }
        
        var precioArticulo = itemArticulo.attr("precioMaximo").replace(',', '.');
        var cantidad = tr_actual.find(".txt_cantidadArticulo").val().replace(',', '.') * 1;
        cantidad = (cantidad - cantidadSinCosto) < 0 ? 0 : (cantidad - cantidadSinCosto);
        var subTotal = precioArticulo * cantidad;

        tr_actual.find(".subTotalArticulo").text(subTotal);

        this.ActualizarTotal();

    },
    ActualizarTotal: function() {

        var items = $(".subTotalArticulo");

        this.TotalVendido = 0;

        for (var i = 0; i < items.length; i++) {

            this.TotalVendido = this.TotalVendido + ($(items[i]).text() * 1);
        }

        $("#txt_TotalVenta").text(this.TotalVendido);

        $("#lbl_VentaActual").text(this.TotalVendido);

        this.SaldoAnteriorCuenta = $("#lbl_SaldoAnterior").text().replace(',', '.') * 1;
        this.TotalTotal = this.SaldoAnteriorCuenta + this.TotalVendido;

        this.PagarContado();

        $("#lbl_TotalResumen").text(this.TotalTotal);
        
        this.CobroCuenta = $("#txt_CobroCuenta").val().replace(',', '.') * 1;

        this.SaldoFinal = this.TotalTotal - this.CobroCuenta;
        
        $("#lbl_SaldoFinal").text(this.SaldoFinal);
        

    }
    , ConfirmarTransaccion: function() {

        try {

            $("#btn_confirmarTransaccionVenta").attr("disabled", true);

            ShowLoader();

            var datosConfirmacion = {};
            datosConfirmacion.Reparto_id = $("#reparto_id").val() * 1;
            datosConfirmacion.Cliente_id = $("#txt_clienteId").val() * 1;
            datosConfirmacion.NroRemito = $("#txt_NumbRemito").val();
            datosConfirmacion.NroRecibo = $("#txt_NumRecibo").val();
            datosConfirmacion.FechaVentaEntrega = $("#FechaVenta").val();
            datosConfirmacion.MontoCobradoCuenta = $("#txt_CobroCuenta").val() * 1;

            var Articulos_Vendidos = new Array();

            var itemsPredeterminados = $(".articuloVendido");
            var itemsArticulosLista = $(".cmb_articuloVendido");

            for (var i = 0; i < itemsPredeterminados.length; i++) {

                var itemVendido = {};
                itemVendido.Cantidad = $(itemsPredeterminados[i]).parent().parent().find(".txt_cantidadArticulo").val().trim() * 1;

                if (itemVendido.Cantidad != 0) {
                
                    itemVendido.Articulo_id = $(itemsPredeterminados[i]).attr("articulo_id")*1;
                    itemVendido.OrigenArticulo_id = $(itemsPredeterminados[i]).attr("tipoArticulo_id") * 1;

                    Articulos_Vendidos.push(itemVendido);
                }
            }
        
            for (var j = 0; j < itemsArticulosLista.length; j++) {

                var itemVendido = {};
                itemVendido.Cantidad = $(itemsArticulosLista[j]).parent().parent().find(".txt_cantidadArticulo").val().trim() * 1;
                itemVendido.Articulo_id = $(itemsArticulosLista[j]).find("option:selected").attr("articulo_id") * 1;
            
                if(itemVendido.Cantidad !=0) {
                    itemVendido.OrigenArticulo_id = 1;
                    Articulos_Vendidos.push(itemVendido);
                }
            }
            
            //Cobros de facturas
            var facturasCobradas = new Array();
            var ckb = $(".ckb_CobroFactura");
            for (var i = 0; i < ckb.length; i++) {

                var item = $(ckb[i]);

                if (item.is(':checked')) {

                    var factura_id = item.attr("factura_id");

                    try {
                        var montoCobrado = $('[factura_id=' + factura_id + '].txt_CobroFacturaMonto').val().replace(',', '.') * 1;

                        facturasCobradas.push({
                            Factura_id: factura_id,
                            MontoCobrado: montoCobrado
                        });
                    } catch(e) {
                    }
                }
            }

            //Prestamos y devoluciones de envases (desde ventasEntregasController.js)
            var prestDevol = [];
            $.each(ng_Model.prestamosDevoluciones, function (index, item) {
                
                prestDevol.push(
                    {
                        articulo_id: item.articulo.id,
                        cantidad: item.cantidad,
                        comentarios: item.comentarios,
                        eventoId: item.evento.valor,
                    }
                );
                
            });

            datosConfirmacion.ArticulosVendidos = Articulos_Vendidos;
            datosConfirmacion.CobrosFactuas = facturasCobradas;
            datosConfirmacion.prestamosDevoluciones = prestDevol;
        
        $.ajax({
            type: "POST",
           // traditional: true, 
            url: GetUrlForService("/VentasEntregas/ConfirmarVentaEntrega"),
            contentType: 'application/json',
            data: JSON.stringify({
                conf: {
                    Cliente_id: datosConfirmacion.Cliente_id,
                    Reparto_id: datosConfirmacion.Reparto_id,
                    FechaVentaEntrega: datosConfirmacion.FechaVentaEntrega,
                    NroRemito: datosConfirmacion.NroRemito,
                    NroRecibo: datosConfirmacion.NroRecibo,
                    MontoCobradoCuenta: datosConfirmacion.MontoCobradoCuenta,
                    ArticulosVendidos: Articulos_Vendidos,
                    CobrosFactuas: datosConfirmacion.CobrosFactuas,
                    esVentaExtra: ng_Model.esVentaExtra,
                    esHojaDeRuta: ng_Model.esHojaDeRuta,
                    hojaDeRutaId: ng_Model.hojaDeRuta_id,
                    prestamosDevoluciones: datosConfirmacion.prestamosDevoluciones,
                }
            }),
            success: function(data) {
                
                if (data.error == 0) {
                    
                    HideLoader();
                    ShowMessageBox(messageType_Success, "Operación exitosa: ", data.message);
                    
                    if (ng_Model.esHojaDeRuta) {

                        if (ng_Model.esUltimoCliente()) {

                            window.location.href = "/VentasEntregas";
                            
                        } else {
                            ng_Model.clienteSiguiente();
                        }

                    } else {
                        
                        window.location.href = "/VentasEntregas/Create"; 
                    }
                }
                else {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error al guardar la Venta: ", data.message);
                    $("#btn_confirmarTransaccionVenta").attr("disabled", false);
                }
            },
            error: function(returndata) {
              
                ShowMessageBox(messageType_Error, "Error no controlado: ", data.message);
                $("#btn_confirmarTransaccionVenta").attr("disabled", false);
            }
        });

        } catch (e) {
            HideLoader();
        }


    }
    , PagarContado: function () {

        if ($("#ckb_pagoContado").is(':checked')) {

            $("#txt_CobroCuenta").val(this.TotalTotal);
            $("#txt_CobroCuenta").attr("readonly","true");
        } else {

            $("#txt_CobroCuenta").removeAttr("readonly");
        }
       
    }
    , ActualizarTotalCobroFacturas: function () {

        this.TotalCobroFacturas = 0;

        var ckb = $(".ckb_CobroFactura");

        for (var i = 0; i < ckb.length; i++) {
            
            var item = $(ckb[i]);

            if (item.is(':checked')) {

                var factura_id = item.attr("factura_id");

                try {
                    this.TotalCobroFacturas += $('[factura_id='+factura_id+'].txt_CobroFacturaMonto').val().replace(',','.')*1;
                }
                catch(e){}
            }

        }

        $("#lbl_TotalCobroFacturas").text(this.TotalCobroFacturas);
    }
    , PantallaBusquedaClienteCargada: false
    , SaldoAnteriorCuenta: 0
    , TotalVendido: 0
    , TotalTotal: 0
    , CobroCuenta: 0
    , SaldoFinal: 0
    , TotalCobroFacturas: 0
    , prestamosDevoluciones: []
    
};

function SeleccionarCliente(cliente_id) {

    Modelo.SeleccionarCliente(cliente_id);
}

function Set_Eventos_Change() {
    
    $(".cmb_articulosLista").change(
    function(data) {
        Modelo.ActualizarPrecioArticulo($(data.target).closest("tr"));
    }
    );
    
    $(".txt_cantidadArticulo").change(
   function(data) {
       Modelo.ActualizarSubtotal($(data.target).closest("tr"));
   }
   );
    
    $("#txt_CobroCuenta").keyup(
       function (data) {
           Modelo.ActualizarTotal();
       }
   );

    $("#ckb_pagoContado").click(
        function () {
            Modelo.ActualizarTotal();
        }
    );


    //Sección facturas
    $(".txt_CobroFacturaMonto").keyup(
   function (data) {
       Modelo.ActualizarTotalCobroFacturas();
        }
    );
    
    $(".ckb_CobroFactura").click(
    function () {
        Modelo.ActualizarTotalCobroFacturas();
    }
);
}