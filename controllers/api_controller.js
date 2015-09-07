var API = require('./../common/api');
var N = require('./../nuve');
var db = require('./../common/mdb/dataBase').db;
var sessionsRegistry = require('./../common/mdb/sessionsRegistry');
var eventsRegistry = require('./../common/mdb/eventsRegistry');

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var formatDate = function(date) {
   var day =  date.substring(0,2);
   var month = parseInt(date.substring(2,4)) - 1;
   var year = date.substring(4,8);
   var hours = date.substring(8,10);
   var mins = date.substring(10,12);
   var newDate = new Date(year, month, day, hours, mins);
   return newDate.getTime();
}


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

//Show total number of sessions, minutes published, streams and rooms used
exports.info = function(req, res) {
   var info = {};
   var initURL = req.query.init;
   var finalURL = req.query.final;
   var initDate, finalDate;

   if (initURL) initDate = formatDate(initURL);
   if (finalURL) finalDate = formatDate(finalURL);
   
   sessionsRegistry.getSessions(function(sessions){
      
      var nSessions = 0;
      var rooms = {};
      var users = {};
      var timePublished = 0;

      for (var s in sessions) {
         var roomID = sessions[s].roomID;
         var initSession = parseInt(sessions[s].initTimestamp);
         var finalSession = parseInt(sessions[s].finalTimestamp);

         if (initSession > finalDate || finalSession < initDate) continue;

         nSessions++;

         if (!rooms[roomID]) rooms[roomID] = 0;

         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            if (!users[stream.userID]) users[stream.userID] = 0;

            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);

            if (initPublish && finalPublish) {
               if (initPublish > finalDate || finalPublish < initDate) continue;
               var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
               rooms[roomID] += streamTime;
               users[stream.userID] += streamTime;
               timePublished += streamTime;
            }
         }
      }

      info.nSessions = nSessions;
      info.nRooms = Object.size(rooms);
      info.nUsers = Object.size(users);
      info.timePublished = timePublished;
      info.info = "Time is represented in seconds";
      if (initDate) info.initDate = new Date(initDate);
      else info.initDate = "Not specified Date";
      if (finalDate) info.finalDate = new Date(finalDate);
      else info.finalDate = new Date();
      res.send(info);
   }) 
};

//Show total number of sessions, minutes published, streams and detailed room info
exports.info_plus = function(req, res) {
   var info = {};
   var initURL = req.query.init;
   var finalURL = req.query.final;
   var initDate, finalDate;

   if (initURL) initDate = formatDate(initURL);
   if (finalURL) finalDate = formatDate(finalURL);
   
   sessionsRegistry.getSessions(function(sessions){
      
      var nSessions = 0;
      var rooms = {};
      var users = {};
      var usersByRoom = {};
      var timePublished = 0;

      for (var s in sessions) {
         var roomID = sessions[s].roomID;
         var initSession = parseInt(sessions[s].initTimestamp);
         var finalSession = parseInt(sessions[s].finalTimestamp);

         if (initSession > finalDate || finalSession < initDate) continue;

         nSessions++;

         if (!rooms[roomID]) rooms[roomID] = {nSessions: 1, nUsers: 0, timePublished: 0};
         else rooms[roomID].nSessions++;

         if (!usersByRoom[roomID]) usersByRoom[roomID] = [];

         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            if (!users[stream.userID]) users[stream.userID] = 0;
            if (usersByRoom[roomID].indexOf(stream.userID) < 0) {
               usersByRoom[roomID].push(stream.userID);
               rooms[roomID].nUsers++;
            }

            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);

            if (initPublish && finalPublish) {
               if (initPublish > finalDate || finalPublish < initDate) continue;
               var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
               rooms[roomID].timePublished += streamTime;
               users[stream.userID] += streamTime;
               timePublished += streamTime;
            }
         }

      }
      info.nSessions = nSessions;
      info.nRooms = Object.size(rooms);
      info.nUsers = Object.size(users);
      info.timePublished = timePublished;
      info.info = "Time is represented in seconds";
      info.rooms = rooms;
      if (initDate) info.initDate = new Date(initDate);
      else info.initDate = "Not specified Date";
      if (finalDate) info.finalDate = new Date(finalDate);
      else info.finalDate = new Date();
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