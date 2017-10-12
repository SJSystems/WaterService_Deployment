
var GLOBAL_CONFIG = {
  
    finishLoading:true,
    
};

var GLOBAL_FUNCTIONS = {
    showLoadingScreen: ShowLoadingScreen,
    hideLoadingScreen: HideLoadingScreen,
    runTimer:RunTimer,
};

jQuery(function ($) {
       
    try {

        PrepareView();
        Modelo.Init();  //En cada vistar particular se debe declarar la Variable Modelo y su método Init()

    } catch (e) {
        
    }

    if (GLOBAL_CONFIG.finishLoading) {
        GLOBAL_FUNCTIONS.hideLoadingScreen();
    }


    $(window)
    .off('resize.chosen')
    .on('resize.chosen', function () {
        $('.chosen-select').each(function() {
            var $this = $(this);
            $this.next().css({ 'width': $this.parent().width() });
        });
    }).trigger('resize.chosen');
    
});

function RePrepareView(jqSelector) {
    
    //datepicker plugin
    //link
    jqSelector.find('.date-picker').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "dd/mm/yyyy"
    })
    //show datepicker when clicking on the icon
    .next().on(ace.click_event, function () {
        $(this).prev().focus();
    });

    $('.input-daterange').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "dd/mm/yyyy"
    });

    var campos = jqSelector.find('.date-picker');
    for (var i = 0; i < campos.length; i++) {
        //Elimina las fechas y horas.
        var espacio = $(campos[i]).val().toString().indexOf(" ");
        if (espacio >= 0) {
            $(campos[i]).val($(campos[i]).val().toString().substring(0, espacio));
        }
    }

    jqSelector.find('.dynamicDataTable').dataTable();

    var accordion_contents =jqSelector.find(".div_accordion").accordion();
    accordion_contents.attr("style", accordion_contents.attr("style") + " height:100%;")

    jqSelector.find(".mensajeValidacion").hide();

    jqSelector.find(".decimalFormat").keydown(function (event) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 190, 188]) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.keyCode != 110 && (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105))) {
                event.preventDefault();
            }
        }
    });

    SetChosenSelect();


    RunTimer(function () {

        $(".datepicker").addClass("ui-datepicker-bring-top-fix");

    }, 200);


    try {

        setTooltip();
        setNumericControl();

    } catch (e) { }

}

function setTooltip() {
    
    $(".hasTooltip").tooltip({
        show: null,
        position: {
            my: "left bottom",
            at: "left top"
        },
        open: function (event, ui) {
            ui.tooltip.animate({ top: ui.tooltip.position().top + 10 }, "fast");
        }
    });
    
}

function PrepareView() {
    
    //$(".messageBox").hide();
    //$(".mensajeValidacion").hide();

    RunTimer(function() {
        
        $("#div_loader").dialog
         (
             {
                 dialogClass: "no-close",
                 autoOpen: false,
                 height: 200,
                 width: 500,
                 modal: true
             }
         );

        $("#div_messagesBox").dialog
           (
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


        $("#div_archivosAdjuntos").dialog
          (
              {
                  //dialogClass: "no-close",
                  autoOpen: false,
                  height: 600,
                  width: 1000,
                  modal: true
              }
          );

        $("#div_logs").dialog
      (
          {
              //dialogClass: "no-close",
              autoOpen: false,
              height: 600,
              width: 1000,
              modal: true
          }
      );

    }, 200);

   


    //datepicker plugin
    //link
    $('.date-picker').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "dd/mm/yyyy"
    })
    //show datepicker when clicking on the icon
    .next().on(ace.click_event, function () {
        $(this).prev().focus();
    });


    $('.timepicker').timepicker({
        minuteStep: 5,
        showSeconds: false,
        showMeridian: false
    }).next().on(ace.click_event, function () {
        $(this).prev().focus();
    });

    SetFieldDecimalFormat();

    SetChosenSelect();

    var campos = $(".date-picker");
    for (var i = 0; i < campos.length; i++) {
        //Elimina las fechas y horas.
        var espacio = $(campos[i]).val().toString().indexOf(" ");
        if (espacio >= 0) {
            $(campos[i]).val($(campos[i]).val().toString().substring(0, espacio));
        }
    }
   
    $('.dynamicDataTable').dataTable();
    
    $(".div_accordion").accordion();
    var accordion_contents = $(".accordion_content");
    accordion_contents.attr("style", accordion_contents.attr("style") + " height:100%;");

    $(".mensajeValidacion").hide();

    try {
        $(".hasTooltip").tooltip({
            show: null,
            position: {
                my: "left bottom",
                at: "left top"
            },
            open: function (event, ui) {
                ui.tooltip.animate({ top: ui.tooltip.position().top + 10 }, "fast");
            }
        });
    } catch (e) {}

}

