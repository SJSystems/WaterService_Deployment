﻿/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_submit").click(
          function () { Modelo.Buscar(); return false; }
      );
    },
    Buscar: function () {

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
                        $('#tb_resultado').dataTable();
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
    },

    Eliminar: function (dispenser_id) {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "POST",
                url: GetUrlForService("/Dispensers/Eliminar"),
                data: { dispenser_id: dispenser_id },
                success: function (data) {

                    if (data.error == "0") {

                        HideLoader();
                        ShowMessageBox(messageType_Success, "Se eliminó con éxito: ", data.message);
                        Modelo.Buscar();
                    }
                    else {

                        HideLoader();
                        ShowMessageBox(messageType_Error, "Error al eliminar el dispenser: ", data.message);
                    }
                }
                , error: function (data) {
                    HideLoader();
                }
            });

        } catch (e) {
            HideLoader();
        }
    },

    VerMantenimientos: function(dispenser_id) {
      
        angular.element(document.getElementById('div_buscarDispensers')).scope().verMantenimientos(dispenser_id);
    },
};
