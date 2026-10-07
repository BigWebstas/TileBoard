// Chart.js 3+ renamed most options. TileBoard configs (and our own defaults) are still written
// in the Chart.js 2 format, so options are translated here right before they reach Chart.js.
// Options already in the new format pass through untouched.

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function convertAxis (axis) {
   const { id, gridLines, scaleLabel, ticks, ...rest } = axis;
   const res = rest;

   if (gridLines) {
      res.grid = gridLines;
   }

   if (scaleLabel) {
      const { labelString, ...title } = scaleLabel;
      res.title = { ...title, text: labelString };
   }

   if (ticks) {
      const { callback, min, max, beginAtZero, ...tickRest } = ticks;
      res.ticks = tickRest;

      if (typeof callback === 'function') {
         // v2 passed the label and the list of labels, v3+ passes the raw value and tick objects.
         res.ticks.callback = function (value, index, tickList) {
            const label = this.type === 'category' ? this.getLabelForValue(value) : value;
            return callback(label, index, tickList.map(tick => tick.value));
         };
      }
      if (min !== undefined) {
         res.min = min;
      }
      if (max !== undefined) {
         res.max = max;
      }
      if (beginAtZero !== undefined) {
         res.beginAtZero = beginAtZero;
      }
   }

   return { id, axis: res };
}

function convertAxes (axes, defaultId) {
   const res = {};

   axes.forEach(function (axis, index) {
      const { id, axis: converted } = convertAxis(axis);
      res[id || (index === 0 ? defaultId : defaultId + index)] = converted;
   });

   return res;
}

function convertTooltip ({ callbacks, ...tooltip }) {
   const res = tooltip;

   if (callbacks) {
      res.callbacks = {};

      // v2 callbacks received (tooltipItem(s), data) with `index` and `value` fields.
      const legacyItem = item => ({ ...item, index: item.dataIndex, value: item.formattedValue });

      ['title', 'label'].forEach(function (name) {
         const callback = callbacks[name];
         if (typeof callback !== 'function') {
            return;
         }

         res.callbacks[name] = function (arg) {
            const items = Array.isArray(arg) ? arg : [arg];
            const { data } = items[0].chart;
            const legacyArg = Array.isArray(arg) ? items.map(legacyItem) : legacyItem(arg);
            return callback.call(this, legacyArg, data);
         };
      });
   }

   return res;
}

export function normalizeChartOptions (options) {
   const { legend, tooltips, scales, ...rest } = options;
   const res = rest;

   if (legend || tooltips) {
      res.plugins = { ...rest.plugins };
      if (legend) {
         res.plugins.legend = legend;
      }
      if (tooltips) {
         res.plugins.tooltip = convertTooltip(tooltips);
      }
   }

   if (isObject(scales)) {
      const { xAxes, yAxes, ...namedScales } = scales;

      res.scales = {
         ...(Array.isArray(xAxes) ? convertAxes(xAxes, 'x') : {}),
         ...(Array.isArray(yAxes) ? convertAxes(yAxes, 'y') : {}),
         ...namedScales,
      };
   }

   return res;
}

// Palette used by angular-chart.js for consecutive datasets.
const COLORS = [
   [151, 187, 205],
   [220, 220, 220],
   [247, 70, 74],
   [70, 191, 189],
   [253, 180, 92],
   [148, 159, 177],
   [77, 83, 96],
];

export function datasetColors (index) {
   const [r, g, b] = COLORS[index % COLORS.length];
   return {
      backgroundColor: `rgba(${r},${g},${b},0.2)`,
      borderColor: `rgba(${r},${g},${b},1)`,
      pointBackgroundColor: `rgba(${r},${g},${b},1)`,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: `rgba(${r},${g},${b},0.8)`,
   };
}

// Adds space between the legend and the plot.
export const legendPaddingPlugin = {
   id: 'legendPadding',
   beforeInit (chart) {
      const { legend } = chart;
      if (!legend) {
         return;
      }
      const fit = legend.fit;
      legend.fit = function () {
         fit.call(this);
         this.height += 20;
      };
   },
};