function setNumericControl() {
    $('.numericControl').ace_spinner(
           {
               value: 0,
               min: 0,
               max: 100000,
               step: 1,
               on_sides: true,
               icon_up: 'ace-icon fa fa-plus smaller-75',
               icon_down: 'ace-icon fa fa-minus smaller-75',
               btn_up_class: 'btn-success',
               btn_down_class: 'btn-danger'
           });

    $('.numericControl').addClass('numericControl-ready').removeClass("numericControl");

}

function GetCurrentURLRoot() {
    return "http://" + window.location.hostname + (window.location.port == "" ? "" : ":" + window.location.port);
}

function GetTimeSpanParameter() {
    return "nocache=" + (new Date().getMilliseconds()).toString();
}

function GetUrlForService(PathService) {

    return GetCurrentURLRoot() + PathService + "?" + GetTimeSpanParameter();
}

function GetDateTimeFromJson(jsonDate) {

    var date = eval(jsonDate.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));

    return fillZeros(date.getDate(), 2) + "/" + fillZeros((date.getMonth() + 1), 2) + "/" + date.getFullYear();
}

function fillZeros(currentValue, finalCount) {

    var v = currentValue + "";

    while (v.length< finalCount) {
        v = "0" + v;
    }

    return v;
}

function GetShortDateFromDateObject(date) {

    return fillZeros(date.getDate(), 2) + "/" + fillZeros((date.getMonth() + 1), 2) + "/" + date.getFullYear();
}

function GetDateObjectFromJson(jsonDate) {

    var date = eval(jsonDate.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));

    return date;
}

function GetDateObjectFromStringFormat(stringFormatValue) {

    var parts = stringFormatValue.split("/");

    var date = new Date(parts[2] * 1, (parts[1] * 1) - 1, parts[0] * 1);

    return date;
}

function GetDayTimeFromDate(jsonDate) {

    var d = GetDateObjectFromJson(jsonDate);
    
    var str = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    return str;
}

function DisableControls(_selector) {

    $(_selector).find("*").prop("disabled", true);

}

function EnableControls(_selector) {

    $(_selector).find("*").prop("disabled", false);

}

function submitForm(formToSubmit, validateForm) {
    if (!validateForm) {
        formToSubmit[0].submit();
        return true;
    }
    else {
        var result = ValidateForm(formToSubmit);
        if (!result.validated) {
            ShowStickErrorMessage("Verifique los datos ingresados", result.mensaje, true);
            RemoveNiceScroll(); //Re-dibuja el NiceScroll
            SetNiceScroll(); //Re-dibuja el NiceScroll
            return false;
        }
        else {
            formToSubmit[0].submit();
            return true;
        }
    }
}

function ValidateFormAndShowErrors(formToSubmit) {

    var result = ValidateForm(formToSubmit);
    if (!result.validated) {
        ShowStickErrorMessage("Verifique los datos ingresados", result.mensaje, true);
        RemoveNiceScroll(); //Re-dibuja el NiceScroll
        SetNiceScroll(); //Re-dibuja el NiceScroll
        return false;
    }

    return true;
}

