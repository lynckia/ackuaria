var Getopt = require('node-getopt');
var config = require('./ackuaria_config');
var db = require('./common/mdb/dataBase').db;
var eventsRegistry = require('./common/mdb/eventsRegistry');
var statsRegistry = require('./common/mdb/statsRegistry');
var roomsRegistry = require('./common/mdb/roomsRegistry');
var sessionsRegistry = require('./common/mdb/sessionsRegistry');

GLOBAL.config = config || {};

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
var N = require('./nuve');

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

N.API.init(GLOBAL.config.nuve.superserviceID, GLOBAL.config.nuve.superserviceKey, 'http://localhost:3000/');

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

app.get('/', function(req, res) {
   API.currentRoom = "";

   N.API.getRooms(function(roomList) {
      var rooms = JSON.parse(roomList);
      var test_rooms = {};
      for (var i in rooms) {
         var room = rooms[i];
         if (!API.rooms[room._id]) {
            test_rooms[room._id] = {
                "roomName": room.name,
                "streams": [],
                "users": [],
                "failed": []
            };
         } else {
            test_rooms[room._id] = API.rooms[room._id];
         }
      }

      API.rooms = test_rooms;
      res.render('rooms', {
         view:"rooms",
         rooms: API.rooms
      });
   })


});

app.get('/room', function(req, res){
   var roomID = req.query.room_id;
   API.currentRoom = roomID;
   if (API.rooms[roomID]) var roomName = API.rooms[roomID]["roomName"];
   else var roomName = "Not found";
   res.render('publishers', {
      view:"publishers",
      roomID: roomID,
      roomName: roomName,
      rooms: API.rooms,
      streams: API.streams,
      users: API.users,
      states: API.states
   });
})
app.get('/pub', function(req, res){
   var streamID = req.query.pub_id;
   var roomID = req.query.room_id;
   API.currentRoom = roomID;
   if (API.streams[streamID])  var userName = API.streams[streamID]["userName"];
   else var userName = "Publisher not found";

   if (API.rooms[roomID]) var roomName = API.rooms[roomID]["roomName"];
   else var roomName = "Not found";

   res.render('subscribers', {
      view: "subscribers",
      roomID: roomID,
      roomName: roomName,
      streamID: streamID,
      userName: userName,
      rooms: API.rooms, 
      streams: API.streams,
      users: API.users,
      states: API.states
   });
})

app.get('/sessions', function(req, res) {
   sessionsRegistry.getSessions(function(sessions){
      res.send(sessions);
   })
})

app.get('/sessions/room/:roomID', function(req, res) {
   var roomID = req.params.roomID;
   sessionsRegistry.getSessionsOfRoom(roomID, function(sessions){
      res.send(sessions);
   })
})

app.get('/sessions/user/:userID', function(req, res) {
   var userID = req.params.userID;
   sessionsRegistry.getSessionsOfUser(userID, function(sessions){
      res.send(sessions);
   })
})

app.get('/sessions/stream/:streamID', function(req, res) {
   var streamID = req.params.streamID;
   sessionsRegistry.getSessionsOfUser(streamID, function(sessions){
      res.send(sessions);
   })
})

app.get('/info', function(req, res) {
   var info = {};
   sessionsRegistry.getSessions(function(sessions){
      var nSessions = sessions.length;
      var nRooms = Object.keys(API.rooms).length;
      var nUsers = Object.keys(API.users).length;
      var nStreams = Object.keys(API.streams).length;

      var rooms = {};
      var users = {};

      var timePublished = 0;
      for (var s in sessions) {
         var roomID = sessions[s].roomID;
         if (!rooms[roomID]) rooms[roomID] = 0;

         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            if (!users[stream.userID]) users[stream.userID] = 0;

            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);
            var streamTime = ((finalPublish - initPublish) / 1000);

            rooms[roomID] += streamTime;
            users[stream.userID] += streamTime;
            timePublished += streamTime;
         }
      }
      info.nStreams = nStreams;
      info.nUsers = nUsers;
      info.nRooms = nRooms;
      info.nSessions = nSessions;
      info.rooms = rooms;
      info.users = users;
      info.timePublished = timePublished;
      info.info = "Time is represented in seconds";
      res.send(info);
   })
})

app.get('/info/room/:roomID', function(req, res) {
   var roomID = req.params.roomID;
   var info = {};  
   var streams = [];

   sessionsRegistry.getSessionsOfRoom(roomID, function(sessions){
      var nSessions = sessions.length;
      var timePublished = 0;
      for (var s in sessions) {
         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);
            var streamTime = ((finalPublish - initPublish) / 1000);
            streams.push({streamID: stream.streamID, timePublished: streamTime, userID: stream.userID});
            timePublished += streamTime;
         }
      }
      info.roomID = roomID;
      info.timePublished = timePublished;
      info.streams = streams;
      res.send(info);
   })
})

app.get('/info/user/:userID', function(req, res) {
   var userID = req.params.userID;
   var streams = [];
   var info = {};
   sessionsRegistry.getSessionsOfUser(userID, function(sessions){
      var nSessions = sessions.length;
      var timePublished = 0;
      for (var s in sessions) {
         for (var i in sessions[s].streams){
            var st = sessions[s].streams[i];
            if (st.userID == userID) {
               var initPublish = parseInt(st.initPublish);
               var finalPublish = parseInt(st.finalPublish);
               var streamTime = ((finalPublish - initPublish) / 1000);
               var stream = {streamID: st.streamID, timePublished: streamTime};
               streams.push(stream);
               timePublished += streamTime;
            }
         }
      }
      info.userID = userID;
      info.streams = streams;
      info.timePublished = timePublished;
      res.send(info);
   })
})

/*
app.get("/resetSessions", function(req, res){
   sessionsRegistry.removeAllSessions();
   res.redirect('/getSessions');
});
*/
