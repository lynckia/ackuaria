var API = {};
var logger = require('./logger').logger;
var config = require('./../ackuaria_config');
var log = logger.getLogger("Ackuaria");
var db = require('./mdb/dataBase').db;
var eventsRegistry = require('./mdb/eventsRegistry');
var statsRegistry = require('./mdb/statsRegistry');
var roomsRegistry = require('./mdb/roomsRegistry');
var sessionsRegistry = require('./mdb/sessionsRegistry');

API.sockets = [];
API.roomsInfo = {};
API.userStream = {};
API.statusId = {};
API.userName = {};
//API.rooms = [];
API.streamRoom = {};
API.roomUsers = {};
API.nRoomsTotal = 0;
API.nPubsTotal = 0;

API.rooms = {};
API.streams = {};
API.users = {};
API.status = {};


API.streams_ssrc = {};

function isEmpty(obj) {
   for (var key in obj) {
      if (obj.hasOwnProperty(key))
         return false;
   }
   return true;
}

API.api = {
   event: function(theEvent) {
      try {

            switch (theEvent.type) {

               case "publish":


                  // Memoria local para datos
                  var event = {};
                  var streamID = theEvent.stream;
                  var roomID = theEvent.room;
                  var userID = theEvent.user;
                  var userName = theEvent.name;

                  event.streamID = streamID;
                  event.roomID = roomID;
                  event.userID = userID;
                  event.userName = userName;
                  console.log(event);
                  console.log(theEvent);

                  if (API.rooms[roomID] === undefined) {
                     API.rooms[roomID] = {"roomName": "NombreTest", "nStreams": 1, "streams": [streamID], "users":[userID]};
                  } else {
                     API.rooms[roomID]["nStreams"]++;
                     API.rooms[roomID]["streams"].push(streamID);
                  }

                  if (API.users[userID] === undefined){
                     API.users[userID] = {"userName": userName, "roomID": roomID, "streams": [streamID], "subscribedTo": []};
                  } else {
                     API.users[userID]["streams"].push(streamID);
                  }

                  API.streams[streamID] = {"userID": userID, "roomID": roomID, "userName": userName, "subscribers": [] };
                  // Fin memoria local para datos

                  API.send_event_to_clients(event, API.rooms, API.streams, API.users);

                  break;

               case "unpublish":
                  var event = {};
                  var streamID = theEvent.stream;
                  var roomID = theEvent.room;
                  var userID = theEvent.user;

                  event.streamID = streamID;
                  event.roomID = roomID;
                  event.userID = userID;

                  var indexRoom = API.rooms[roomID]["streams"].indexOf(streamID);
                  if (indexRoom > -1) API.rooms[roomID]["streams"].splice(indexRoom, 1);
                  API.rooms[roomID]["nStreams"]--;
                  API.rooms[roomID]["nStreams"];
                  if (API.rooms[roomID]["nStreams"] == 0) {
                     delete API.rooms[roomID];
                  }

                  var indexUser = API.users[userID]["streams"].indexOf(streamID);
                  if (indexUser > -1) API.users[userID]["streams"].splice(indexUser, 1);
                  if (API.users[userID]["nStreams"] == 0 && API.users[userID]["subscribedTo"].length == 0){
                     delete API.users[userID];
                  }

                  var subscribers = API.streams[streamID]["subscribers"];
                  for (var s in subscribers) {
                     if (API.users[subscribers[s]]) {
                        var indexSub = API.users[subscribers[s]]["subscribedTo"].indexOf(streamID);
                        if (indexSub > -1) API.users[subscribers[s]]["subscribedTo"].splice(indexSub, 1);
                     }
                  }

                  for (var stream in API.streams){
                     var indexStream = API.streams[stream]["subscribers"].indexOf(userID);
                     if (indexStream > -1) API.streams[stream]["subscribers"].splice(indexStream, 1);
                  }

                  delete API.streams[streamID];

                  //Falta statusID
                  API.send_event_to_clients(event, API.rooms, API.streams, API.users);

                  break;

               case "subscribe":
                  var event = {};
                  var streamID = theEvent.stream;
                  var userID = theEvent.user;
                  var roomID = theEvent.room;
                  var userName = theEvent.name;

                  event.streamID = streamID;
                  event.roomID = roomID;
                  event.userID = userID;
                  event.userName = userName;

                  API.streams[streamID]["subscribers"].push(userID);

                  if (API.users[userID] === undefined) {
                     API.users[userID] = {"userName": userName, "roomID": roomID, "streams": [], "subscribedTo": [streamID]}
                  } else {
                     API.users[userID]["subscribedTo"].push(streamID);
                  }
                  API.send_event_to_clients(event, API.rooms, API.streams, API.users);


                  break;

               case "unsubscribe":
                  var event = {};
                  var streamID = theEvent.stream;
                  var userID = theEvent.user;
                  var roomID = theEvent.room;

                  event.streamID = streamID;
                  event.roomID = roomID;
                  event.userID = userID;

                  var indexStream = API.streams[streamID]["subscribers"].indexOf(userID);
                  if (indexSub > -1) API.streams[streamID]["subscribers"].splice(indexSub, 1);

                  var indexUser = API.users[userID]["subscribedTo"].indexOf(streamID);
                  if (indexUser > -1) API.users[userID]["subscribedTo"].splice(indexUser, 1);
                  if (API.users[userID][nStreams] && API.users[userID]["subscribedTo"].length == 0){
                     delete API.users[userID];
                  }
                  API.send_event_to_clients(event, API.rooms, API.streams, API.users);

                  break;

               case "connection_status":
                  var event = {};
                  var streamID = theEvent.pub;
                  var userID = theEvent.subs;
                  var status = theEvent.status;

                  event.streamID = streamID;
                  event.userID = userID;
                  event.status = status;
                  var id = "";
                  if (!userID) {
                     id += streamID;
                  } else {
                     id = userID + "_" + streamID;
                  }

                  API.status[id] = status;
//                  API.send_event_to_clients(event, API.rooms, API.streams, API.users);

                  break;

               default:
                  break;
            }

         //}

      } catch (err) {
         console.log("Error receiving event:", err);
      }
   },
   stats: function(theStats) {

      log.info('Stat: ', theStats);

      try {

         API.send_stats_to_clients(theStats);

      } catch (err) {
         log.error("Error receiving stat", err);
      }
   }
};