function ValidateForm(formToValidate) {

    var controles = formToValidate.find(".validate");
    var errores = [];
    var mensajeErrores = "";
    var valido = true;

    $(".has-error").removeClass("has-error");

    for (var i = 0; i < controles.length; i++) {

        var control = controles[i];

        if ($(control).attr("fieldType") == "text") {

            var lbl_msj = $(control).parent().find(".mensajeValidacion");

            if (lbl_msj.length == 0)
                lbl_msj = $(control).parent().parent().find(".mensajeValidacion");

            if ($(control).val() == "") {
                $(control).parent().parent().parent().addClass("has-error");
                lbl_msj.text($(control).attr("errorMessage"));
                lbl_msj.show();
                errores.push({ codigo: 1, mensaje: $(control).attr("errorMessage") });
                mensajeErrores += $(control).attr("errorMessage") + ".\n";
                valido = false;
            }
            else {
                $(control).parent().parent().parent().removeClass("has-error");
                lbl_msj.hide();
            }
        }
        if ($(control).attr("fieldType") == "datetime") {
            var lbl_msj = $(control).parent().find(".mensajeValidacion");
            if (lbl_msj.length == 0)
                lbl_msj = $(control).parent().parent().find(".mensajeValidacion");

            if ($(control).val() == "") {
                $(control).parent().parent().parent().addClass("has-error");
                lbl_msj.text($(control).attr("errorMessage"));
                lbl_msj.show();
                errores.push({ codigo: 1, mensaje: $(control).attr("errorMessage") });
                mensajeErrores += $(control).attr("errorMessage") + ".\n";
                valido = false;
            }
            else {
                $(control).parent().parent().parent().removeClass("has-error");
                lbl_msj.hide();
            }
        }

        if ($(control).attr("fieldType") == "decimal") {
            var lbl_msj = $(control).parent().find(".mensajeValidacion");
            if (lbl_msj.length == 0)
                lbl_msj = $(control).parent().parent().find(".mensajeValidacion");
            if ($(control).val() == "") {
                $(control).parent().parent().parent().addClass("has-error");
                lbl_msj.text($(control).attr("errorMessage"));
                lbl_msj.show();

                errores.push({ codigo: 1, mensaje: $(control).attr("errorMessage") });
                mensajeErrores += $(control).attr("errorMessage") + ".\n";
                valido = false;
            }
            else {

                $(control).parent().parent().parent().removeClass("has-error");
                lbl_msj.hide();
            }
        }

        if ($(control).attr("fieldType") == "select_multiple" || $(control).attr("fieldType") == "select_simple") {

            var lbl_msj = $(control).parent().find(".mensajeValidacion");
            if (lbl_msj.length == 0)
                lbl_msj = $(control).parent().parent().find(".mensajeValidacion");

            if ($(control).val() == null) {
                lbl_msj.parent().addClass("has-error");
                lbl_msj.text($(control).attr("errorMessage"));
                lbl_msj.show();
                errores.push({ codigo: 1, mensaje: $(control).attr("errorMessage") });
                mensajeErrores += $(control).attr("errorMessage") + ".</br>";
                valido = false;
            }
            else {

                lbl_msj.parent().removeClass("has-error");
                lbl_msj.hide();
            }
        }

    }

    return { validated: valido, errors: errores, mensaje: mensajeErrores };
}

function SetFieldDecimalFormat() {

    $(".decimalFormat").keydown(function (event) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 190, 188]) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.keyCode != 110 && (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105))) {
                event.preventDefault();
            }
        }
    });

}

function SetChosenSelect() {

    $('.chosen-select').chosen({ allow_single_deselect: true });
    //resize the chosen on window resize

    $(window)
   .off('resize.chosen')
   .on('resize.chosen', function () {
       $('.chosen-select').each(function() {
           var $this = $(this);
           $this.next().css({ 'width': $this.parent().width() });
       });
   }).trigger('resize.chosen');

}

function SetChosenSelectControl(jqSelector) {

    jqSelector.chosen({ allow_single_deselect: true });
    //resize the chosen on window resize

    $(window)
   .off('resize.chosen')
   .on('resize.chosen', function () {
       jqSelector.each(function() {
           var $this = $(this);
           $this.next().css({ 'width': $this.parent().width() });
       });
   }).trigger('resize.chosen');

}

var messageType_Success = 1;
var messageType_Error = 2;
var messageType_Warning = 3;
var messageType_Info = 4;

function ShowMessageBox(messageType, messageTitle, messageText) {

    $(".alert").addClass("hide");

    $(".messageTitle").html(messageTitle);
    $(".messageText").html(messageText);

    switch (messageType) {

        case messageType_Success:
            $(".successMessage").removeClass("hide");
            break;
        case messageType_Error:
            $(".errorMessage").removeClass("hide");
            break;
        case messageType_Warning:
            $(".warningMessage").removeClass("hide");
            break;
        case messageType_Info:
            $(".infoMessage").removeClass("hide");
            break;
        default:
            break;
    }

    $("#div_messagesBox").dialog("open");
    $("#div_messagesBox").parent().attr('style', function (i, s) { return s + 'z-index: 1055!important;' });
    
}

