/// <reference path="../General_OnLoad.js" />

var Modelo = {
    Init: function() {

        $("#div_AltaAbono").dialog(
            {
                autoOpen: false,
                height: 400,
                width: 500,
                modal: true
            }
        );

        $("#div_AltaArticulo").dialog(
            {
                autoOpen: false,
                height: 400,
                width: 800,
                modal: true
            }
        );
    },
    AbrirDialogo_NuevoAbono: function(cliente_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/AbonosCliente/Create/" + cliente_id),
                success: function(data) {

                    $("#div_AltaAbono").html(data);

                    HideLoader();

                    $("#div_AltaAbono").dialog("open");

                    RePrepareView($("#div_AltaAbono"));

                    //SetFieldDecimalFormat();
                    //SetChosenSelect();

                    ////datepicker plugin
                    ////link
                    //$('.date-picker').datepicker({
                    //    autoclose: true,
                    //    todayHighlight: true,
                    //    format: "dd/mm/yyyy"
                    //})
                    ////show datepicker when clicking on the icon
                    //.next().on(ace.click_event, function () {
                    //    $(this).prev().focus();
                    //});

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
    AbrirDialogo_AgregarArticulo: function(abono_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/AbonosCliente/AgregarArticulo/" + abono_id),
                success: function(data) {

                    $("#div_AltaArticulo").html(data);

                    HideLoader();

                    $("#div_AltaArticulo").dialog("open");

                    SetFieldDecimalFormat();
                    SetChosenSelectControl($("#ArticuloModelo_articulo_id"));

                    //datepicker plugin
                    //link
                    $('.date-picker').datepicker({
                        autoclose: true,
                        todayHighlight: true,
                        format: "dd/mm/yyyy"
                    })
                        //show datepicker when clicking on the icon
                        .next().on(ace.click_event, function() {
                            $(this).prev().focus();
                        });

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
    GuardarAbono: function() {

        try {

            ResetStaticMessage("#form_createAbono");
            $("#btn_guardarAbono").attr("disabled", true);

            var form = $('#form_createAbono');

            var validation = ValidateForm(form);
            if (!validation.validated) {

                ShowStaticMessage_Error(validation.mensaje, "#form_createAbono");
                $("#btn_guardarAbono").attr("disabled", false);

                return false;
            }
            // 
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: form.attr('action'),
                data: form.serialize(),
                success: function(data) {

                    if (data.error == 0) {

                        ShowStaticMessage_Success(data.message, "#form_createAbono");
                        window.location.reload();
                    } else {
                        ShowStaticMessage_Error(data.message, "#form_createAbono");
                        $("#btn_guardarAbono").attr("disabled", false);
                    }
                },
                error: function(data) {

                    ShowStaticMessage_Error("Se ha producido un error", "#form_createAbono");
                    $("#btn_guardarAbono").attr("disabled", false);
                }
            });

        } catch(e) {
            HideLoader();
        }

    },
    GuardarArticuloAbono: function() {

        try {

            ResetStaticMessage("#form_ArticuloAbono");
            $("#btn_guardarArticuloAbono").attr("disabled", true);

            var form = $('#form_ArticuloAbono');

            var validation = ValidateForm(form);
            if (!validation.validated) {

                ShowStaticMessage_Error(validation.mensaje, "#form_ArticuloAbono");
                $("#btn_guardarArticuloAbono").attr("disabled", false);

                return false;
            }
            // 
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: form.attr('action'),
                data: form.serialize(),
                success: function(data) {

                    if (data.error == 0) {

                        ShowStaticMessage_Success(data.message, "#form_ArticuloAbono");
                        window.location.reload();
                    } else {
                        ShowStaticMessage_Error(data.message, "#form_ArticuloAbono");
                        $("#btn_guardarArticuloAbono").attr("disabled", false);
                    }
                },
                error: function(data) {

                    ShowStaticMessage_Error("Se ha producido un error", "#form_ArticuloAbono");
                    $("#btn_guardarArticuloAbono").attr("disabled", false);
                }
            });

        } catch(e) {
            HideLoader();
        }
    },
    AbrirDialogo_EditAbono: function(abono_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/AbonosCliente/Edit/" + abono_id),
                success: function(data) {

                    $("#div_AltaAbono").html(data);

                    HideLoader();

                    $("#div_AltaAbono").dialog("open");

                    RePrepareView($("#div_AltaAbono"));

                    //SetFieldDecimalFormat();
                    //SetChosenSelect();

                    //datepicker plugin
                    //link
                    //$('.date-picker').datepicker({
                    //    autoclose: true,
                    //    todayHighlight: true,
                    //    format: "dd/mm/yyyy"
                    //})
                    ////show datepicker when clicking on the icon
                    //.next().on(ace.click_event, function () {
                    //    $(this).prev().focus();
                    //});

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
    PreguntaEliminarAbono: function(abono_id) {

        abonoEliminar_id = abono_id;

        bootbox.confirm("Está seguro que desea eliminar el abono (" + abono_id + ")", function(result) {
            if (result) {

                Modelo.EliminarAbono(abonoEliminar_id);
            }
        });
    },
    EliminarAbono: function(abono_id) {

        try {

            ShowLoader();
            // 
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/AbonosCliente/EliminarAbono"),
                data: {
                    abono_id: abono_id
                },
                success: function(data) {

                    HideLoader();

                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", data.message);
                        window.location.reload();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }
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
    PreguntaEliminarArticuloAbono: function(articuloAbono_id) {

        articuloEliminar_id = articuloAbono_id;

        bootbox.confirm("Está seguro que desea eliminar el artículo (" + articuloAbono_id + ")", function(result) {
            if (result) {

                Modelo.EliminarArticuloAbono(articuloEliminar_id);
            }
        });
    },
    EliminarArticuloAbono: function(articuloAbono_id) {

        try {

            ShowLoader();
            // 
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/AbonosCliente/EliminarArticuloDeAbono"),
                data: {
                    articuloAbono_id: articuloAbono_id
                },
                success: function(data) {

                    HideLoader();

                    if (data.error == 0) {

                        ShowMessageBox(messageType_Success, "Exitoso", data.message);
                        window.location.reload();
                    } else {
                        ShowMessageBox(messageType_Error, "Error", data.message);
                    }
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
    AbrirDialogo_EditArticulo: function(articuloAbono_id) {

        try {

            ShowLoader();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/AbonosCliente/ModificarArticuloAbono/" + articuloAbono_id),
                success: function(data) {

                    $("#div_AltaArticulo").html(data);

                    HideLoader();

                    $("#div_AltaArticulo").dialog("open");

                    SetFieldDecimalFormat();
                    SetChosenSelectControl($("#ArticuloModelo_articulo_id"));

                    //SetChosenSelect();

                    //datepicker plugin
                    //link
                    $('.date-picker').datepicker({
                        autoclose: true,
                        todayHighlight: true,
                        format: "dd/mm/yyyy"
                    })
                        //show datepicker when clicking on the icon
                        .next().on(ace.click_event, function() {
                            $(this).prev().focus();
                        });

                },
                error: function(data) {

                    HideLoader();
                    ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
                }
            });

        } catch(e) {
            HideLoader();
        }
    }
};

var abonoEliminar_id;
var articuloEliminar_id;