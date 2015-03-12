var Getopt = require('node-getopt');
var config = require('./ackuaria_config');
var db = require('./common/mdb/dataBase').db;
var eventsRegistry = require('./common/mdb/eventsRegistry');
var statsRegistry = require('./common/mdb/statsRegistry');
var roomsRegistry = require('./common/mdb/roomsRegistry');
var sessionsRegistry = require('./common/mdb/sessionsRegistry');

GLOBAL.config = config || {};

// Parse command line arguments
var getopt = new Getopt([
   ['r', 'rabbit-host=ARG', 'RabbitMQ Host'],
   ['g', 'rabbit-port=ARG', 'RabbitMQ Port'],
   ['l', 'logging-config-file=ARG', 'Logging Config File'],
   ['h', 'help', 'display this help']
]);

opt = getopt.parse(process.argv.slice(2));

for (var prop in opt.options) {
   if (opt.options.hasOwnProperty(prop)) {
      var value = opt.options[prop];
      switch (prop) {
         case "help":
            getopt.showHelp();
            process.exit(0);
            break;
         case "rabbit-host":
            GLOBAL.config.rabbit = GLOBAL.config.rabbit || {};
            GLOBAL.config.rabbit.host = value;
            break;
         case "rabbit-port":
            GLOBAL.config.rabbit = GLOBAL.config.rabbit || {};
            GLOBAL.config.rabbit.port = value;
            break;
         case "logging-config-file":
            GLOBAL.config.logger = GLOBAL.config.logger || {};
            GLOBAL.config.logger.config_file = value;
            break;
         default:
            break;
      }
   }
}

// Load submodules with updated config
var amqper = require('./common/amqper');

var API = require('./common/api');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var partials = require('express-partials');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(bodyParser.json());
app.set('view engine', 'ejs');

http.listen(GLOBAL.config.ackuaria.port, function() {
   console.log('listening on *:' + GLOBAL.config.ackuaria.port);
});

var api = API.api;


amqper.connect(function() {
   "use strict";
   amqper.bind_broadcast('event', api.event);
   amqper.bind_broadcast('stats', api.stats);

});


io.on('connection', function(socket) {
   API.sockets.push(socket);
});


app.get('/', function(req, res) {
   res.render('rooms', {
      view:"rooms",
      rooms: API.rooms
   });
});


//TRASH 
app.get('/room', function(req, res){
   var roomID = req.query.room_id;
   res.render('publishers', {
      view:"publishers",
      roomID: roomID,
      rooms: API.rooms,
      streams: API.streams,
      users: API.users
   });
})
app.get('/pub', function(req, res){
   var streamID = req.query.pub_id;
   var roomID = req.query.room_id;

   var userName = API.streams[streamID]["userName"];
   res.render('subscribers', {
      view: "subscribers",
      roomID: roomID,
      streamID: streamID,
      userName: userName,
      rooms: API.rooms, 
      streams: API.streams,
      users: API.users
});

})
app.get('/subs', function(req, res){
   res.render('subscribers', {view: "subscribers"});
})
//


app.get('/graphs', function(req, res) {


   res.render('graphs', {
      roomsInfo: API.roomsInfo,
      userStream: API.userStream,
      statusId: API.statusId,
      userName: API.userName,
      rooms: API.rooms,
      streamRoom: API.streamRoom,
   });
});

app.get('/text', function(req, res) {


   res.render('text', {
      view: "index",
      publishers: API.publishers,
      roomsInfo: API.roomsInfo,
      userStream: API.userStream,
      statusId: API.statusId,
      userName: API.userName,
      rooms: API.rooms,
      streamRoom: API.streamRoom,
   });
});


app.get('/search', function(req, res) {


   res.render('search', {
      eventos: "",
      initDate: null,
      finalDate: null,
      useDB: config.ackuaria.useDB
   });
});

app.post('/search', function(req, res) {

   // ARREGLAR
   var date1 = req.body.initTimestamp;
   var initDate = date1.split("-");
   var day1 = parseInt(initDate[0]);
   var month1 = initDate[1] - 1;
   var year1 = initDate[2];
   var dateInit = new Date(year1, month1, day1);
   var timestampInit = dateInit.getTime();

   var date2 = req.body.finalTimestamp;
   var finalDate = date2.split("-");
   var day2 = parseInt(finalDate[0]);
   var month2 = finalDate[1] - 1;
   var year2 = finalDate[2];
   var dateFinal = new Date(year2, month2, day2);
   var timestampFinal = dateFinal.getTime();


   var eventType = req.body.eventType;
   if (eventType == "all") {
      eventsRegistry.getEventsByDate(timestampInit, timestampFinal, function(events) {
         console.log(events);
         res.render('search', {
            eventos: JSON.stringify(events),
            initDate: dateInit,
            finalDate: dateFinal,
            useDB: config.ackuaria.useDB
         });

      })

   } else {


   eventsRegistry.getEventsByDateAndType(timestampInit, timestampFinal, eventType, function(events) {
      console.log(events);
      res.render('search', {
         eventos: JSON.stringify(events),
         initDate: dateInit,
         finalDate: dateFinal,
         useDB: config.ackuaria.useDB
      });

   })
}

});

app.get('/info', function(req, res) {
   if (GLOBAL.config.ackuaria.useDB) {

      roomsRegistry.getPublishers(function(publishers) {
         roomsRegistry.getTotalRooms(function(total) {
            if (publishers && total) {
               res.render('total', {
                  nRooms: total,
                  nPubs: publishers.length
               });

            }
         })

      })
   } else {

      res.render('total', {
         nRooms: API.nRoomsTotal,
         nPubs: API.nPubsTotal
      })
   }

});