function ShowLoader() {
    RunTimer(function() {
        try {
            $("#div_loader").dialog("open");
        } catch (e) {}
    }, 200);
}

function HideLoader() {

    RunTimer(function () {
        $("#div_loader").dialog("close");
    }, 200);
    
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function NoLayoutOnlyPlugins() {
    
    if (window.location.href.indexOf("?") >= 0) {
        window.location.href = window.location.href + "&layout=onlyplugins"
    }
    else {
        window.location.href = window.location.href + "?layout=onlyplugins"
    }
}

function NoLayoutOnlyContent() {

    if (window.location.href.indexOf("?") >= 0) {
        window.location.href = window.location.href + "&layout=none"
    }
    else {
        window.location.href = window.location.href + "?layout=none"
    }
}

function AbrirArchivos(entidad, id_entidad) {

    var _urlEntidad = "/ArchivosAdjuntos/Upload?entityName={0}&idEntity={1}";
    _urlEntidad = _urlEntidad.replace("{0}", entidad).replace("{1}", id_entidad);


    $("#iframe_archivosAdjuntos").attr("src", _urlEntidad);
    $("#div_archivosAdjuntos").dialog("open");

}

function AbrirLogs(_entidad, id_entidad) {
    
    ShowLoader();
    
    $.ajax({
        cache: false,
        async: true,
        type: "GET",
        url: GetUrlForService("/Misc/ObtenerLogs"),
        data: { entidad: _entidad, entidadId: id_entidad },
        success: function (data) {

            if (data != null && data != "") {

                $("#div_logsResultado").html(data);

                HideLoader();
                
                $("#div_logs").dialog("open");
            }
            else {

                HideLoader();
                ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
            }


        }, error: function (data) {
                   HideLoader();
                   ShowMessageBox(messageType_Error, "Error: ", "Se ha producido un error");
               }
    });

}

function ShowStaticMessage_Success(_message, scope_jq) {

    $(scope_jq).find(".staticBox").removeClass("hide");
    $(scope_jq).find(".staticBox").addClass("hide");

    $(scope_jq).find(".staticBoxSuccess").removeClass("hide");

    $(scope_jq).find(".messageStaticBox").text(_message);
}

function ShowStaticMessage_Error(_message, scope_jq) {

    $(scope_jq).find(".staticBox").removeClass("hide");
    $(scope_jq).find(".staticBox").addClass("hide");

    $(scope_jq).find(".staticBoxError").removeClass("hide");

    $(scope_jq).find(".messageStaticBox").text(_message);
}

function ResetStaticMessage(scope_jq) {

    $(scope_jq).find(".staticBox").removeClass("hide");
    $(scope_jq).find(".staticBox").addClass("hide");

    $(scope_jq).find(".messageStaticBox").text("");
}

function MinimizarMenu() {
    $("#i_minimizarMenu").click();
}

function getToday() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;

    return today;
}

function getDateToShow(date) {
    var today = date;
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;

    return today;
}

function HideLoadingScreen() {
    $("#div_mainContent").removeClass("hide");
    $("#div_mainContentLoader").addClass("hide");
}

function ShowLoadingScreen() {
    $("#div_mainContentLoader").removeClass("hide");
    $("#div_mainContent").addClass("hide");
}

function RunTimer(jsFunction,interval) {

    var jsFun = jsFunction;

   var thisTimer= setInterval(
        function () {

            window.clearTimeout(thisTimer); //Borra el timer para que no vuelva a ejecutarse

            if (jsFun != undefined && jsFun!=null)
                jsFun(); //Ejecuta la acción encomendada
            
        }, interval);
    
}

function isEmpty(_value) {

    return _value == null || _value === "";
}

function isNumeric(_value) {

    return !isEmpty(_value) && (_value * 1 == _value);

}

var utiles = {};

utiles.isEmpty = function(_value) {
    return isEmpty(_value);
};

utiles.isNumeric = function (_value) {
    return isNumeric(_value);
};

utiles.getNumber = function(_value) {
    return isNumeric(_value) ? _value * 1 : 0;
};

utiles.randomXToY=function(minVal,maxVal)
{
    var randVal = minVal+(Math.random()*(maxVal-minVal));
    return Math.round(randVal);
}

var sticker = {
    
    showError:function(title, message) {
        $.gritter.add({
            title: title,
            text: message,
            class_name: 'gritter-error'
        });

    },
    showSuccess:function(title, message) {
        $.gritter.add({
            title: title,
            text: message,
            class_name: 'gritter-success'
        });

     }
};

