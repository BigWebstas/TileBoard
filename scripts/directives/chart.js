import angular from 'angular';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import { datasetColors, legendPaddingPlugin, normalizeChartOptions } from '../globals/chart';

Chart.register(...registerables);

function defaultOptions () {
   const clock24 = window.CONFIG.timeFormat === 24;

   return {
      maintainAspectRatio: false, // to fit popup automatically
      layout: {
         padding: {
            bottom: 10,
            left: 10,
            right: 10,
         },
      },
      scales: {
         xAxes: [{
            type: 'time',
            time: {
               displayFormats: {
                  datetime: clock24 ? 'MMM D, YYYY, H:mm:ss' : 'MMM D, YYYY, h:mm:ss a',
                  hour: clock24 ? 'H:mm' : 'h:mm a',
                  millisecond: clock24 ? 'H:mm:ss.SSS' : 'h:mm:ss.SSS a',
                  minute: clock24 ? 'H:mm' : 'h:mm a',
                  second: clock24 ? 'H:mm:ss' : 'h:mm:ss a',
               },
            },
         }],
         yAxes: [{
            ticks: {
               maxTicksLimit: 7,
            },
         }],
      },
      elements: {
         point: {
            radius: 0, // to remove points
            hitRadius: 5,
         },
         line: {
            borderWidth: 1,
            stepped: true,
            fill: true,
         },
      },
      legend: {
         align: 'start',
         display: true,
      },
      tooltips: {
         intersect: false,
      },
      hover: {
         intersect: false,
      },
   };
}

/**
 * @ngInject
 *
 * Renders a Chart.js line chart into a canvas.
 * Options use the Chart.js 2 format (or the current one), see globals/chart.js.
 *
 * @type {angular.IDirectiveFactory}
 */
export default function () {
   return {
      restrict: 'A',
      scope: {
         data: '=chartData',
         datasetOverride: '=chartDatasetOverride',
         options: '=chartOptions',
      },
      link (scope, elem) {
         let chart = null;

         function buildDatasets () {
            return (scope.data || []).map(function (data, index) {
               return {
                  ...datasetColors(index),
                  ...(scope.datasetOverride || [])[index],
                  data: data,
               };
            });
         }

         function build () {
            const options = normalizeChartOptions(angular.merge(defaultOptions(), scope.options));

            chart = new Chart(elem[0], {
               type: 'line',
               data: { datasets: buildDatasets() },
               options: options,
               plugins: [legendPaddingPlugin],
            });
         }

         function update () {
            if (!chart) {
               build();
            } else {
               chart.data.datasets = buildDatasets();
               chart.update();
            }
         }

         scope.$watch('data', update, true);

         scope.$watch('options', function (newValue, oldValue) {
            if (chart && newValue !== oldValue) {
               chart.destroy();
               chart = null;
               update();
            }
         }, true);

         scope.$on('$destroy', function () {
            if (chart) {
               chart.destroy();
               chart = null;
            }
         });
      },
   };
}
