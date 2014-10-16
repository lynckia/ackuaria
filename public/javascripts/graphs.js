var charts = [];
var GRAPH = {};
var ppsLost = [];
// var ppsLostXAxis = [];
var ppsLostTime = [];
var BpsSentTime = [];

var BpsSent = [];
var BpsSentValue = [];
var xVal=[];
///////////////////////////////////////////////////////////////

GRAPH.generatePpsLost = function(id, value, time) {
  xVal[id] = 0;

  ppsLostTime[id] = time;
  ppsLost[id] = [];

  ppsLost[id].push({
    x: new Date(time),
    y: 0
  })
  charts[id] = new CanvasJS.Chart(id, {
    title: {
      text: "Pps Lost"
    },
    axisX:{      
            interval: 1,
            intervalType: "minute",
            valueFormatString: "hh:mm:ss" ,
            labelAngle: -50
        },
      axisY:{
        minimum: 0
      },
    height:300,
    width:600,
    data: [{
      type: "area",
      color: "rgba(200,0,0,0.9)",
      dataPoints: ppsLost[id]
    }]
  });

}
GRAPH.updatePpsLost = function(id, value, time) {
  var date = new Date(time);
  xVal[id] = date;
  var dataLength = 100; // number of dataPoints visible at any point

  var timeElapsed = time - ppsLostTime[id];

  if (timeElapsed != 0) {
    var data = (value / timeElapsed) * 1000;
  }
  else {
    var data = 0;
  }

  ppsLostTime[id] = time;

  ppsLost[id].push({
    x: xVal[id],
    y: data
  });


  if (ppsLost[id].length > dataLength) {
    ppsLost[id].shift();
  }

  charts[id].render();

};


//////////////////////////////////////////////////////////////////

GRAPH.generateFractionLost = function(id, value) {
  var bind = '#' + id;
  var chart = c3.generate({
    bindto: bind,
    // size: {
    //     height: 240,
    //     width: 480
    // },
    data: {
      columns: [
        ['fractionLost', value]
      ],
      type: 'gauge',

    },
    transition: {
      duration: 1000
    },
    // gauge: {
    //    label: {
    //        format: function(value, ratio) {
    //            return value;
    //        },
    //        show: true // to turn off the min/max labels.
    //    },
    // min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
    // max: 100, // 100 is default
    // units: ' %',
    // width: 39 // for adjusting arc thickness
    //  },
    color: {
      pattern: ['#60B044', '#F6C600', '#F97600', '#FF0000'], // the three color levels for the percentage values.
      threshold: {
        //            unit: 'value', // percentage is default
        //            max: 200, // 100 is default
        values: [30, 60, 90, 100]
      }
    }
  });

  charts[id] = chart;



}

GRAPH.updateFractionLost = function(id, value) {
  var chart = charts[id];

  chart.load({
    columns: [
      ['fractionLost', value]
    ]
  });
};

GRAPH.generateBpsSent = function(id, value, time, type) {

  xVal[id] = 0;

  BpsSentTime[id] = time;
  BpsSent[id] = [];
  BpsSent[id].push({
    x: new Date(time),
    y: 0
  })
  BpsSentValue[id] = value;

  charts[id] = new CanvasJS.Chart(id, {
    title: {
      text: "Bps Sent " + type
    },
    axisX:{      
            interval: 1,
            intervalType: "minute",
            valueFormatString: "hh:mm:ss" ,
            labelAngle: -50
        },
    height: 300,
    width: 600,
    data: [{
            type: "area",
            color: "rgba(0,150,300,0.9)",
            dataPoints: BpsSent[id]
    }]
  });


}

GRAPH.updateBpsSent = function(id, value, time) {


  var bytesSent = value - BpsSentValue[id];
  var timeElapsed = time - BpsSentTime[id];
  var date = new Date(time);
  xVal[id] = date;

  var dataLength = 100; // number of dataPoints visible at any point
  if (timeElapsed != 0) {
    var data = (bytesSent / timeElapsed) * 1000;
  }
  else {
    var data = 0;
  }

  BpsSentTime[id] = time;
  BpsSentValue[id] = value;

  BpsSent[id].push({
    x: xVal[id],
    y: data
  });


  if (BpsSent[id].length > dataLength) {
    BpsSent[id].shift();
  }

  charts[id].render();

}