utiles.obtenerCantidadSeleccionados = function (items, propiedad) {

    var cantidad = 0;

    if (items != null && items.length!=null)
        for (var i = 0; i < items.length; i++) {
            if (items[i][propiedad] === true)
                cantidad = cantidad + 1;
        }

    return cantidad;
};

utiles.obtenerIdsSeleccionados = function (items, propiedadSelect, propiedadId) {

    var ids = [];

    if (items != null && items.length != null)
        for (var i = 0; i < items.length; i++) {
            if (items[i][propiedadSelect] === true)
                ids.push(items[i][propiedadId]);
        }

    return ids;
};

utiles.ConvertForMultipleSelect = function (items, propiedadId, propiedadValor) {
    var convertedItems = [];
    if (items != null && items.length != null){
        for (var i = 0; i < items.length; i++) {
            var a = { id: items[i][propiedadId], valor: items[i][propiedadValor] };
            convertedItems.push(a);
        }
    }

    return convertedItems;

};

utiles.obtenerMontoIva = function(precioConIva, factorIva) {

    var precio = (precioConIva * (factorIva - 1)) / factorIva;

    return Math.round(precio * 100) / 100;
};

utiles.redondear = function(num) {

    return Math.round(num * 100) / 100;
};

utiles.quitarItem=function(array, indexAEliminar) {
    array.splice(indexAEliminar, 1);
}

utiles.ajustarMapa=function() {
    try {
        $(window).resize(function () {
            google.maps.event.trigger(map, 'resize');
        });
        google.maps.event.trigger(map, 'resize');
    } catch (e) { }
}

utiles.obtenerParametroArrayUrl = function (items, parametro) {

    if (items == null) return nuill;

    var parametros = "";
    for (var i = 0; i < items.length; i++) {
        parametros += parametro + "=" + items[i] + "&";
    }
    return parametros;
};

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

var obtenerColorPorSuperior = function(valor, valorSuperiorVerde, valorSuperiorAmarillo) {

    var color = null;

    if (valor > valorSuperiorVerde) {
        color = COLORES.VERDE;
    } else if (valor > valorSuperiorAmarillo) {
        color = COLORES.AMARILLO;
    } else {
        color = COLORES.ROJO;
    }

    return color;
};

var ENUMERACIONES = {
    condicionesIva: {
        responsableInscripto: 1,
        consumidorFinal: 2,
        monotributista: 3,
        sujetoExento: 4,
    }
}

var COLORES_NUMEROS = {
    1: "#68BC31",
    2: "#2091CF",
    3: "#AF4E96",
    4: "#a5c9ff",
    5: "#DA5430",
    6: "#FEE074",
    7: "#ce9c5a",
    8: "#ff960b",
    9: "#49b6ea",
    10: "#62ea49",
    11: "#156706",
    12: "#67061c",
    13: "#670649",
    14: "#da5eb4",
    15: "#da5e5e",
    16: "#eaa4a4",
    17: "#c9a4ea",
    18: "#179415",
    19: "#bde616",
    20: "#a2ab7c",
};


var COLORES = {
    VERDE: "#96ff0b",
    AMARILLO: "#f3ec0f",
    ROJO: "#ef4242"
};

