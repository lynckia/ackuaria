var xVideo, yVideo, xAxisVideo, yAxisVideo, lineVideo, svgVideo, maxWidth, margin, width, height;
var xAudio, yAudio, xAxisAudio, yAxisAudio, lineAudio, svgAudio;

var dataVideo = [];
var dataAudio = [];
var bufferVideo = [];
var bufferAudio = [];

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
        .ticks(d3.time.seconds, 20)
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

    dataVideo.forEach(function(d) {
        dataCallback(d);
    })

    xVideo.domain(d3.extent(dataVideo, function(d) { return d.date; }));
    yVideo.domain([0, d3.max(dataVideo, function(d) { return d.kbps; })]);

    svgVideo.append("path")
      .data([dataVideo])
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

     // AUDIO *************

    xAudio = d3.time.scale()
        .range([0, width]);

    yAudio = d3.scale.linear()
        .range([height, 0]);

    xAxisAudio = d3.svg.axis()
        .scale(xAudio)
        .orient("bottom")
        .ticks(d3.time.seconds, 20)
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

    dataAudio.forEach(function(d) {
        dataCallback(d);
    })

    xAudio.domain(d3.extent(dataAudio, function(d) { return d.date; }));
    yAudio.domain([0, d3.max(dataAudio, function(d) { return d.kbps; })]);

    svgAudio.append("path")
      .data([dataAudio])
      .attr("class", "line")
      .attr("id", "audioChart")
      .attr("d", lineAudio);

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

var newData = function(newObject, type) {
	if (type == "video"){
		bufferVideo.push(newObject);
		if (bufferVideo.length == 5) {
			var date = bufferVideo[2].date;
			var kbps = 0;
			for (var i in bufferVideo){
				kbps += bufferVideo[i].kbps;
			}
			kbps = kbps / 5;
			var data = {date: date, kbps: kbps};
			bufferVideo = [];
			if (dataVideo.length == 200) dataVideo.splice(0,1);
		    dataVideo.push(data);

		    dataCallback(dataVideo[dataVideo.length - 1]);
		    xVideo.domain(d3.extent(dataVideo, function(d) { return d.date; }));
		    yVideo.domain([0, d3.max(dataVideo, function(d) { return d.kbps; })]);

		    svgVideo.select("g.x.axis").call(xAxisVideo);
		    svgVideo.select("g.y.axis").call(yAxisVideo); 

		    svgVideo.select("path#videoChart").data([dataVideo])
		        .attr("d", lineVideo);
		}

	} else {
		bufferAudio.push(newObject);
		if (bufferAudio.length == 5) {
			var date = bufferAudio[2].date;
			var kbps = 0;
			for (var i in bufferAudio){
				kbps += bufferAudio[i].kbps;
			}
			kbps = kbps / 5;
			var data = {date: date, kbps: kbps};
			bufferAudio = [];

			if (dataAudio.length == 200) dataAudio.splice(0,1);
		    dataAudio.push(data);

		    dataCallback(dataAudio[dataAudio.length - 1]);
		    xAudio.domain(d3.extent(dataAudio, function(d) { return d.date; }));
		    yAudio.domain([0, d3.max(dataAudio, function(d) { return d.kbps; })]);

		    svgAudio.select("g.x.axis").call(xAxisAudio);
		    svgAudio.select("g.y.axis").call(yAxisAudio); 

		    svgAudio.select("path#AudioChart").data([dataAudio])
		        .attr("d", lineAudio);
		}
	}


}