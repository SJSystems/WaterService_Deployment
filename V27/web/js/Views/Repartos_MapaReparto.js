/// <reference path="../General_OnLoad.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />

var Modelo = {
    Init: function() {

        //Maps
        geocoder = new google.maps.Geocoder();

        //Creo una localizacion en la Plaza San Martin
        var centro = new google.maps.LatLng(-31.4166082, -64.1866651);

        //Opciones del mapa
        var mapOptions = {
            zoom: 12,
            center: centro
        };
        //Creación del mapa
        map = new google.maps.Map(document.getElementById('div_map'), mapOptions);

        var clientes = $(".clienteReparto");

        for (var i = 0; i < clientes.length; i++) {

            var cliente = $(clientes[i]);

            if (cliente.attr("coorLatitud") == null || cliente.attr("coorLatitud") == "" || cliente.attr("coorLongitud") == null || cliente.attr("coorLongitud") == "") {
                continue;
            }

            var latlng = new google.maps.LatLng(cliente.attr("coorLatitud"), cliente.attr("coorLongitud"));

            //Creo un marker localizado con el punto anterior
            var markerCliente = new google.maps.Marker({
                draggable: false,
                map: map,
                animation: google.maps.Animation.DROP,
                position: latlng,
                title: "[" + cliente.attr("ordenCliente") + "] - (" + cliente.attr("cliente_id") + ")",
                icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + cliente.attr("ordenCliente") + "|" + cliente.attr("markerColor") + "|000000"
            });

            markersClientes.push(markerCliente);

            $("#ckb_seleccion_" + cliente.attr("cliente_id")).attr("indexArray", markersClientes.length - 1);
        }

        $('#ckb_seleccionarClientes').prop('checked', true);
        $('.ckb_seleccion').prop('checked', true);

        $("#ckb_seleccionarClientes").change(function(event) {
            Modelo.On_ckb_seleccionarClientes_Change(event);
        });

        $(".ckb_seleccion").change(function(event) {
            Modelo.On_ckb_seleccion_Change(event);
        });
        
        MinimizarMenu();

        $(".abrirCerrar").click();
    },
    On_ckb_seleccionarClientes_Change: function(event) {

        if ($('#ckb_seleccionarClientes').prop('checked')) {
            $('.ckb_seleccion').prop('checked', true);

            for (var i = 0; i < markersClientes.length; i++) {
                this.MostrarCliente(i);
            }

        } else {
            $('.ckb_seleccion').prop('checked', false);
            for (var i = 0; i < markersClientes.length; i++) {
                this.OcultarCliente(i);
            }
        }


    },
    On_ckb_seleccion_Change: function(event) {

        var indexarray = $(event.currentTarget).attr("indexarray");

        if ($(event.currentTarget).prop('checked')) {

            this.MostrarCliente(indexarray);
        } else {

            this.OcultarCliente(indexarray);
        }
    },
    OcultarCliente: function(indexarray) {

        var marker = markersClientes[indexarray];

        marker.setMap(null);
    },
    MostrarCliente: function(indexarray) {

        var marker = markersClientes[indexarray];
        marker.setMap(map);
    },
    ObtenerComparacion: function () {

        var dia_origen = $("#DiaId").val();
        var reprato_origen = $("#RepartoModelo_id").val();
        
        var dia_destino = $("#cmb_dias_comparacion").val();
        var reprato_destino = $("#cmb_repartosComparacion").val();

        window.location.href = "/Repartos/MapaReparto?reparto_id=" + reprato_origen + "&dia_id=" + dia_origen + "&destino_reparto_id=" + reprato_destino + "&destino_dia_id=" + dia_destino;
    }
};

var geocoder;
var map;
var markersClientes=[];