API.send_event_to_clients = function(event, rooms, streams, users) {
   for (var s in API.sockets) {
      API.sockets[s].emit('newEvent', {
         event: event,
         rooms: rooms,
         streams: streams,
         users: users
      });
   }
}

API.send_stats_to_clients = function(event) {

    if (!event.subs){
        var pubID = String(event.pub);
        var stats = event.stats;
        var video, audio;
        if (stats.length > 0) {
            if (stats[0].type == "video") {
                video = stats[0];
                audio = stats[1];
            } else {
                video = stats[1];
                audio = stats[0];
            }
            if (API.streams_ssrc[pubID] == undefined) API.streams_ssrc[pubID] = {"audio": audio.ssrc, "video": video.ssrc};
        }

        for (var s in API.sockets) {
            API.sockets[s].emit('newSR', {
                event: event,
                audio: audio,
                video: video,
                stream_ssrc: API.streams_ssrc[pubID]
            });
        }
    } else {
        var pubID = String(event.pub);
        var subID = event.subs;
        var stats = event.stats;
        var video, audio;
        if (stats.length > 0) {
            if (stats[0]["PLI"]) {
                video = stats[0];
                audio = stats[1];
            } else {
                video = stats[1];
                audio = stats[0];
            }
        }
        for (var s in API.sockets) {
            API.sockets[s].emit('newRR', {
                event: event,
                audio: audio,
                video: video
            });
        } 
    }


}



var module = module || {};
module.exports = API;