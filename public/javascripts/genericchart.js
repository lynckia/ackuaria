/* globals Highcharts */
'use strict';

const genericChart = (parentDiv, chartDiv, title, chartStyle) => {
  const that = {};
  that.chart = {};
  that.parentDiv = parentDiv;
  that.chartDiv = chartDiv;
  that.chartStyle = chartStyle || 'width: 500px; height: float:left;';
  that.title = title;

  let initChart = () => {
    let parent = document.getElementById(that.parentDiv);
    let div = document.createElement('div');
    div.setAttribute('style', that.chartStyle);
    div.setAttribute('id', that.chartDiv);
    parent.appendChild(div);
    let chart = new Highcharts.Chart({
      chart: {
        renderTo: chartDiv,
        defaultSeriesType: 'line',
        animation: false,
        showAxes: true,
        events: {
        }
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      title: {
        text: that.title
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000
      },
      yAxis: {
        minPadding: 0.2,
        maxPadding: 0.2,
        floor: 0,
        title: {
          text: null,
          margin: 80
        }
      },
      tooltip: {
        formatter: function() {
          let s = '';
          for (let point of this.points) {
            s += '<br/>' + point.series.name + ': ' + point.y;
          }
          return s;
        },
        crosshairs: [true, true],
        shared: true
      },
      series: []
    });
    return chart;
  }

  that.updateChart =  (key, newValue, pointName = undefined, isActive = true) => {
    let date = (new Date()).getTime();
    let valueX = date;
    let valueY = newValue;
    if (that.chart.seriesMap[key] === undefined) {
      let das, color, width = 3;
      that.chart.seriesMap[key] = that.chart.chart.addSeries( {
        name: key,
        dashStyle: undefined,
        color: undefined,
        lineWidth: width,
        data: []

      });
    }
    if (!isActive) {
      point.marker = {
        radius: 4,
        lineColor: 'red',
        fillColor: 'red',
        lineWidth: 1,
        symbol: 'circle'
      };
    }
    let seriesForKey = that.chart.seriesMap[key];
    let shift = seriesForKey.data.length > 30;
    let point = {x: valueX, y: valueY};
    seriesForKey.addPoint(point, true, shift);
  };


  that.destroyChart = () => {
    that.chart.chart.destroy();

  };

  that.chart = {
    seriesMap: {},
    chart: initChart(),

  };
  return that;
};
