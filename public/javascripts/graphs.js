var xVideo, yVideo, xAxisVideo, yAxisVideo, lineVideo, svgVideo, maxWidth, margin, width, height;
var xAudio, yAudio, xAxisAudio, yAxisAudio, lineAudio, svgAudio;
var xFLAudio, yFLAudio, xAxisFLAudio, yAxisFLAudio, lineFLAudio, svgFLAudio;
var xFLVideo, yFLVideo, xAxisFLVideo, yAxisFLVideo, lineFLVideo, svgFLVideo;

var data = {audio: [], video: []};
var dataSub = {FLVideo: [], FLAudio: [], BW: []};
var buffer = [];
var bufferLength = 5;
var graphLength = 25;


$(document).ready(function(){


    maxWidth = $("#chartVideo").width();

    margin = {top: 50, right: 20, bottom: 20, left: 40};
    width = maxWidth - margin.left - margin.right;
    height = 250 - margin.top - margin.bottom;

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
        .tickFormat(d3.format("d"));

    lineVideo = d3.svg.line()
        .x(function(d) { return xVideo(d.date); })
        .y(function(d) { return yVideo(d.kbps); });


    svgVideo = d3.select("#chartVideo").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.video.forEach(function(d) {
        dataCallback(d);
    })

    xVideo.domain(d3.extent(data.video, function(d) { return d.date; }));
    yVideo.domain([0, d3.max(data.video, function(d) { return d.kbps; })]);

    svgVideo.append("path")
      .data([data.video])
      .attr("class", "line")
      .attr("id", "videoChart")
      .attr("d", lineVideo);

    svgVideo.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisVideo);

    svgVideo.append("g")
      .attr("class", "y axis")
      .call(yAxisVideo)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Kbps Video ");

     // *********** AUDIO *************

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
        .tickFormat(d3.format("d"));

    lineAudio = d3.svg.line()
        .x(function(d) { return xAudio(d.date); })
        .y(function(d) { return yAudio(d.kbps); });


    svgAudio = d3.select("#chartAudio").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.audio.forEach(function(d) {
        dataCallback(d);
    })

    xAudio.domain(d3.extent(data.audio, function(d) { return d.date; }));
    yAudio.domain([0, d3.max(data.audio, function(d) { return d.kbps; })]);

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
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Kbps Audio");


})    

var parseDate = d3.time.format("%H:%M:%S");


var dataCallback = function(d) {
    d.date = parseDate.parse(d.date);
    d.kbps = +d.kbps;
}

var dataCallbackSub = function(d) {
  d.date = parseDate.parse(d.date);
  d.val = +d.val;
}

var newDataPub = function(newObject) {
    buffer.push(newObject);

    if (buffer.length == bufferLength) {
      var date = buffer[2].date;
      var kbpsAudio = 0;
      var kbpsVideo = 0;

      for (var i in buffer){
        kbpsAudio += buffer[i].kbpsAudio;
        kbpsVideo += buffer[i].kbpsVideo;
      }

      kbpsAudio = kbpsAudio / bufferLength;
      kbpsVideo = kbpsVideo / bufferLength;

      var newDataVideo = {date: date, kbps: kbpsVideo};
      var newDataAudio = {date: date, kbps: kbpsAudio};

      buffer = [];
      if (data.video.length == graphLength) data.video.splice(0,1);
      data.video.push(newDataVideo);

      dataCallback(data.video[data.video.length - 1]);
      xVideo.domain(d3.extent(data.video, function(d) { return d.date; }));
      yVideo.domain([0, d3.max(data.video, function(d) { return d.kbps; })]);

      svgVideo.select("g.x.axis").call(xAxisVideo);
      svgVideo.select("g.y.axis").call(yAxisVideo); 

      svgVideo.select("path#videoChart").data([data.video])
          .attr("d", lineVideo);
    
      if (data.audio.length == graphLength) data.audio.splice(0,1);
      data.audio.push(newDataAudio);

      dataCallback(data.audio[data.audio.length - 1]);
      xAudio.domain(d3.extent(data.audio, function(d) { return d.date; }));
      yAudio.domain([0, d3.max(data.audio, function(d) { return d.kbps; })]);

      svgAudio.select("g.x.axis").call(xAxisAudio);
      svgAudio.select("g.y.axis").call(yAxisAudio); 

      svgAudio.select("path#audioChart").data([data.audio])
          .attr("d", lineAudio);
  }
}

