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
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

http.listen(8888, function() {
   console.log('listening on *:8888');
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


   res.render('index', {
      roomInfo: API.roomInfo,
      userStream: API.userStream,
      statusId: API.statusId,
      userName: API.userName,
      rooms: API.rooms,
      streamRoom: API.streamRoom
   });
});


/*app.get('/info', function(req, res) {
      
      console.log(req.params.id);

   res.render('info');
});
*/
app.get('/info/total', function(req, res) {

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
});