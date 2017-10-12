/// <reference path="../General_OnLoad.js" />

var Modelo = {

    Init: function () {

        $("#btn_domicilio").click(
                function () { Modelo.GuardarDomicilio(); }
            );

        $("#DomicilioModelo_barrio_id").change(
            function (data) { Modelo.CargarCalles(); }
            );

        setTimeout(function() {

            //Maps
            geocoder = new google.maps.Geocoder();

            //Creo una localizacion en la Plaza San Martin
            var latlng = new google.maps.LatLng(DEFAULT_MAPS_CENTRAR_LATITUD, DEFAULT_MAPS_CENTRAR_LONGITUD);

            //Opciones del mapa
            var mapOptions = {
                zoom: DEFAULT_MAPS_ZOOM,
                center: latlng
            }
            //Creación del mapa
            map = new google.maps.Map(document.getElementById('div_map'), mapOptions);

            //Creo un marker localizado con el punto anterior
            markerDomicilioActual = new google.maps.Marker({
                draggable: true,
                map: map,
                animation: google.maps.Animation.DROP,
                position: latlng
            });

            //Si es una direccion previamente cargada
            if ($("#ClienteModelo_domicilio_id").val() != "") {

                //Si tiene longitud y latitud cargado
                if ($("#DomicilioModelo_altitud").val() != "" && $("#DomicilioModelo_longitud").val() != "") {

                    Modelo.ObtenerDireccionEnMapaPorCoordenadas();
                }
                else {
                    //Si no tiene latitud y longitud entonces busca el mapa por dirección
                    Modelo.ObtenerDireccionEnMapaPorDireccion();
                }
            }

        }, 500);

    }
    
    ,GuardarDomicilio: function () {
        try {
            var form = $('#form_edit');

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
                        window.location.reload();
                    }
                    else {
                        ShowMessageBox(messageType_Error, "Error al guardar el domicilio: ", data.message)
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

    ,CargarCalles: function(){

        try {

            ShowLoader();

            var barrio_id = $("#DomicilioModelo_barrio_id").val();

            $.ajax({
                cache: false,
                async: true,
                type: "GET",
                url: GetUrlForService("/Clientes/ObtenerCalles"),
                data: {
                    barrioAnterior: this.BarrioSeleccionado,
                    nuevoBarrio: barrio_id
                },
                success: function (data) {

                    if (data != "") {
                        $("#DomicilioModelo_calle_id").html(data);
                        $("#DomicilioModelo_calle_id").trigger("chosen:updated"); //Actualiza el <SELECT>
                    }
                    HideLoader();
                }
                , error: function (data) {
                    HideLoader();
                }
            });

            this.BarrioSeleccionado = barrio_id;
        } catch (e) {
            HideLoader();
        }
    }

    ,BarrioSeleccionado:"0"

    , ObtenerDireccionEnMapaPorDireccion: function () {

        var ciudad = $("#DomicilioModelo_barrio_id option:selected").text();
        var calle = $("#DomicilioModelo_calle_id option:selected").text(); 
        var numero = $("#DomicilioModelo_numeroPuerta").val();

        ciudad = ciudad.split(';')[1];

        if (calle.indexOf("calle") < 0) {
            calle = "calle " + calle;
        }

        var address = calle + " " + numero + ", " + ciudad+ ", Argentina";

            geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                map.setCenter(results[0].geometry.location);

                $("#DomicilioModelo_altitud").val(results[0].geometry.location.lat());
                $("#DomicilioModelo_longitud").val(results[0].geometry.location.lng());

                var myLatlng = new google.maps.LatLng($("#DomicilioModelo_altitud").val(), $("#DomicilioModelo_longitud").val());

                markerDomicilioActual.setPosition(myLatlng);
                map.setZoom(17);

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    , ObtenerDireccionEnMapaPorCoordenadas: function () {

        var lat = $("#DomicilioModelo_altitud").val().replace(",", ".") * 1;
        var lgn = $("#DomicilioModelo_longitud").val().replace(",", ".") * 1;
        var myLatlng = new google.maps.LatLng(lat, lgn);

        markerDomicilioActual.setPosition(myLatlng);

        map.setCenter(myLatlng);

        map.setZoom(17);
    }

    , ObtenerCoordenadasDelMarker: function () {

        $("#DomicilioModelo_altitud").val(markerDomicilioActual.position.lat());
        $("#DomicilioModelo_longitud").val(markerDomicilioActual.position.lng());
    }
}

var geocoder;
var map;
var markerDomicilioActual;