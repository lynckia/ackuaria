var API = require('./../common/api');
var N = require('./../nuve');
var db = require('./../common/mdb/dataBase').db;
var sessionsRegistry = require('./../common/mdb/sessionsRegistry');
var eventsRegistry = require('./../common/mdb/eventsRegistry');

exports.sessions = function(req, res) {
   sessionsRegistry.getSessions(function(sessions){
      res.send(sessions);
   })
};

exports.sessionsOfRoom = function(req, res) {
   var roomID = req.params.roomID;
   sessionsRegistry.getSessionsOfRoom(roomID, function(sessions){
      res.send(sessions);
   })
};

exports.sessionsOfUser = function(req, res) {
   var userID = req.params.userID;
   sessionsRegistry.getSessionsOfUser(userID, function(sessions){
      res.send(sessions);
   })
};

exports.sessionsOfStream = function(req, res) {
   var streamID = req.params.streamID;
   sessionsRegistry.getSessionsOfUser(streamID, function(sessions){
      res.send(sessions);
   })
};

exports.events = function(req, res) {
   eventsRegistry.getEvents(function(events){
      res.send(events);
   })
};

exports.eventsOfRoom = function(req, res) {
   var roomID = req.params.roomID;
   eventsRegistry.getEventsOfRoom(roomID, function(events){
      res.send(events);
   })
};

exports.eventsOfUser = function(req, res) {
   var userID = req.params.userID;
   eventsRegistry.getEventsOfUser(userID, function(events){
      res.send(events);
   })
};

exports.eventsOfType = function(req, res) {
   var type = req.params.type;
   eventsRegistry.getEventsOfType(type, function(events){
      res.send(events);
   })
};

exports.info = function(req, res) {
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
            var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));

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
};

exports.infoOfRoom = function(req, res) {
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
            var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
            streams.push({streamID: stream.streamID, timePublished: streamTime, userID: stream.userID});
            timePublished += streamTime;
         }
      }
      info.roomID = roomID;
      info.timePublished = timePublished;
      info.streams = streams;
      res.send(info);
   })
};

exports.infoOfUser = function(req, res) {
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
               var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
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
};