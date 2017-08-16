let ChartManager = () => {
  let that = {};
  let svgVideo, svgAudio, svgFLAudio, svgFLVideo, qualityLayers;
  let counterVideo, counterAudio;

  let getPubChartStyle = () => {
    let margin = {top: 30, right: 10, bottom: 50, left: 35};
    let width = maxWidth - margin.left - margin.right;
    let strStyle = `width: ${width}` ;
    return strStyle;
  }

  let getSubChartStyle = () => {
    let margin = {top: 50, right: 40, bottom: 20, left: 40};
    let width = maxWidthSub - margin.left - margin.right;
    let strStyle = `width: ${width}` ;
    return strStyle;
  }

  let drawVideoKbpsChart = () => {
    svgVideo = genericChart('chartVideo', 'videoHighChart', 'Video Kbps', getPubChartStyle());
  };

  let drawAudioKbpsChart = () => {
    svgAudio = genericChart('chartAudio', 'audioHighChart', 'Audio Kbps', getPubChartStyle());
  };

  let drawFLVideoChart = () => {
    svgFLVideo = genericChart('chartFLVideo', 'video FLV', 'Video Fraction Lost', getSubChartStyle());
  };

  let drawFLAudioChart = () => {
    svgFLAudio = genericChart('chartFLAudio', 'Audio FLV', 'Audio Fraction Lost', getSubChartStyle());
  };

  let updateVideoKbpsChart = (newData) => {
    svgVideo.updateChart('kbps', newData.val);
  };

  let updateAudioKbpsChart = (newData) => {
    svgAudio.updateChart('kbps', newData.val);
  };

  let updateFLVideoChart = (newData) => {
    svgFLVideo.updateChart('lost pct.', newData.val)
  };
  let updateFLAudioChart = (newData) => {
    svgFLAudio.updateChart('lost pct', newData.val)
  };

  that.init = () => {
    maxWidth = $("#chartVideo").width();
    $("#subscriberModal").show();
    maxWidthSub = $("#subscribersCharts").width();
    $("#subscriberModal").hide();

    drawVideoKbpsChart();
    drawAudioKbpsChart();
    qualityLayers = QualityLayersCharts();
  };

  that.newDataPub = (newData) => {
    const date = newData.date;
    if (newData.kbpsVideo) {
      if (newData.kbpsVideo == 0) counterVideo++;
      else {
        const kbpsVideo = newData.kbpsVideo / counterVideo;
        counterVideo = 1;
        const newDataVideo = {date: date, val: kbpsVideo};
        updateVideoKbpsChart(newDataVideo);
      }
    }
    if (newData.kbpsAudio) {
      if (newData.kbpsAudio == 0) counterAudio++;
      else {
        const kbpsAudio = newData.kbpsAudio / counterAudio;
        counterAudio = 1;
        const newDataAudio = {date: date, val: kbpsAudio};
        updateAudioKbpsChart(newDataAudio);
      }
    }
  }

  that.newDataSub = (subID, data) => {
    if (!data) {
      drawFLVideoChart(subID);
      drawFLAudioChart(subID);
      sub_modal_now = subID;
      return;
    } else if (sub_modal_now == subID) {
      const date = data.date;
      if (data.FLVideo !== undefined) {
        const FLVideo = data.FLVideo * 100 / 256;
        const newDataFLVideo = {date: date, val: FLVideo};
        updateFLVideoChart(newDataFLVideo);
      }
      if (data.FLAudio !== undefined) {
        const FLAudio = data.FLAudio * 100 / 256;
        const newDataFLAudio = {date: date, val: FLAudio};
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


  return that;
};
