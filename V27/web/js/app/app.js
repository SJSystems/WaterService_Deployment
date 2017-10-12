var mainApp = angular.module(
   'app',
    [
        'ngRoute'
        , 'facturacionControllers'
    ]
);

mainApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/facturacionprocesos', {
                    templateUrl: '/js/app/views/facturacion/procesos.html'
                })
                .otherwise({
                    templateUrl: 'js/app/views/shared/urlnotvalid.html'
                });
        }]);

