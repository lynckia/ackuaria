var Getopt = require('node-getopt');
var config = require('./ackuaria_config');
var db = require('./common/mdb/dataBase').db;
var eventsRegistry = require('./common/mdb/eventsRegistry');
var sessionsRegistry = require('./common/mdb/sessionsRegistry');
var ackuariaController = require('./controllers/ackuaria_controller');
var apiController = require('./controllers/api_controller');


GLOBAL.config = config || {};

// Load submodules with updated config
var amqper = require('./common/amqper');

var API = require('./common/api');
var express = require('express');
var ackuaria_router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var partials = require('express-partials');
var N = require('./nuve');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


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

N.API.init(GLOBAL.config.nuve.superserviceID, GLOBAL.config.nuve.superserviceKey, GLOBAL.config.nuve.host);

N.API.getRooms(function(roomList) {
   var rooms = JSON.parse(roomList);
   for (var r in rooms) {
      var room = rooms[r];
      if (!API.rooms[room._id]) {
         API.rooms[room._id] = {
             "roomName": room.name,
             "streams": [],
             "users": [],
             "failed": []
         };      
      }
   }
})

amqper.connect(function() {
   "use strict";
   amqper.bind_broadcast('event', api.event);
   amqper.bind_broadcast('stats', api.stats);

});

io.on('connection', function(socket) {
   API.sockets.push(socket);
});

app.use('/ackuaria', ackuaria_router);

ackuaria_router.use(express.static(path.join(__dirname, 'public')));

ackuaria_router.get('/', ackuariaController.loadRooms)

ackuaria_router.get('/room', ackuariaController.loadPublishers)

ackuaria_router.get('/pub', ackuariaController.loadSubscribers)

ackuaria_router.get('/sessions', apiController.sessions)

ackuaria_router.get('/sessions/room/:roomID', apiController.sessionsOfRoom)

ackuaria_router.get('/sessions/user/:userID', apiController.sessionsOfUser)

ackuaria_router.get('/sessions/stream/:streamID', apiController.sessionsOfStream)

ackuaria_router.get('/info/general', apiController.info)

ackuaria_router.get('/info/detailed', apiController.info_plus)

ackuaria_router.get('/info/room/:roomID', apiController.infoOfRoom)

ackuaria_router.get('/info/user/:userID', apiController.infoOfUser)

ackuaria_router.get('/events', apiController.events)

ackuaria_router.get('/events/room/:roomID', apiController.eventsOfRoom)

ackuaria_router.get('/events/user/:userID', apiController.eventsOfUser)

ackuaria_router.get('/events/type/:type', apiController.eventsOfType)

ackuaria_router.post('/delete/:roomID', function(req, res) {
  var roomID = req.params.roomID;
  API.rooms[roomID].failed = [];
  res.send(API.rooms[roomID]);
})