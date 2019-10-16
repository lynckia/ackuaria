let ChartManager = () => {
  let that = {};
  let svgVideo, svgAudio, svgSubsAudio, svgFLAudio, svgFLVideo, qualityLayers, qualityLayersPub, svgBWE, svgConnection;
  let counterVideo, counterAudio;

  let getPubChartStyle = () => {
    let margin = {top: 30, right: 10, bottom: 50, left: 35};
    let width = maxWidth - margin.left - margin.right;
    let strStyle = `width: ${width}` ;
    return strStyle;
  };

  let getSubChartStyle = () => {
    let margin = {top: 50, right: 40, bottom: 20, left: 40};
    let width = maxWidthSub - margin.left - margin.right;
    let strStyle = `width: ${width}` ;
    return strStyle;
  };

  let drawVideoKbpsChart = () => {
    svgVideo = genericChart('chartVideo', 'videoHighChart', 'Video Kbps', getPubChartStyle());
  };

  let drawAudioKbpsChart = () => {
    svgAudio = genericChart('chartAudio', 'audioHighChart', 'Audio Kbps', getPubChartStyle());
  };

  let drawConnectionChart = () => {
    svgConnection = genericChart('chartConnection', 'connectionHighChart', 'Connection BW estimated', getPubChartStyle());
  };

  let drawSubscriberAudioChart = () => {
    svgSubsAudio = genericChart('chartSubsAudio', 'audioSubscriberChart', 'Audio Kbps', getSubChartStyle());
  };

  let drawFLVideoChart = () => {
    svgFLVideo = genericChart('chartFLVideo', 'video FLV', 'Video Fraction Lost', getSubChartStyle());
  };

  let drawFLAudioChart = () => {
    svgFLAudio = genericChart('chartFLAudio', 'Audio FLV', 'Audio Fraction Lost', getSubChartStyle());
  };

  let drawBWEChart = () => {
    svgBWE = genericChart('chartBWE', 'Connection BW estimated', 'Connection BW estimated', getSubChartStyle());
  };

  let initQualityLayersChart = () => {
    qualityLayers = QualityLayersCharts(getSubChartStyle());
  };

  let updateVideoKbpsChart = (newData) => {
    svgVideo.updateChart('kbps', newData.val);
  };

  let updateAudioKbpsChart = (newData) => {
    svgAudio.updateChart('kbps', newData.val);
  };

  let updateConnectionChart = (newData) => {
    if (svgConnection) {
      svgConnection.updateChart('bwe', newData.val.senderBitrateEstimation);
      svgConnection.updateChart('target bitrate', newData.val.targetBitrate);
      svgConnection.updateChart('padding bitrate', newData.val.paddingBitrate);
      svgConnection.updateChart('video bitrate', newData.val.videoBitrate);
    }
  };

  let updateSubscriberAudioChart = (newData) => {
    if (svgSubsAudio) {
      svgSubsAudio.updateChart('kbps', newData.val);
    }
  };

  let updateFLVideoChart = (newData) => {
    if (svgFLVideo) {
      svgFLVideo.updateChart('lost pct.', newData.val)
    }
  };

  let updateFLAudioChart = (newData) => {
    if (svgFLAudio) {
      svgFLAudio.updateChart('lost pct', newData.val)
    }
  };

  let updateBWEChart = (newData) => {
    if (svgBWE) {
      svgBWE.updateChart('bwe', newData.val.senderBitrateEstimation);
      svgBWE.updateChart('target bitrate', newData.val.targetVideoBitrate);
      svgBWE.updateChart('padding bitrate', newData.val.paddingBitrate);
      svgBWE.updateChart('video bitrate', newData.val.videoBitrate);
    }
  };

  that.init = () => {
    maxWidth = $("#chartVideo").width();
    $("#subscriberModal").show();
    maxWidthSub = $("#subscribersCharts").width();
    $("#subscriberModal").hide();

    // drawVideoKbpsChart();
    drawAudioKbpsChart();
    drawConnectionChart();
    qualityLayersPub = QualityLayersCharts(getPubChartStyle());
  };

  that.newDataPub = (newData) => {
    const date = newData.date;
    // if (newData.kbpsVideo) {
    //   if (newData.kbpsVideo == 0) counterVideo++;
    //   else {
    //     const kbpsVideo = newData.kbpsVideo / counterVideo;
    //     counterVideo = 1;
    //     const newDataVideo = {date: date, val: kbpsVideo};
    //     updateVideoKbpsChart(newDataVideo);
    //   }
    // }
    if (newData.kbpsAudio) {
      if (newData.kbpsAudio == 0) counterAudio++;
      else {
        const kbpsAudio = newData.kbpsAudio / counterAudio;
        counterAudio = 1;
        const newDataAudio = {date: date, val: kbpsAudio};
        updateAudioKbpsChart(newDataAudio);
      }
    }
    if (newData.connection) {
        const newDataAudio = {date: date, val: newData.connection};
        updateConnectionChart(newDataAudio);
    }
  }

  that.newDataSub = (subID, data) => {
    if (!data) {
      initQualityLayersChart();
      drawSubscriberAudioChart(subID);
      drawFLVideoChart(subID);
      drawFLAudioChart(subID);
      drawBWEChart(subID);
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
      if (data.audioBW !== undefined) {
        const newDataAudio = {date: date, val: data.audioBW};
        updateSubscriberAudioChart(newDataAudio);
      }
      if (data.senderBitrateEstimation !== undefined) {
        const newDataBWE = {
          date: date,
          val: data};
        updateBWEChart(newDataBWE);
      }
    }
  }

  that.updateQualityLayers = (pubID, id, event) => {
    qualityLayers.updateCharts(pubID, id, event);
  };

  that.updateQualityLayersPub = (pubID, event) => {
    qualityLayersPub.updateCharts(pubID, 'publisher', event);
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
    if (svgSubsAudio) {
      svgSubsAudio.destroyChart();
      svgSubsAudio = undefined;
    }
    if (qualityLayers) {
      qualityLayers.destroyCharts();
    }
    if (svgBWE) {
      svgBWE.destroyChart();
      svgBWE = undefined;
    }
  };


  return that;
};
