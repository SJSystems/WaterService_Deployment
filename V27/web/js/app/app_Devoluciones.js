var mainApp = angular.module(
   'app_Devoluciones',
    [
        'devolucionesControllers'
    ]
);



mainApp.filter("mydate", function () {
    var re = /\\\/Date\(([0-9]*)\)\\\//;
    return function (x) {
        var m = x.match(re);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
});