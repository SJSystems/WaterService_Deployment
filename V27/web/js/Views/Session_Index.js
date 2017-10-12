$(document).ready(function () {
    //Page Load

    Modelo.Init();
    
});

var Modelo = {
    Init: function() {


    },

    Inigresar: function() {

        var form = $('#form_login');

        $.ajax({
            cache: false,
            async: true,
            type: "POST",
            url: form.attr('action'),
            data: form.serialize(),
            success: function(data) {

                var url = getParameterByName("url");

                var urlToRedirect = GetCurrentURLRoot();

                if (url != "/" && url!="") {

                    var urlIndex = window.location.href.indexOf("?url=");
                    urlToRedirect = window.location.href.substring(urlIndex + 5);
                }

                if (data.error == 0) {
                    window.location.href = urlToRedirect;
                } else {
                    ShowMessageBox(messageType_Error, "Error en el ingreso: ", data.message);
                }
            }
        });
    }
};

