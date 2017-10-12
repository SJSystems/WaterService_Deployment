mainApp.controller('repClientesController', ['$scope', '$http',
    function ($scope, $http) {

        var init = function () {


        };

        $scope.busqueda = {
            repartos: {}, estados: {}, tipos: {}, dias: {}, promotores: {}, zonas: {}, ciudades: {}, condicionesIva: {},
            periodoAlta: {}, periodoBaja: {},
            incluirAlta: false, incluirBaja: false,
            incluirLista:true,
        };

        var init = function () {

            RunTimer(function () {

            }, 500);

        };

        var getRequest = function () {

            var idsRepartos = $scope.busqueda.repartos.itemsSelected.map(function (x) { return x.id; });
            var idsDiasDeVisitas = $scope.busqueda.dias.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
            var idsTipos = $scope.busqueda.tipos.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
            var idsPromotores = $scope.busqueda.promotores.itemsSelected.map(function (x) { return x.usuario_id; });
            var idsEstados = $scope.busqueda.estados.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
            var idsZonas = $scope.busqueda.zonas.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });
            var idsCondicionesIva = $scope.busqueda.condicionesIva.valorSateliteSeleccionado.map(function (x) { return x.valor_ids; });

            var fechaAltaDesde = $scope.busqueda.incluirAlta ? $scope.busqueda.periodoAlta.periodo.startDate : null;
            var fechaAltaHasta = $scope.busqueda.incluirAlta ? $scope.busqueda.periodoAlta.periodo.endDate : null;

            var fechaBajaDesde = $scope.busqueda.incluirBaja ? $scope.busqueda.periodoBaja.periodo.startDate : null;
            var fechaBajaHasta = $scope.busqueda.incluirBaja ? $scope.busqueda.periodoBaja.periodo.endDate : null;

            var req = {
                idsRepartos: idsRepartos,
                idsDiasDeVisitas: idsDiasDeVisitas,
                idsTipos: idsTipos,
                idsEstados: idsEstados,
                idsPromotores: idsPromotores,
                idsZonas: idsZonas,
                idsCondicionesIva: idsCondicionesIva,
                idsCiudades: [],

                fechaAltaDesde: fechaAltaDesde,
                fechaAltaHasta: fechaAltaHasta,
                fechaBajaDesde: fechaBajaDesde,
                fechaBajaHasta: fechaBajaHasta,

                incluirLista: $scope.busqueda.incluirLista
            };

            return req;
        };

        $scope.buscar = function () {
            ShowLoader();

            $http.post(GetUrlForService('/Reportes/ObtenerClientesDashboard'), getRequest()).then(function (resp) {

                HideLoader();

                if (resp.data.error === 0) {

                    $scope.datos = resp.data.datos;
                    cargarGraficos();

                } else {
                    ShowMessageBox(messageType_Error, "Error", resp.data.message);
                }
            }, function (error) {
                HideLoader();
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
            });

        };

        $scope.descargarExcel = function () {

            $scope.descangando = true;

            $http.post(GetUrlForService("/Reportes/ObtenerClientesExcel"), getRequest(), { responseType: 'arraybuffer' }
            ).then(function (response) {

                $scope.descangando = false;

                var headers = response.headers();
                var blob = new Blob([response.data], { type: headers['content-type'] });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = "AntiguedadDeDeuda.xlsx";
                link.click();

            }, function (error) {
                $scope.descangando = false;
                ShowMessageBox(messageType_Error, "Error", "Se ha producido un error");
            });
        };

        var cargarGraficos = function () {
            
            cargarGraficoTiposDeClientes();
            cargarGraficoCondicionIva();
            cargarGraficoEstados();

            cargarGraficoZonas();
            cargarGraficoRepartos();
            cargarGraficoDias();

            cargarGraficoCiudades();
            cargarGraficoAbonos();
            cargarGraficoDispensers();

            cargarGraficoSaldosRepartos();

        };

        var _charTipos = null;
        var cargarGraficoTiposDeClientes = function () {

            _charTipos = setGraficoSimple('piechart-tipos-clientes', $scope.datos.cantidadPorTiposDeClientes, _charTipos);
        };
        var _chartCondicionesIva = null;
        var cargarGraficoCondicionIva = function () {
            _chartCondicionesIva = setGraficoSimple('piechart-cliente-iva', $scope.datos.cantidadPorCondicionesDeIva, _chartCondicionesIva);
        };
        var _chartEstados = null;
        var cargarGraficoEstados = function () {

            _chartEstados = setGraficoSimple('piechart-estados', $scope.datos.cantidadPorEstados, _chartEstados);
        };

        var _chartZonas = null;
        var cargarGraficoZonas = function () {

            _chartZonas = setGraficoSimple('piechart-zonas', $scope.datos.cantidadPorZonas, _chartZonas);
        };
        var _chartRepartos = null;
        var cargarGraficoRepartos = function () {
            _chartRepartos = setGraficoSimple('piechart-repartos', $scope.datos.cantidadPorRepartos, _chartRepartos);
        };
        var _chartDias = null;
        var cargarGraficoDias = function () {
            _chartDias = setGraficoSimple('piechart-dias', $scope.datos.cantidadPorDiaDeSemana, _chartDias);
        };

        var _chartCiudades = null;
        var cargarGraficoCiudades = function () {

            setGraficoSimple('piechart-ciudades', $scope.datos.cantidadPorCiudad, _chartCiudades);
        };
        var _chartAbonos = null;
        var cargarGraficoAbonos = function () {
            _chartAbonos = setGraficoSimple('piechart-abonos', $scope.datos.clientesConAbonos, _chartAbonos);
        };
        var _chartDispensers = null;
        var cargarGraficoDispensers = function () {
            _chartDispensers = setGraficoSimple('piechart-dispensers', $scope.datos.clientesConDispensers, _chartDispensers);
        };

        var _chartSalosRepartos = null;
        var cargarGraficoSaldosRepartos = function () {

            var items = $scope.datos.saldosPorRepartosPorTiposDeClientes;

            var datosFamilia = $scope.datos.saldosPorRepartosPorTiposDeClientes.map(function (item, index) {

                return [item.descripcion, item.valores[0]];
            });

            var datosEmpresa = $scope.datos.saldosPorRepartosPorTiposDeClientes.map(function (item, index) {

                return [item.descripcion, item.valores[1]];
            });

            var descripciones = items.map(function (item, index) { return item.descripcion; });
            var saldoClientesFamilias = items.map(function (item, index) { return item.valores[0]; });
            var saldoClientesEmpresas = items.map(function (item, index) { return item.valores[1]; });
            
            var horasTrabajadas = items.map(x => x.valores[0]);
            var horasNoTrabajadas = items.map(x => x.horasNoTrabajadas);
            var horasConDemoras = items.map(x => x.horasConDemora);

            var myData =
                {
                    labels: descripciones,
                    datasets: [
                        {
                            label: 'Saldo familia',
                            data: saldoClientesFamilias,
                            backgroundColor: COLORS[1],
                            borderColor: COLORS[11],
                            borderWidth: 1
                        },
                        {
                            label: 'Saldo empresa',
                            data: saldoClientesEmpresas,
                            backgroundColor: COLORS[0],
                            borderColor: COLORS[10],
                            borderWidth: 1
                        }],

                };

            if (_chartSalosRepartos != null) {
                _chartSalosRepartos.destroy();
            }

            var config = {
                type: 'bar',
                data: myData,
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            stacked: true
                        }],
                        xAxes: [{
                            stacked: true
                        }],
                    }
                }
            };

            _chartSalosRepartos = _createBarChart($("#chart-saldos-repartos"), config);
        };

        var setGraficoSimple = function (div, items, _chart) {

            var descripciones = items.map(function (x) { return x.descripcion; });
            var valores = items.map(function (x) { return x.valor; });
            var colores = getSelectedColors(1, valores.length);

            var myData =
                {
                    labels: descripciones,
                    datasets: [
                        {
                            data: valores,
                            backgroundColor: colores,
                            borderColor: getSelectedColors(11, valores.length),
                            borderWidth: 1
                        }],

                };

            if (_chart != null) {
                _chart.destroy();
            }

            var config = {
                type: 'pie',
                data: myData
            };

            _chart = _createBarChart($("#" + div), config);

            return _chart;
        };

        init();

    }]);

function labelFormatter(label, series) {
    return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>"+ Math.round(series.percent) + "%</div>";
}

var _createBarChart = function (ctx, chartConfiguration) {

    var chartCreated = new Chart(ctx, chartConfiguration);

    return chartCreated;
}