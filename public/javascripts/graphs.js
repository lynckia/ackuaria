var x, y, xAxis, yAxis, line, svg, maxWidth, margin, width, height;
var dataVideo = [];

$(document).ready(function(){


    maxWidth = $("#chart").width();


    margin = {top: 20, right: 20, bottom: 20, left: 40};
    width = maxWidth - margin.left - margin.right;
    height = 250 - margin.top - margin.bottom;

    x = d3.time.scale()
        .range([0, width]);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.seconds, 20)
        .tickFormat(d3.time.format("%H:%M:%S"));

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format("d"));

    line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.kbps); });

    svg = d3.select("#chartVideo").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
        dataCallback(d);
    })

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.kbps; })]);

    svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Kbps ");


})    

var parseDate = d3.time.format("%H:%M:%S");


var dataCallback = function(d) {
    d.date = parseDate.parse(d.date);
    d.kbps = +d.kbps;
}

var newData = function(newObject, type) {
    if (data.length == 50) data.splice(0,1);
    data.push(newObject);

    dataCallback(data[data.length - 1]);
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.kbps; })]);

    svg.select("g.x.axis").call(xAxis);
    svg.select("g.y.axis").call(yAxis); 

    svg.selectAll("path").data([data])
        .attr("d", line);
}