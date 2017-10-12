/// <reference path="~/js/General_OnLoad.js" />
/// <reference path="~/assets/js/angular.js" />
/// <reference path="~/Web.js" />
/// <reference path="https://maps.googleapis.com/maps/api/js?v=3.exp" />


var obtenerItemDeMarker = function(items, marker, comparar) {
    
    for (var i = 0; i < items.length; i++) {

        var item = items[i];

        if (comparar(marker, item))
            return item;
    }

    return null;
}

var utilesMap = {

    iniciarMapa: function(idDiv) {
        
        //Creo una localizacion en la Plaza San Martin
        var centro = new google.maps.LatLng(DEFAULT_MAPS_CENTRAR_LATITUD, DEFAULT_MAPS_CENTRAR_LONGITUD);

        //Opciones del mapa
        var mapOptions = {
            zoom: DEFAULT_MAPS_ZOOM,
            center: centro
        };

        //Creación del mapa
        var map = new google.maps.Map(document.getElementById(idDiv), mapOptions);

        setTimeout(function() {
            utiles.ajustarMapa();
        }, 500);

        return map;
    },

    actualizarPosiciones: function(mapa, markersActuales, items, comparar) {

        if (markersActuales != null) {
            for (var j = 0; j < markersActuales.length; j++) {
                var markerActual = markersActuales[j];

                var itemDeMarker = obtenerItemDeMarker(items, markerActual, comparar);

                if (itemDeMarker != null) {
                    markerActual.setPosition(new google.maps.LatLng(itemDeMarker.lat, itemDeMarker.lng));
                    markerActual.setIcon(itemDeMarker.icon);    
                    itemDeMarker.marker = markerActual;
                } else {
                    markerActual.setMap(null);
                }
            }
        } else {
            markersActuales = [];
        }

        if (items != null) {
            for (var i = 0; i < items.length; i++) {

                var item = items[i];

                if (item.marker != null)
                    continue;

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(item.lat, item.lng),
                    title: item.title,
                    map: mapa,
                    icon: item.icon,
                    draggable: false,
                    animation: google.maps.Animation.DROP
                });

                marker.metadata = item.metadata;
                
                markersActuales.push(marker);
            }
        }

        return markersActuales;
    },

    trazarCamino : function(mapaActual, items, agregarPuntos, functionSetTitle, functionSetIcon) {

        var path = [];
        var markers = [];

        for (var i = 0; i < items.length; i++) {

            var item = items[i];
            var punto = new google.maps.LatLng(item.lat, item.lng);

            path.push(punto);

            if (agregarPuntos) {

                var mkr = new google.maps.Marker({
                    draggable: false,
                    map: mapaActual,
                    animation: google.maps.Animation.DROP,
                    position: punto,
                    title: functionSetTitle(item,i),
                    icon: functionSetIcon(item,i)
            });

                markers.push(mkr);
            }
        }

        var line = new google.maps.Polyline({
            path: path,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 1,
            geodesic: true,
            map: mapaActual
        });

        return { line: line , markers: markers};
    },

    obtenerPuntoPorDefecto:function() {
        
        //Creo una localizacion en la Plaza San Martin
        var latlng = new google.maps.LatLng(DEFAULT_MAPS_CENTRAR_LATITUD, DEFAULT_MAPS_CENTRAR_LONGITUD);
        
        return latlng;
    },

    obtenerMarkerPorDefecto:function(mapa, movible) {

        var latlng = this.obtenerPuntoPorDefecto();

        var mkr = new google.maps.Marker({
            draggable: movible,
            map: mapa,
            animation: google.maps.Animation.DROP,
            position: latlng
        });

        return mkr;
    },
};