var xVideo, yVideo, xAxisVideo, yAxisVideo, lineVideo, svgVideo, maxWidth, maxWidthSub, margin, width, height;
var xAudio, yAudio, xAxisAudio, yAxisAudio, lineAudio, svgAudio;
var xFLAudio, yFLAudio, xAxisFLAudio, yAxisFLAudio, lineFLAudio, svgFLAudio;
var xFLVideo, yFLVideo, xAxisFLVideo, yAxisFLVideo, lineFLVideo, svgFLVideo;

var data = {audio: [], video: []};
var dataSub = {FLVideo: [], FLAudio: [], BW: []};
var buffer = [];
var counterVideo = 1;
var counterAudio = 1;
var bufferLength = 5;
var graphLengthPub = 50;
var graphLengthSub = 100;

$(document).ready(function(){
    maxWidth = $("#chartVideo").width();
    $("#subscriberModal").show();
    maxWidthSub = $("#subscribersCharts").width();
    $("#subscriberModal").hide();

    drawVideoKbpsChart();
    drawAudioKbpsChart();
})

var parseDate = d3.time.format("%H:%M:%S");


var dataCallback = function(d) {
    d.date = parseDate.parse(d.date);
    d.val = +d.val;
}

var newDataPub = function(newObject) {
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

var newDataSub = function(subID, data) {
  if (!data) {
      dataSub = {FLVideo: [], FLAudio: [], BW: []};
      drawFLVideoChart(subID);
      drawFLAudioChart(subID);
      // drawBWChart(subID);
      sub_modal_now = subID;
      return;
  } else if (sub_modal_now == subID) {
      var date = data.date;
      if (data.FLVideo) {
        var FLVideo = data.FLVideo * 100 / 256;
        var newDataFLVideo = {date: date, val: FLVideo};
        updateFLVideoChart(newDataFLVideo);
      }
      if (data.FLAudio) {
        var FLAudio = data.FLAudio * 100 / 256;
        var newDataFLAudio = {date: date, val: FLAudio};
        updateFLAudioChart(newDataFLAudio);
      }
      if (data.BW) {
        var BW = data.BW;
        var newDataBW = {date: date, val: BW};
        // updateBWChart(newDataBW);
      }


  }
}

var drawVideoKbpsChart = function() {

    margin = {top: 30, right: 10, bottom: 50, left: 35};
    width = maxWidth - margin.left - margin.right;
    height = 220 - margin.top - margin.bottom;

    xVideo = d3.time.scale()
        .range([0, width]);

    yVideo = d3.scale.linear()
        .range([height, 0]);

    xAxisVideo = d3.svg.axis()
        .scale(xVideo)
        .orient("bottom")
        .ticks(d3.time.seconds, 60)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxisVideo = d3.svg.axis()
        .scale(yVideo)
        .orient("left")
        .ticks(5)
        .tickFormat(d3.format("d"));

    lineVideo = d3.svg.line()
        .x(function(d) { return xVideo(d.date); })
        .y(function(d) { return yVideo(d.val); });


    svgVideo = d3.select("#chartVideo").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.video.forEach(function(d) {
        dataCallback(d);
    })

    xVideo.domain(d3.extent(data.video, function(d) { return d.date; }));
    yVideo.domain([0, d3.max(data.video, function(d) { return d.val; })]);

    svgVideo.append("path")
      .data([data.video])
      .attr("class", "line")
      .attr("id", "videoChart")
      .attr("d", lineVideo);

    svgVideo.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisVideo)

    svgVideo.append("g")
      .attr("class", "y axis")
      .call(yAxisVideo)
    .append("text")
      .attr("y", -30)
      .attr("x", 80)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .style("font-family", 'Nunito-Light')
      .style("font-size", "16px")
      .style("fill", "#042762")
      .text(" Video All layers (Kbps)");

}

