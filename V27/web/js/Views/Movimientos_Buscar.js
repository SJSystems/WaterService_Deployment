/// <reference path="../General_OnLoad.js" />

var MovimientosModelo = {
      Init: function() {
          this.clienteActual_id = $("#ClienteModelo_id").val();
          
          $("#dialog_DetalleAbono").dialog(
            {
                dialogClass: "no-close",
                autoOpen: false,
                height: 200,
                width: 500,
                modal: true,
                buttons: [
                        {
                            text: "Aceptar",
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog("close");
                            }
                        }
                ]
            }
        );
      }
    , BuscarMovimientos: function() {

        try {

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
                success: function(data) {

                    if (data != null && data != "") {

                        $("#div_resultadoBusquedaMovimientos").html(data);

                        HideLoader();

                        $(".btn_DetallesMovimiento").click(function () {
                            MovimientosModelo.ObtenerDetallesMovimiento(this);
                            return false;
                        });
                        

                        $(".btn_DetallesMovimientoFactura").click(function () {
                            MovimientosModelo.ObtenerDetallesMovimientoFactura(this);
                            return false;
                        });
                        
                    } else {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                    }
                },
                error: function(data) {
                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                }
            });

        } catch(e) {
            HideLoader();
        }
    }
    , ObtenerDetallesMovimiento: function(btn) {

        var movimiento_id = $(btn).attr("movimiento_id");
        var tr_contenido = $("#tr_detalleMovimiento_" + movimiento_id);

        if ($(btn).attr("collapsed") == "true") {
            
            tdContenido = $("#td_contenidoDetalleMovimiento_" + movimiento_id);

            if (tdContenido.attr("datosObtenidos") == "false") {

                //Todo: Buscar los detalles de movimientos - Ajax
                ShowLoader();
                
                $.ajax({
                    cache: false,
                    async: true,
                    type: "POST",
                    url: GetUrlForService("/Movimientos/ObtenerDetallesDeMovimiento"),
                    data: {
                        movimiento_id: movimiento_id
                    },
                    success: function(data) {

                        if (data != null && data != "") {

                            tdContenido.html(data);

                            HideLoader();
                            tdContenido.attr("datosObtenidos", "true");
                            
                            $(btn).find(".btn_icono").removeClass(classCollapsed);
                            $(btn).find(".btn_icono").addClass(classExpanded);
                            $(btn).attr("collapsed", "false");
                            tr_contenido.removeClass("hide");

                        } else {

                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                        }
                    },
                    error: function(data) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                    }
                });


            } else {
                
                $(btn).find(".btn_icono").removeClass(classCollapsed);
                $(btn).find(".btn_icono").addClass(classExpanded);
                $(btn).attr("collapsed", "false");
                tr_contenido.removeClass("hide");
            }


        } else {
            
            $(btn).find(".btn_icono").removeClass(classExpanded);
            $(btn).find(".btn_icono").addClass(classCollapsed);
            $(btn).attr("collapsed", "true");
            tr_contenido.addClass("hide");
        }
    }
    , ObtenerDetallesMovimientoFactura: function (btn) {

        var movimiento_id = $(btn).attr("movimientoFactura_id");
        var tr_contenido = $("#tr_detalleMovimientoFactura_" + movimiento_id);

        if ($(btn).attr("collapsed") == "true") {

            tdContenido = $("#td_contenidoDetalleMovimientoFactura_" + movimiento_id);

            if (tdContenido.attr("datosObtenidos") == "false") {

                //Todo: Buscar los detalles de movimientos - Ajax
                ShowLoader();

                $.ajax({
                    cache: false,
                    async: true,
                    type: "POST",
                    url: GetUrlForService("/Movimientos/ObtenerDetallesDeMovimientoFactura"),
                    data: {
                        movimiento_id: movimiento_id
                    },
                    success: function (data) {

                        if (data != null && data != "") {

                            tdContenido.html(data);

                            HideLoader();
                            tdContenido.attr("datosObtenidos", "true");

                            $(btn).find(".btn_icono").removeClass(classCollapsed);
                            $(btn).find(".btn_icono").addClass(classExpanded);
                            $(btn).attr("collapsed", "false");
                            tr_contenido.removeClass("hide");

                        } else {

                            HideLoader();
                            ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                        }
                    },
                    error: function (data) {
                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                    }
                });


            } else {

                $(btn).find(".btn_icono").removeClass(classCollapsed);
                $(btn).find(".btn_icono").addClass(classExpanded);
                $(btn).attr("collapsed", "false");
                tr_contenido.removeClass("hide");
            }


        } else {

            $(btn).find(".btn_icono").removeClass(classExpanded);
            $(btn).find(".btn_icono").addClass(classCollapsed);
            $(btn).attr("collapsed", "true");
            tr_contenido.addClass("hide");
        }
    }
    , BuscarConsumos: function () {
        
        var form = $('#tabs-articulos');
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
            url: GetUrlForService("/Movimientos/ObtenerArticulosEntregados"),
            data: {
                cliente_id: this.clienteActual_id,
                fechaDesde: $("#txt_ConsumoFechaDesde").val(),
                fechaHasta: $("#txt_ConsumoFechaHasta").val()
            },
            success: function (data) {

                if (data != null && data != "") {

                    $("#div_historialConsumos").html(data);

                    HideLoader();
                    
                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });
        
    }
    , BuscarFacturas: function () {
        
        var form = $('#div_buscarFacuras');
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
            url: GetUrlForService("/Movimientos/ObtenerHistorialDeFacturas"),
            data: {
                cliente_id: this.clienteActual_id,
                fechaDesde: $("#txt_FacturaFechaDesde").val(),
                fechaHasta: $("#txt_FacturaFechaHasta").val()
            },
            success: function (data) {

                if (data != null && data != "") {

                    $("#div_historialFacturas").html(data);

                    HideLoader();

                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });
        
    }
    , ObtenerDatosAfip : function(facturaId) {
        
        ShowLoader();

        $.ajax({
            cache: false,
            async: true,
            type: "GET",
            url: GetUrlForService("/Facturacion/ObtenerComprobanteAfipEmitidoEnAfip") + "&facturaId=" + facturaId,
            success: function (data) {

                HideLoader();

                var textoAfip = "</br>Fecha comrpobante: " + data.FchProceso + ". </br>";
                textoAfip += "Tipo comprobante: " + data.CbteTipo + ". </br>";
                textoAfip += "Vencimiento: " + data.FchVto + ". </br>";
                textoAfip += "CodAutorizacion: " + data.CodAutorizacion + ". </br>";
                textoAfip += "PtoVta: " + data.PtoVta + ". </br>";
                textoAfip += "EmisionTipo: " + data.EmisionTipo + ". </br>";

                textoAfip += "Errores: " + data.Errores + ". </br>";
                textoAfip += "Observaciones: " + data.Observaciones + ".";

                $("#div_InformacionFactura").removeClass("hide");
                $("#span_detallesFactura").html(textoAfip);
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });

      }
    , GenerarFacturaElectronica :function(facturaId) {

        ShowLoader();

        $.ajax({
            cache: false,
            async: true,
            type: "GET",
            url: GetUrlForService("/Facturacion/SolicitarFacturaElectronica") + "&facturaId=" + facturaId,
            success: function (data) {

                HideLoader();
                if (data > 0) {

                    MovimientosModelo.BuscarFacturas();

                } else {

                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al generar la Factura Electrónica");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });
      }
    , BuscarVisitas: function () {
       
        var form = $('#tabs-visitas');
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
            url: GetUrlForService("/Movimientos/ObtenerVisitas"),
            data: {
                cliente_id: this.clienteActual_id,
                fechaDesde: $("#txt_VisitasFechaDesde").val(),
                fechaHasta: $("#txt_VisitasFechaHasta").val()
            },
            success: function (data) {

                if (data != null && data != "") {

                    $("#div_historialVisitas").html(data);

                    HideLoader();

                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });
       
       
    }
    , BuscarDisponibles: function () {
        var form = $('#tabs-articulosdisponibles');
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
            url: GetUrlForService("/Movimientos/ObtenerArticulosDisponibles"),
            data: {
                cliente_id: this.clienteActual_id,
                fechaDesde: $("#txt_DisponiblesFechaDesde").val(),
                fechaHasta: $("#txt_DisponiblesFechaHasta").val()
            },
            success: function (data) {

                if (data != null && data != "") {

                    $("#div_ArticulosDisponibles").html(data);

                    HideLoader();

                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar movimientos");
            }
        });
    }
    , clienteActual_id: 0
    , ObtenerDetalleDeAbonoImputado: function (abono_id) {

    }
    , BuscarNotasDeCredito: function () {

         var form = $('#tabs-notasDeCreditos');
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
             url: GetUrlForService("/Facturacion/BuscarNotasDeCreditoCliente"),
             data: {
                 cliente_id: this.clienteActual_id,
                 fechaDesde: $("#txt_NotasDeCreditoFechaDesde").val(),
                 fechaHasta: $("#txt_NotasDeCreditoFechaHasta").val()
             },
             success: function (data) {

                 if (data != null && data != "") {

                     $("#div_NotasDeCreditos").html(data);

                     HideLoader();

                 } else {

                     HideLoader();
                     ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar devoluciones");
                 }
             },
             error: function (data) {
                 HideLoader();
                 ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar devoluciones");
             }
         });
     }
    , BuscarDevoluciones: function () {

        var form = $('#tabs-devoluciones');
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
            url: GetUrlForService("/Devoluciones/BuscarDevolucionesCliente"),
            data: {
                cliente_id: this.clienteActual_id,
                fechaDesde: $("#txt_DevolucionesFechaDesde").val(),
                fechaHasta: $("#txt_DevolucionesFechaHasta").val()
            },
            success: function (data) {

                if (data != null && data != "") {

                    $("#div_Devoluciones").html(data);

                    HideLoader();

                } else {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar devoluciones");
                }
            },
            error: function (data) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error al buscar devoluciones");
            }
        });

    }
    , GenerarResumenDeCuenta: function() {

        //var url = "/Reportes/Reporte?" +
        //    "fechaDesde=" + $("#txt_FechaDesde").val() +
        //    "&fechaHasta=" + $("#txt_FechaHasta").val() +
        //    "&clienteId=" + this.clienteActual_id;
        //var win = window.open(url, '_blank');
        //win.focus();

        var url = "/Reportes/ReporteConsumosCobros?" +
            "desde=" + $("#txt_FechaDesde").val() +
            "&hasta=" + $("#txt_FechaHasta").val() +
            "&clienteId=" + this.clienteActual_id;
        var win = window.open(url, '_blank');
        win.focus();
      }
};

var classCollapsed = "fa-chevron-up";
var classExpanded = "fa-chevron-down";
var tdContenido;