var COLORS = [];
COLORS.push("#DDE089");
COLORS.push("#9230CC");
COLORS.push("#C95550");
COLORS.push("#FAFD68");
COLORS.push("#43AED1");
COLORS.push("#6CF460");
COLORS.push("#3E662F");
COLORS.push("#178E68");
COLORS.push("#664ABC");
COLORS.push("#9D691F");
COLORS.push("#78fff9");
COLORS.push("#FC3532");
COLORS.push("#EAC128");
COLORS.push("#054D38");
COLORS.push("#179681");
COLORS.push("#523E6B");
COLORS.push("#CCD542");
COLORS.push("#910DC1");
COLORS.push("#754DF3");
COLORS.push("#DB30F4");
COLORS.push("#26274E");
COLORS.push("#29362A");
COLORS.push("#DFE4D0");
COLORS.push("#8D6589");
COLORS.push("#63888F");
COLORS.push("#D5C73A");
COLORS.push("#D98D36");
COLORS.push("#DA83DF");
COLORS.push("#F21E62");
COLORS.push("#B3D44B");
COLORS.push("#9484CA");
COLORS.push("#29C372");
COLORS.push("#D41B59");
COLORS.push("#C29F4A");
COLORS.push("#53FF99");
COLORS.push("#21E8D5");
COLORS.push("#044239");
COLORS.push("#82DC74");
COLORS.push("#0D19C1");
COLORS.push("#34CC43");
COLORS.push("#429E05");
COLORS.push("#6AB2BD");
COLORS.push("#1997CC");
COLORS.push("#C2CC10");
COLORS.push("#6C6B4B");
COLORS.push("#CA75D8");
COLORS.push("#8DF0B5");
COLORS.push("#DA3AC8");
COLORS.push("#769FD9");
COLORS.push("#8557A2");
COLORS.push("#593740");
COLORS.push("#6DD2D7");
COLORS.push("#D3CBA5");
COLORS.push("#E03C7B");
COLORS.push("#10AF4F");
COLORS.push("#AC0AA7");
COLORS.push("#9230CC");
COLORS.push("#CC3EE5");
COLORS.push("#4429F3");
COLORS.push("#036EA9");
COLORS.push("#C95550");
COLORS.push("#A6FCE4");
COLORS.push("#50B208");
COLORS.push("#A21ED8");
COLORS.push("#8E2133");
COLORS.push("#32C017");
COLORS.push("#C49A88");
COLORS.push("#CE8AF8");
COLORS.push("#79268B");
COLORS.push("#91990D");
COLORS.push("#476C3F");
COLORS.push("#F2372F");
COLORS.push("#DA9000");
COLORS.push("#3CCE73");
COLORS.push("#79ACBC");
COLORS.push("#7F6523");
COLORS.push("#D3FEAC");
COLORS.push("#71CD94");
COLORS.push("#0F4745");
COLORS.push("#448590");
COLORS.push("#1291A2");
COLORS.push("#76D388");
COLORS.push("#3AF21F");
COLORS.push("#3F786D");
COLORS.push("#C5453C");
COLORS.push("#132748");
COLORS.push("#3FD155");
COLORS.push("#9BA063");
COLORS.push("#34DF91");
COLORS.push("#BBA6B1");
COLORS.push("#F7E382");
COLORS.push("#BBF716");
COLORS.push("#55B140");
COLORS.push("#EC2526");
COLORS.push("#BDF7B6");
COLORS.push("#3353EC");
COLORS.push("#2746C5");
COLORS.push("#3A2CAA");
COLORS.push("#3ABCAD");
COLORS.push("#35EE88");
COLORS.push("#3E5DFB");
COLORS.push("#73A6F8");
COLORS.push("#111A98");
COLORS.push("#D75998");
COLORS.push("#00E6D1");
COLORS.push("#DCB3F4");
COLORS.push("#B64E22");
COLORS.push("#B2A578");
COLORS.push("#ABEB90");
COLORS.push("#E4672A");
COLORS.push("#A840E8");
COLORS.push("#47EB5B");
COLORS.push("#E1CB57");
COLORS.push("#F328B0");
COLORS.push("#A9217C");
COLORS.push("#A711FE");
COLORS.push("#751CFA");
COLORS.push("#642FE1");
COLORS.push("#C40635");
COLORS.push("#E519E1");
COLORS.push("#08EBA4");
COLORS.push("#C72738");
COLORS.push("#7EE607");
COLORS.push("#5CAA48");
COLORS.push("#A102AE");
COLORS.push("#6C171E");
COLORS.push("#4C8B4C");
COLORS.push("#B74E3F");
COLORS.push("#8A3352");
COLORS.push("#FAC5E4");
COLORS.push("#1C9DA9");
COLORS.push("#6701D9");
COLORS.push("#D9E4A5");
COLORS.push("#96FA08");
COLORS.push("#16C2EC");
COLORS.push("#4BFC3C");
COLORS.push("#E95EC3");
COLORS.push("#FAFD68");
COLORS.push("#F37356");
COLORS.push("#370DEA");


var getRandomColor=function() {

    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


var getRandomColors=function(count){

    var colors=[];

    for(var i= 0; i<count; i++){
        colors.push(getRandomColor());
    }

    return colors;
}


var getSelectedColors = function(indexFrom, count){
    
    var colors=[];

    for(var i= indexFrom; i<indexFrom+count; i++){
        colors.push(COLORS[i]);
    }

    return colors;
}
