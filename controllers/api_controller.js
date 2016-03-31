var API = require('./../common/api');
var N = require('./../nuve');
var db = require('./../common/mdb/dataBase').db;
var sessionsRegistry = require('./../common/mdb/sessionsRegistry');
var eventsRegistry = require('./../common/mdb/eventsRegistry');
var roomsRegistry = require('./../common/mdb/roomsRegistry');


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var checkQueries = function(roomData, queries) {
   for (q in queries) {
      if (!roomData || !roomData[q] || roomData[q].toString() != queries[q]) {
         return false;
      }
   }

   return true;
}

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
exports.info_rooms = function(req, res) {
   var initURL = req.query.init;
   var finalURL = req.query.final;
   var initDate, finalDate;

   if (initURL) initDate = formatDate(initURL);
   if (finalURL) finalDate = formatDate(finalURL);

   var queries = {};
   for (var q in req.query) {
      var query_name = q;
      var query_value = req.query[q];
      if (query_name != "init" && query_name != "final") {
         queries[query_name] = query_value;
      }
   }
   console.log("Queries:", queries);
   get_room_list(queries, initDate, finalDate, function(info) {
      res.send(info);
   });
};

var get_room_list = exports.get_room_list = function(queries, initDate, finalDate, callback) {
   var info = {};
   sessionsRegistry.getSessions(function(sessions){
      var nSessions = 0;
      var rooms = {};
      var users = {};
      var timePublished = 0;
      var room_list = {};

      for (var s in sessions) {

         var roomID = sessions[s].roomID;
         var initSession = parseInt(sessions[s].initTimestamp);
         var finalSession = parseInt(sessions[s].finalTimestamp);

         if (initSession > finalDate || finalSession < initDate) continue;

         if (!checkQueries(sessions[s].roomData, queries)) continue;

         if (!room_list[roomID]) {
            room_list[roomID] = {};
            room_list[roomID].n_sessions = 0;
            room_list[roomID].time_published = 0;
            room_list[roomID].n_users = 0;
         }

         // we use the metadata of the last session done in the room
         room_list[roomID].data = sessions[s].roomData;
         room_list[roomID].n_sessions++;

         nSessions++;

         if (!rooms[roomID]) rooms[roomID] = 0;

         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            if (!users[stream.userID]) {
               users[stream.userID] = 0;
               room_list[roomID].n_users++;
            }

            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);

            if (initPublish && finalPublish) {
               if (initPublish > finalDate || finalPublish < initDate) continue;
               var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
               rooms[roomID] += streamTime;
               users[stream.userID] += streamTime;
               timePublished += streamTime;
               room_list[roomID].time_published += streamTime;
            }
         }
      }

      info.n_sessions = nSessions;
      info.n_rooms = Object.size(rooms);
      info.room_list = room_list;
      info.n_users = Object.size(users);
      info.time_published = timePublished;
      info.query = queries;

      if (initDate) info.initDate = new Date(initDate);
      else info.init_date = "Not specified Date";

      if (finalDate) info.finalDate = new Date(finalDate);
      else info.final_date = new Date();

      callback(info);
   })
}


exports.info_room = function(req, res) {
   var roomID = req.params.roomID;
   var info = {};  
   var users = {};
   var room_list = {};

   var streams = [];

   // Query by date variables
   var initURL = req.query.init;
   var finalURL = req.query.final;
   var initDate, finalDate;
   if (initURL) initDate = formatDate(initURL);
   if (finalURL) finalDate = formatDate(finalURL);
   
   sessionsRegistry.getSessionsOfRoom(roomID, function(sessions){
      var nSessions = 0;
      var timePublished = 0;
      var nRooms = 0;
      var room_data;
      var room_id = undefined;

      for (var s in sessions) {
         var initSession = parseInt(sessions[s].initTimestamp);
         var finalSession = parseInt(sessions[s].finalTimestamp);
         room_data = sessions[s].roomData;
         // Checking the query by date. If it doesn't fit, we jump to the next session
         if (initSession > finalDate || finalSession < initDate) continue;

         // Once checked the query, we add the session and start adding times
         nSessions++;
         for (var st in sessions[s].streams){
            var stream = sessions[s].streams[st];
            var initPublish = parseInt(stream.initPublish);
            var finalPublish = parseInt(stream.finalPublish);

            if (initPublish && finalPublish) {
               // If the stream has started after the final date or it has ended before the initial date, we jump to the next stream
               if (initPublish > finalDate || finalPublish < initDate) continue;
               var streamTime = parseInt(((finalPublish - initPublish) / 1000).toFixed(0));
               users[stream.userID] += streamTime;
               //streams.push({streamID: stream.streamID, timePublished: streamTime, userID: stream.userID});
               timePublished += streamTime;

               // We confirm that the room ID actually corresponds to a real Room;
               room_id = roomID;
               nRooms = 1;
            }
         }
      }

      var room_list = {};
      if (room_id) {
         room_list[roomID] = {time_published: timePublished, n_users: Object.size(users), n_sessions: nSessions, room_data: room_data };
      }
      info.n_sessions = nSessions;
      info.n_rooms = nRooms;
      info.room_list = room_list;
      info.n_users = Object.size(users);
      info.time_published = timePublished;
      info.query = {};

      if (initDate) info.init_date = new Date(initDate);
      else info.init_date = "Not specified Date";

      if (finalDate) info.final_date = new Date(finalDate);
      else info.final_date = new Date();
      //info.streams = streams;
      res.send(info);
   })
};

exports.info_user = function(req, res) {
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
