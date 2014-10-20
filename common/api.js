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

API.api = {
   event: function(theEvent, callback) {
      try {

         API.send_event_to_clients(theEvent);
         if (config.ackuaria.useDB) {
            // DATABASE
            eventsRegistry.addEvent(theEvent, function(saved, error) {
               if (error) log.warn('MongoDB: Error adding event: ', error);
               if (saved) log.info('MongoDB: Added event: ', saved);

            });

            if (theEvent.type === "publish") {
               roomsRegistry.hasRoomByRoomId(theEvent.room, function(roomExists) {

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

            } else if (theEvent.type === "unpublish") {
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

            }
         }



      } catch (err) {
         console.log("Error receiving event:", err);
      }
   },
   stats: function(theStats, callback) {
      try {

         API.send_stats_to_clients(theStats);
         if (config.ackuaria.useDB){

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

API.send_event_to_clients = function(theEvent) {


   for (var s in API.sockets) {
      API.sockets[s].emit('newEvent', {
         theEvent: theEvent
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