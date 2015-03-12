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

         // log.info('Event: ', theEvent);


         if (config.ackuaria.useDB) {
            // DATABASE
            eventsRegistry.addEvent(theEvent, function(saved, error) {
               if (error) log.warn('MongoDB: Error adding event: ', error);
               if (saved) log.info('MongoDB: Added event: ', saved);

            });
            switch (theEvent.type) {

               case "publish":
                  roomsRegistry.hasRoomByRoomId(theEvent.room, function(roomExists) {

                     // Memoria local para datos
                     var stream = theEvent.stream;
                     var room = theEvent.room;
                     var user = theEvent.user;
                     var name = theEvent.name;

                     if (API.roomsInfo[room] === undefined) {
                        API.roomsInfo[room] = {};
                        API.roomsInfo[room][stream] = [];
                     } else {
                        if (API.roomsInfo[room][stream] === undefined) {
                           API.roomsInfo[room][stream] = [];
                        }

                     }

                     API.userStream[stream] = user;
                     API.userName[user] = name;


                     if (API.rooms.indexOf(theEvent.room) == "-1") {
                        API.rooms.push(theEvent.room);

                     }

                     API.streamRoom[stream] = room;
                     // Fin memoria local para datos

                     if (!roomExists) {
                        var date = new Date()
                        var timestamp = date.getTime();
                        var sessionId = theEvent.room + "_" + "1";
                        var room = {
                           roomId: theEvent.room,
                           nPubs: 1,
                           nSession: 1,
                           publishers: [theEvent.stream]
                        };
                        var session = {
                           sessionId: sessionId,
                           room: theEvent.room,
                           nSession: 1,
                           initTimestamp: timestamp,
                           // finalTimestamp: 0,
                           publishers: [theEvent.stream]
                        };

                        roomsRegistry.addRoom(room, function(saved, error) {
                           if (error) log.warn('MongoDB: Error adding room: ', error);
                           if (saved) {
                              log.info('MongoDB: Added room: ', saved);
                              sessionsRegistry.addSession(session, function(saved, error) {
                                 if (error) log.warn('MongoDB: Error adding session ', error);
                                 if (saved) log.info('MongoDB: Added session: ', saved);
                              })
                           }


                        })

                     } else {

                        roomsRegistry.getRoomByRoomId(theEvent.room, function(room) {
                           var sessionId = theEvent.room + "_" + room.nSession;

                           if (room.nPubs < 1) {
                              var date = new Date();
                              var timestamp = date.getTime();
                              sessionsRegistry.initSession(sessionId, timestamp, function(result) {
                                 console.log(result);
                                 sessionsRegistry.updateSession(sessionId, theEvent.stream, function(result) {
                                    console.log(result);
                                 })
                                 roomsRegistry.updateRoomPublish(theEvent.room, theEvent.stream, function(result) {
                                    console.log(result);
                                 })
                              })
                           } else {

                              sessionsRegistry.updateSession(sessionId, theEvent.stream, function(result) {
                                 console.log(result);

                              })

                              roomsRegistry.updateRoomPublish(theEvent.room, theEvent.stream, function(result) {
                                 console.log(result);
                              })
                           }

                        })


                     }
                  })

                  break;

               case "unpublish":
                  var stream = theEvent.stream;
                  var room = theEvent.room;
                  var user = theEvent.user;

                  // Para liberar espacio en el array de status
                  delete API.userName[user];
                  delete API.streamRoom[stream];
                  delete API.userStream[stream];

                  for (var ro in API.roomsInfo) {
                     for (var st in API.roomsInfo[ro]) {
                        for (var i = 0; i < API.roomsInfo[ro][st].length; i++) {

                           if (API.roomsInfo[ro][st][i] === user) {


                              API.roomsInfo[ro][st].splice(i, 1);


                              var id = user + "_" + st;
                              delete API.statusId[id];
                           }
                        }
                     }
                  }

                  var id = "";
                  id += stream;

                  delete API.statusId[id];


                  for (var j = 0; j < API.roomsInfo[room][stream].length; j++) {
                     var subs = API.roomsInfo[room][stream][j];
                     var id = subs + "_" + stream;
                     delete API.statusId[id];
                  }
                  delete API.roomsInfo[room][stream];


                  if (isEmpty(API.roomsInfo[room])) {
                     var index = API.rooms.indexOf(room);
                     API.rooms.splice(index, 1);
                     delete API.roomsInfo[room];
                  }



                  roomsRegistry.hasRoomByRoomId(theEvent.room, function(roomExists) {

                     if (!roomExists) {
                        console.log("This room doesn't exist anymore");

                     } else {
                        roomsRegistry.updateRoomUnpublish(theEvent.room, theEvent.stream, function(result, initNewSession) {
                           console.log(result);

                           if (initNewSession) {
                              roomsRegistry.getRoomByRoomId(theEvent.room, function(room) {
                                 if (room) {
                                    var nSession = room.nSession;
                                    var sessionIdOld = theEvent.room + "_" + nSession;

                                    nSession++;

                                    var sessionIdNew = theEvent.room + "_" + nSession;
                                    var session = {
                                       sessionId: sessionIdNew,
                                       room: theEvent.room,
                                       nSession: nSession,
                                       // initTimestamp: 0,
                                       // finalTimestamp: 0,
                                       publishers: []
                                    };

                                    sessionsRegistry.addSession(session, function(saved, error) {
                                       if (error) log.warn('MongoDB: Error adding session: ', error);
                                       if (saved) {
                                          log.info('MongoDB: Added session: ', saved);
                                          roomsRegistry.updateRoomSession(theEvent.room, nSession, function(result) {
                                             console.log(result);

                                             var date = new Date();
                                             var timestamp = date.getTime();
                                             sessionsRegistry.finishSession(sessionIdOld, timestamp, function(result) {
                                                console.log(result);
                                             })
                                          })

                                       }
                                    })

                                 }
                              })

                           }
                        })

                     }
                  })

                  break;

               case "subscribe":
                  var stream = theEvent.stream;
                  var user = theEvent.user;
                  var room = theEvent.room;
                  API.roomsInfo[room][stream].push(user);
                  API.userName[user] = theEvent.name;
                  break;

               case "unsubscribe":

                  delete API.statusId[theEvent.user + "_" + theEvent.stream]

                  for (var ro in API.roomsInfo) {


                     for (var i = 0; i < API.roomsInfo[ro][theEvent.stream].length; i++) {

                        if (API.roomsInfo[ro][theEvent.stream][i] == theEvent.user) {

                           API.roomsInfo[ro][theEvent.stream].splice(i, 1);
                        }
                     }
                  }
                  break;

               case "connection_status":


                  var id = "";
                  if (!theEvent.subs) {
                     id += theEvent.pub;
                  } else {
                     id = theEvent.subs + "_" + theEvent.pub;

                  }
                  API.statusId[id] = theEvent.status;


                  break;

               default:
                  break;
            }
         } else {
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

         }

      } catch (err) {
         console.log("Error receiving event:", err);
      }
   },
   stats: function(theStats) {

      //log.info('Stat: ', theStats);

      try {

         API.send_stats_to_clients(theStats);
         if (config.ackuaria.useDB) {

            statsRegistry.addStat(theStats, function(saved, error) {
               if (error) log.warn('MongoDB: Error adding stat: ', error);
               //if (saved) log.info('MongoDB: Added stat: ', saved);

            });
         }

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

API.send_stats_to_clients = function(theStats) {
   for (var s in API.sockets) {
      API.sockets[s].emit('newStats', {
         theStats: theStats
      });
   }
}



var module = module || {};
module.exports = API;