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
var bodyParser = require('body-parser');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var partials = require('express-partials');
var N = require('./nuve');

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
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

app.use(cookieParser('bla bla bla'));
app.use(session());

app.use(function(req, res, next){
    if (req.session && req.session.user && (new Date()).getTime() < req.session.user.expires) {
        next();
    } else {
        res.redirect('/login');
    }
});

app.get('/ackuaria', ackuariaController.loadRooms)

app.get('/ackuaria/room', ackuariaController.loadPublishers)

app.get('/ackuaria/pub', ackuariaController.loadSubscribers)

app.get('/ackuaria/sessions', apiController.sessions)

app.get('/ackuaria/sessions/room/:roomID', apiController.sessionsOfRoom)

app.get('/ackuaria/sessions/user/:userID', apiController.sessionsOfUser)

app.get('/ackuaria/sessions/stream/:streamID', apiController.sessionsOfStream)

app.get('/ackuaria/info', apiController.info)

app.get('/ackuaria/info/room/:roomID', apiController.infoOfRoom)

app.get('/ackuaria/info/user/:userID', apiController.infoOfUser)

app.get('/ackuaria/events', apiController.events)

app.get('/ackuaria/events/room/:roomID', apiController.eventsOfRoom)

app.get('/ackuaria/events/user/:userID', apiController.eventsOfUser)

app.get('/ackuaria/events/type/:type', apiController.eventsOfType)

app.post('/ackuaria/delete/:roomID', function(req, res) {
  var roomID = req.params.roomID;
  API.rooms[roomID].failed = [];
  res.send(API.rooms[roomID]);
})