var drawAudioKbpsChart = function() {

    xAudio = d3.time.scale()
        .range([0, width]);

    yAudio = d3.scale.linear()
        .range([height, 0]);

    xAxisAudio = d3.svg.axis()
        .scale(xAudio)
        .orient("bottom")
        .ticks(d3.time.seconds, 60)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxisAudio = d3.svg.axis()
        .scale(yAudio)
        .orient("left")
        .ticks(5)
        .tickFormat(d3.format("d"));

    lineAudio = d3.svg.line()
        .x(function(d) { return xAudio(d.date); })
        .y(function(d) { return yAudio(d.val); });


    svgAudio = d3.select("#chartAudio").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.audio.forEach(function(d) {
        dataCallback(d);
    })

    xAudio.domain(d3.extent(data.audio, function(d) { return d.date; }));
    yAudio.domain([0, d3.max(data.audio, function(d) { return d.val; })]);

    svgAudio.append("path")
      .data([data.audio])
      .attr("class", "line")
      .attr("id", "audioChart")
      .attr("d", lineAudio);

    svgAudio.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisAudio);
    svgAudio.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisAudio);
    svgAudio.append("g")
      .attr("class", "y axis")
      .call(yAxisAudio)
    .append("text")
      .attr("y", -30)
      .attr("x", 80)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .style("font-family", 'Nunito-Light')
      .style("font-size", "16px")
      .style("fill", "#042762")
      .text(" Audio (Kbps)");
}

var drawFLVideoChart = function() {


    margin = {top: 50, right: 40, bottom: 20, left: 40};
    width = maxWidthSub - margin.left - margin.right;
    height = 250 - margin.top - margin.bottom;

    xFLVideo = d3.time.scale()
        .range([0, width]);

    yFLVideo = d3.scale.linear()
        .range([height, 0]);

    xAxisFLVideo = d3.svg.axis()
        .scale(xFLVideo)
        .orient("bottom")
        .ticks(d3.time.seconds, 60)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxisFLVideo = d3.svg.axis()
        .scale(yFLVideo)
        .orient("left")
        .ticks(6)
        .tickFormat(d3.format("d"));

    lineFLVideo = d3.svg.line()
        .x(function(d) { return xFLVideo(d.date); })
        .y(function(d) { return yFLVideo(d.val); });


    svgFLVideo = d3.select("#chartFLVideo").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dataSub.FLVideo.forEach(function(d) {
        dataCallback(d);
    })

    xFLVideo.domain(d3.extent(dataSub.FLVideo, function(d) { return d.date; }));
    yFLVideo.domain([0, 100]);

    svgFLVideo.append("path")
      .data([dataSub.FLVideo])
      .attr("class", "line")
      .attr("id", "FLVideoChart")
      .attr("d", lineFLVideo);

    svgFLVideo.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisFLVideo);

    svgFLVideo.append("g")
      .attr("class", "y axis")
      .call(yAxisFLVideo)
    .append("text")
      .attr("y", -30)
      .attr("x", 160)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .style("font-family", 'Nunito-Light')
      .style("font-size", "16px")
      .style("fill", "#042762")
      .text(" Fraction Lost Video (%)");
}

var drawFLAudioChart = function() {


    margin = {top: 50, right: 40, bottom: 20, left: 40};
    width = maxWidthSub - margin.left - margin.right;
    height = 250 - margin.top - margin.bottom;

    xFLAudio = d3.time.scale()
        .range([0, width]);

    yFLAudio = d3.scale.linear()
        .range([height, 0]);

    xAxisFLAudio = d3.svg.axis()
        .scale(xFLAudio)
        .orient("bottom")
        .ticks(d3.time.seconds, 60)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxisFLAudio = d3.svg.axis()
        .scale(yFLAudio)
        .orient("left")
        .ticks(6)
        .tickFormat(d3.format("d"));

    lineFLAudio = d3.svg.line()
        .x(function(d) { return xFLAudio(d.date); })
        .y(function(d) { return yFLAudio(d.val); });


    svgFLAudio = d3.select("#chartFLAudio").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dataSub.FLAudio.forEach(function(d) {
        dataCallback(d);
    })

    xFLAudio.domain(d3.extent(dataSub.FLAudio, function(d) { return d.date; }));
    yFLAudio.domain([0, 100]);

    svgFLAudio.append("path")
      .data([dataSub.FLAudio])
      .attr("class", "line")
      .attr("id", "FLAudioChart")
      .attr("d", lineFLAudio);

    svgFLAudio.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisFLAudio);

    svgFLAudio.append("g")
      .attr("class", "y axis")
      .call(yAxisFLAudio)
    .append("text")
      .attr("y", -30)
      .attr("x", 160)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .style("font-family", 'Nunito-Light')
      .style("font-size", "16px")
      .style("fill", "#042762")
      .text(" Fraction Lost Audio (%)");
}

