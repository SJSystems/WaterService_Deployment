/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#div_main").accordion({
            collapsible: true
        });

        $("#dialog_sucursales").dialog(
                {
                    autoOpen: false,
                    height: 550,
                    width: 850,
                    modal: true
                }
            );

        //Maps
        geocoder = new google.maps.Geocoder();

        //Creo una localizacion el domicilio del cliente
        var latlng = new google.maps.LatLng($("#ClienteModel_altitud").val(), $("#ClienteModel_longitud").val());

        //Opciones del mapa
        var mapOptions = {
            zoom: 17,
            center: latlng
        }
        //Creación del mapa
        map = new google.maps.Map(document.getElementById('div_map'), mapOptions);

        //Creo un marker localizado con el punto anterior
        markerDomicilioActual = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: latlng
        });

    }
    
    , VerSucursales: function () {

        try {

            ShowLoader();
            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/ObtenerSucursales"),
                data: {
                    cliente_id: $("#ClienteModel_cliente_id").val()
                },
                success: function (data) {

                    $("#dialog_sucursales").html(data);
                    HideLoader();

                    $("#dialog_sucursales").dialog("open");
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