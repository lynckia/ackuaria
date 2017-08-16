let ChartManager = () => {
  let that = {};
  let svgVideo, svgAudio, svgFLAudio, svgFLVideo, qualityLayers;
  let counterVideo, counterAudio;

  that.init = () => {
    maxWidth = $("#chartVideo").width();
    $("#subscriberModal").show();
    maxWidthSub = $("#subscribersCharts").width();
    $("#subscriberModal").hide();

    drawVideoKbpsChart();
    drawAudioKbpsChart();
    qualityLayers = QualityLayersCharts();
  };

  that.newDataPub = function(newObject) {
    var date = newObject.date;
    if (newObject.kbpsVideo) {
      if (newObject.kbpsVideo == 0) counterVideo++;
      else {
        var kbpsVideo = newObject.kbpsVideo / counterVideo;
        counterVideo = 1;
        var newDataVideo = {date: date, val: kbpsVideo};
        updateVideoKbpsChart(newDataVideo);
      }
    }
    if (newObject.kbpsAudio) {
      if (newObject.kbpsAudio == 0) counterAudio++;
      else {
        var kbpsAudio = newObject.kbpsAudio / counterAudio;
        counterAudio = 1;
        var newDataAudio = {date: date, val: kbpsAudio};
        updateAudioKbpsChart(newDataAudio);
      }
    }
  }

  that.newDataSub = function(subID, data) {
    if (!data) {
      drawFLVideoChart(subID);
      drawFLAudioChart(subID);
      sub_modal_now = subID;
      return;
    } else if (sub_modal_now == subID) {
      var date = data.date;
      if (data.FLVideo !== undefined) {
        var FLVideo = data.FLVideo * 100 / 256;
        var newDataFLVideo = {date: date, val: FLVideo};
        updateFLVideoChart(newDataFLVideo);
      }
      if (data.FLAudio !== undefined) {
        var FLAudio = data.FLAudio * 100 / 256;
        var newDataFLAudio = {date: date, val: FLAudio};
        updateFLAudioChart(newDataFLAudio);
      }
    }
  }

  that.updateQualityLayers = (pubID, id, event) => {
    qualityLayers.updateCharts(pubID, id, event);
  };

  that.destroySubCharts = () => {
    if (svgFLVideo) {
      svgFLVideo.destroyChart();
      svgFLVideo = undefined;
    }
    if (svgAudio) {
      svgFLAudio.destroyChart();
      svgFLAudio = undefined;
    }
    if (qualityLayers) {
      qualityLayers.destroyCharts();
    }
  };

  drawQualityLayersChart = () => {

  }

  let drawVideoKbpsChart = () => {
    svgVideo = genericChart('chartVideo', 'videoHighChart', 'Video Kbps');
  };

  let drawAudioKbpsChart = () => {
    svgAudio = genericChart('chartAudio', 'audioHighChart', 'Audio Kbps');
  };

  let drawFLVideoChart = function() {
    svgFLVideo = genericChart('chartFLVideo', 'video FLV', 'Video Fraction Lost');
  };

  let drawFLAudioChart = function() {
    svgFLAudio = genericChart('chartFLAudio', 'Audio FLV', 'Audio Fraction Lost');
  };


  let updateVideoKbpsChart = function(newData) {
    svgVideo.updateChart('kbps', newData.val);
  };

  let updateAudioKbpsChart = function(newData) {
    svgAudio.updateChart('kbps', newData.val);
  };

  let updateFLVideoChart = function(newData) {
    svgFLVideo.updateChart('lost pct.', newData.val)
  };
  let updateFLAudioChart = function(newData) {
    svgFLAudio.updateChart('lost pct', newData.val)
  };

  return that;
};