var drawBWChart = function() {

    margin = {top: 50, right: 40, bottom: 20, left: 40};
    width = maxWidthSub - margin.left - margin.right;
    height = 250 - margin.top - margin.bottom;

    xBW = d3.time.scale()
        .range([0, width]);

    yBW = d3.scale.linear()
        .range([height, 0]);

    xAxisBW = d3.svg.axis()
        .scale(xBW)
        .orient("bottom")
        .ticks(d3.time.seconds, 60)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxisBW = d3.svg.axis()
        .scale(yBW)
        .orient("left")
        .ticks(6)
        .tickFormat(d3.format("d"));

    lineBW = d3.svg.line()
        .x(function(d) { return xBW(d.date); })
        .y(function(d) { return yBW(d.val); });


    svgBW = d3.select("#chartBW").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dataSub.BW.forEach(function(d) {
        dataCallback(d);
    })

    xBW.domain(d3.extent(dataSub.BW, function(d) { return d.date; }));
    yBW.domain([0, d3.max(dataSub.BW, function(d) { return d.val; })]);

    svgBW.append("path")
      .data([dataSub.BW])
      .attr("class", "line")
      .attr("id", "BWChart")
      .attr("d", lineBW);

    svgBW.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBW);

    svgBW.append("g")
      .attr("class", "y axis")
      .call(yAxisBW)
    .append("text")
      .attr("y", -30)
      .attr("x", 160)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .style("font-family", 'Nunito-Light')
      .style("font-size", "16px")
      .style("fill", "#042762")
      .text(" Bandwidth Video (Kbps)");
}

var updateVideoKbpsChart = function(newData) {
      if (data.video.length == graphLengthPub) data.video.splice(0,1);
      data.video.push(newData);

      dataCallback(data.video[data.video.length - 1]);
      xVideo.domain(d3.extent(data.video, function(d) { return d.date; }));
      yVideo.domain([0, d3.max(data.video, function(d) { return d.val; })]);

      svgVideo.select("g.x.axis").call(xAxisVideo);
      svgVideo.select("g.y.axis").call(yAxisVideo);

      svgVideo.select("path#videoChart").data([data.video])
          .attr("d", lineVideo);
}

var updateAudioKbpsChart = function(newData) {
      if (data.audio.length == graphLengthPub) data.audio.splice(0,1);
      data.audio.push(newData);

      dataCallback(data.audio[data.audio.length - 1]);
      xAudio.domain(d3.extent(data.audio, function(d) { return d.date; }));
      yAudio.domain([0, d3.max(data.audio, function(d) { return d.val; })]);

      svgAudio.select("g.x.axis").call(xAxisAudio);
      svgAudio.select("g.y.axis").call(yAxisAudio);

      svgAudio.select("path#audioChart").data([data.audio])
          .attr("d", lineAudio);
}

var updateFLVideoChart = function(newData) {
      if (dataSub.FLVideo.length == graphLengthSub) dataSub.FLVideo.splice(0,1);
      dataSub.FLVideo.push(newData);

      dataCallback(dataSub.FLVideo[dataSub.FLVideo.length - 1]);
      xFLVideo.domain(d3.extent(dataSub.FLVideo, function(d) { return d.date; }));
      yFLVideo.domain([0, 100]);

      svgFLVideo.select("g.x.axis").call(xAxisFLVideo);
      svgFLVideo.select("g.y.axis").call(yAxisFLVideo);

      svgFLVideo.select("path#FLVideoChart").data([dataSub.FLVideo])
          .attr("d", lineFLVideo);
}
var updateFLAudioChart = function(newData) {
      if (dataSub.FLAudio.length == graphLengthSub) dataSub.FLAudio.splice(0,1);
      dataSub.FLAudio.push(newData);

      dataCallback(dataSub.FLAudio[dataSub.FLAudio.length - 1]);
      xFLAudio.domain(d3.extent(dataSub.FLAudio, function(d) { return d.date; }));
      yFLAudio.domain([0, 100]);

      svgFLAudio.select("g.x.axis").call(xAxisFLAudio);
      svgFLAudio.select("g.y.axis").call(yAxisFLAudio);

      svgFLAudio.select("path#FLAudioChart").data([dataSub.FLAudio])
          .attr("d", lineFLAudio);
}

var updateBWChart = function(newData) {
      if (dataSub.BW.length == graphLengthSub) dataSub.BW.splice(0,1);
      dataSub.BW.push(newData);

      dataCallback(dataSub.BW[dataSub.BW.length - 1]);
      xBW.domain(d3.extent(dataSub.BW, function(d) { return d.date; }));
      yBW.domain([0, d3.max(dataSub.BW, function(d) { return d.val; })]);

      svgBW.select("g.x.axis").call(xAxisBW);
      svgBW.select("g.y.axis").call(yAxisBW);

      svgBW.select("path#BWChart").data([dataSub.BW])
          .attr("d", lineBW);
}