var newDataSub = function(subID, data) {
  if (!data) {
      dataSub = {FLVideo: [], FLAudio: [], BW: []};
      drawFLVideoChart(subID);
      drawFLAudioChart(subID);
      drawBWChart(subID);
      sub_modal_now = subID;
      return;
  } else if (sub_modal_now == subID) {
      var date = data.date;
      var FLVideo = data.FLVideo;
      var FLAudio = data.FLAudio;
      var BW = data.BW / 1000;

      var newDataFLVideo = {date: date, val: FLVideo};
      var newDataFLAudio = {date: date, val: FLAudio};
      var newDataBW = {date: date, val: BW};

      updateFLVideoChart(newDataFLVideo);
      updateFLAudioChart(newDataFLAudio);
      updateBWChart(newDataBW);
  }
}

var drawFLVideoChart = function() {

    maxWidth = 528;

    margin = {top: 50, right: 20, bottom: 20, left: 40};
    width = maxWidth - margin.left - margin.right;
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
        dataCallbackSub(d);
    })

    xFLVideo.domain(d3.extent(dataSub.FLVideo, function(d) { return d.date; }));
    yFLVideo.domain([0, d3.max(dataSub.FLVideo, function(d) { return d.val; })]);

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
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("FL Video");
}

var drawFLAudioChart = function() {

    maxWidth = 528;

    margin = {top: 50, right: 20, bottom: 20, left: 40};
    width = maxWidth - margin.left - margin.right;
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
        dataCallbackSub(d);
    })

    xFLAudio.domain(d3.extent(dataSub.FLAudio, function(d) { return d.date; }));
    yFLAudio.domain([0, d3.max(dataSub.FLAudio, function(d) { return d.val; })]);

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
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("FL Audio");
}

var drawBWChart = function() {

    maxWidth = 528;

    margin = {top: 50, right: 20, bottom: 20, left: 40};
    width = maxWidth - margin.left - margin.right;
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
        dataCallbackSub(d);
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
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("BW");
}

var updateFLVideoChart = function(newData) {
      if (dataSub.FLVideo.length == graphLength) dataSub.FLVideo.splice(0,1);
      dataSub.FLVideo.push(newData);

      dataCallbackSub(dataSub.FLVideo[dataSub.FLVideo.length - 1]);
      xFLVideo.domain(d3.extent(dataSub.FLVideo, function(d) { return d.date; }));
      yFLVideo.domain([0, d3.max(dataSub.FLVideo, function(d) { return d.val; })]);

      svgFLVideo.select("g.x.axis").call(xAxisFLVideo);
      svgFLVideo.select("g.y.axis").call(yAxisFLVideo); 

      svgFLVideo.select("path#FLVideoChart").data([dataSub.FLVideo])
          .attr("d", lineFLVideo);
}
var updateFLAudioChart = function(newData) {
      if (dataSub.FLAudio.length == graphLength) dataSub.FLAudio.splice(0,1);
      dataSub.FLAudio.push(newData);

      dataCallbackSub(dataSub.FLAudio[dataSub.FLAudio.length - 1]);
      xFLAudio.domain(d3.extent(dataSub.FLAudio, function(d) { return d.date; }));
      yFLAudio.domain([0, d3.max(dataSub.FLAudio, function(d) { return d.val; })]);

      svgFLAudio.select("g.x.axis").call(xAxisFLAudio);
      svgFLAudio.select("g.y.axis").call(yAxisFLAudio); 

      svgFLAudio.select("path#FLAudioChart").data([dataSub.FLAudio])
          .attr("d", lineFLAudio);
}

var updateBWChart = function(newData) {
      if (dataSub.BW.length == graphLength) dataSub.BW.splice(0,1);
      dataSub.BW.push(newData);

      dataCallbackSub(dataSub.BW[dataSub.BW.length - 1]);
      xBW.domain(d3.extent(dataSub.BW, function(d) { return d.date; }));
      yBW.domain([0, d3.max(dataSub.BW, function(d) { return d.val; })]);

      svgBW.select("g.x.axis").call(xAxisBW);
      svgBW.select("g.y.axis").call(yAxisBW); 

      svgBW.select("path#BWChart").data([dataSub.BW])
          .attr("d", lineBW);
}