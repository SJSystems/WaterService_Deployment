var mainApp = angular.module(
   'app_facturacion',
    [
        'ngRoute',
        'facturacionControllers'
    ]
);

mainApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/facturacionprocesos', {
                    templateUrl: '/js/app/views/facturacion/procesos.html'
                })
                 .when('/comandos', {
                     templateUrl: '/js/app/views/facturacion/comandos_batch.html'
                 })
                 .when('/facturas', {
                     templateUrl: '/js/app/views/facturacion/facturas.html'
                 })
                .otherwise({
                    templateUrl: '/js/app/views/facturacion/procesos.html'
                });
        }]);

mainApp.filter("mydate", function () {
    var re = /\\\/Date\(([0-9]*)\)\\\//;
    return function (x) {
        var m = x.match(re);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
});