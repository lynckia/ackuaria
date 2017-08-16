/* globals Highcharts */
'use strict';

const QualityLayersCharts = () => {
  const that = {};
  const charts = new Map();

  const spatialStyles = ['ShortDot', 'Dash', 'DashDot', 'ShortDashDotDot'];
  const temporalStyles = ['#7cb5ec', '#90ed7d', '#f7a35c', '#f15c80'];

  const toBitrateString = (value) => {
    let result = Math.floor(value / Math.pow(2, 10));
    return result + 'kbps';
  };

  const initChart = (streamId, subId) => {
    let pubId = streamId;
    if (!charts.has(pubId)) {
      return undefined;
    }
    var parent = document.getElementById('chartBW');
    var div = document.createElement('div');
    div.setAttribute('style', 'width: 500px; height:500px; float:left;');
    div.setAttribute('id', 'chart' + pubId + '_' + subId);

    parent.appendChild(div);

    let chart = new Highcharts.Chart({
      chart: {
        renderTo: 'chart' + pubId + '_' + subId,
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
        text: 'Video Bandwidth (Kbps)'
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000
      },
      yAxis: {
        minPadding: 0.2,
        maxPadding: 0.2,
        title: {
          text: null,
          margin: 80
        }
      },
      tooltip: {
        formatter: () => {
          let s = '';
          let selectedLayers = 'Spatial: 0 / Temporal: 0';
          for (let point of this.points) {
            s += '<br/>' + point.series.name + ': ' + toBitrateString(point.point.y);
            selectedLayers = point.point.name || selectedLayers;
          }
          s = '<b>' + selectedLayers  + '</b>' + s;
          return s;
        },
        crosshairs: [true, true],
        shared: true
      },
      series: []
    });
    charts.get(pubId).set(subId, chart);
    return chart;
  };

  let getOrCreateChart = (streamId, subId) => {
    let pubId = streamId;
    let chart;
    if (!charts.has(pubId)) {
      charts.set(pubId, new Map());
    }
    if (!charts.get(pubId).has(subId)) {
      chart = {
        seriesMap: {},
        chart: initChart(streamId, subId)
      };
      charts.get(pubId).set(subId, chart);
    } else {
      chart = charts.get(pubId).get(subId);
    }
    return chart;
  };

  var updateSeriesForKey =  (streamId, subId, key, spatial, temporal, valueX, valueY,pointName = undefined, isActive = true) => {
    let chart = getOrCreateChart(streamId, subId);
    if (chart.seriesMap[key] === undefined) {

      let dash, color, width = 3;
      if (spatial && temporal) {
        dash = spatialStyles[spatial];
        color = temporalStyles[temporal];
        width = 2;
      } else if (key === 'Current Received') {
        color = '#2b908f';
      } else if (key === 'Estimated Bandwidth') {
        color = '#434348';
      }

      chart.seriesMap[key] = chart.chart.addSeries({
        name: key,
        dashStyle: dash,
        color: color,
        lineWidth: width,
        data: []
      });
    }
    let seriesForKey = chart.seriesMap[key];
    let shift = seriesForKey.data.length > 30;
    let point = { x: valueX, y: valueY, name: pointName };
    if (!isActive) {
      point.marker = {
        radius: 4,
        lineColor: 'red',
        fillColor: 'red',
        lineWidth: 1,
        symbol: 'circle'
      };
    }
    seriesForKey.addPoint(point, true, shift);
  };

  that.updateCharts = (pubId, subId, data) => {
    let date = (new Date()).getTime();

    let selectedLayers = '';
    let qualityLayersData = data[subId].qualityLayers;

    if (qualityLayersData !== undefined) {
    let maxActiveSpatialLayer = qualityLayersData.maxActiveSpatialLayer || 0;
    for (var spatialLayer in qualityLayersData) {
      for (var temporalLayer in qualityLayersData[spatialLayer]) {
        let key = 'Spatial ' + spatialLayer + ' / Temporal ' + temporalLayer;
        updateSeriesForKey(pubId, subId, key, spatialLayer, temporalLayer,
          date, qualityLayersData[spatialLayer][temporalLayer], undefined,
          maxActiveSpatialLayer >= spatialLayer);
        }
      }
      if (qualityLayersData.selectedSpatialLayer) {
        selectedLayers += 'Spatial: ' + qualityLayersData.selectedSpatialLayer +
        ' / Temporal: '+ qualityLayersData.selectedTemporalLayer;
      }
    }

    let totalBitrate = data[subId].total.bitrateCalculated || 0;
    let bitrateEstimated = data[subId].total.senderBitrateEstimation || 0;
    let paddingBitrate = data[subId].total.paddingBitrate || 0;
    let rtxBitrate = data[subId].total.rtxBitrate || 0;

    updateSeriesForKey(pubId, subId, 'Current Received', undefined, undefined,
    date, totalBitrate, selectedLayers);
    updateSeriesForKey(pubId, subId, 'Estimated Bandwidth', undefined, undefined,
    date, bitrateEstimated);
    updateSeriesForKey(pubId, subId, 'Padding Bitrate', undefined, undefined,
    date, paddingBitrate);
    updateSeriesForKey(pubId, subId, 'Rtx Bitrate', undefined, undefined,
    date, rtxBitrate);
  };

  that.destroyCharts = () => {
    charts.forEach((subMap, pubId) => {
      subMap.forEach((subscriberChart, subId) => {
        subscriberChart.chart.destroy();
        charts.get(pubId).delete(subId);
      });
    });
  };
  return that;
};
