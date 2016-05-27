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
var io = require('socket.io')(http, {path: "/ackuaria/socket.io/"});
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
   API.lastUpdated = new Date().getTime();
   var rooms = JSON.parse(roomList);
   for (var r in rooms) {
      var room = rooms[r];
      if (!API.rooms[room._id]) {
         API.rooms[room._id] = {
             roomName: room.name,
             data: room.data,
             streams: [],
             users: [],
             failed: []
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

app.get('/', function(req, res) {
  res.redirect('/ackuaria');
})

ackuaria_router.use(express.static(path.join(__dirname, 'public')));

ackuaria_router.get('/', ackuariaController.updateRooms, ackuariaController.loadRooms)

ackuaria_router.get('/room', ackuariaController.updateRooms, ackuariaController.loadPublishers)

ackuaria_router.get('/pub', ackuariaController.updateRooms, ackuariaController.loadSubscribers)

ackuaria_router.get('/history', ackuariaController.updateRooms, ackuariaController.loadHistory)

ackuaria_router.get('/sessions', ackuariaController.updateRooms, apiController.sessions)

ackuaria_router.get('/sessions/room/:roomID', ackuariaController.updateRooms, apiController.sessionsOfRoom)

ackuaria_router.get('/sessions/user/:userID', ackuariaController.updateRooms, apiController.sessionsOfUser)

ackuaria_router.get('/sessions/stream/:streamID', ackuariaController.updateRooms, apiController.sessionsOfStream)

ackuaria_router.get('/info/rooms', ackuariaController.updateRooms, apiController.info_rooms)

ackuaria_router.get('/info/rooms/:roomID', ackuariaController.updateRooms, apiController.info_room)

ackuaria_router.get('/info/user/:userID', ackuariaController.updateRooms, apiController.info_user)

ackuaria_router.get('/events', ackuariaController.updateRooms, apiController.events)

ackuaria_router.get('/events/room/:roomID', ackuariaController.updateRooms, apiController.eventsOfRoom)

ackuaria_router.get('/events/user/:userID', ackuariaController.updateRooms, apiController.eventsOfUser)

ackuaria_router.get('/events/type/:type', ackuariaController.updateRooms, apiController.eventsOfType)

ackuaria_router.post('/delete/:roomID', function(req, res) {
  var roomID = req.params.roomID;
  API.rooms[roomID].failed = [];
  res.send(API.rooms[roomID]);
})
