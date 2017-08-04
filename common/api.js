
var API = {};
var logger = require('./logger').logger;
var config = require('./../ackuaria_config');
var log = logger.getLogger("Ackuaria");
var db = require('./mdb/dataBase').db;
var eventsRegistry = require('./mdb/eventsRegistry');
var statsRegistry = require('./mdb/statsRegistry');
var sessionsRegistry = require('./mdb/sessionsRegistry');
var roomsRegistry = require('./mdb/roomsRegistry');
var amqper = require('./../common/amqper');
var N = require('./../nuve');

GLOBAL.config = config || {};



API.rooms = {};
API.streams = {};
API.users = {};
API.states = {};
API.sessions_active = {};
API.lastUpdated;
// key: socketId, value: socket
API.sockets = new Map();
// key: streamId, value: {socketIds: Map(socketId : true), interval: fn }
const statsSubscriptions = new Map();

const isEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
    return false;
  }
  return true;
};

const search = (id, myArray) => {
  for (var i=0; i < myArray.length; i++) {
    if (myArray[i].streamID === id) {
      return myArray[i];
    }
  }
};

const sendStatsToClients = (event) => {
    event.timestamp = (new Date()).getTime();
    statsSubscriptions.forEach((subscription, streamID) => {
      subscription.socketIds.forEach((value, socketId) => {
        let subscribedSocket = API.sockets.get(socketId)
        if (subscribedSocket) {
          subscribedSocket.emit('newStats', {
            event: event,
          });
        }
      });
    });
};

const subscribeToLicodeStatsStream = (streamId, duration, interval) => {
  log.debug(`Subscribing to licode stat stream id ${streamId} for ${duration}s with interval ${interval}s`);
  return new Promise((resolve, reject) => {
    amqper.broadcast('ErizoJS', {method: 'subscribeToStats', args: [streamId, duration, interval]},
    (response) => {
        resolve(response);
    })
  });
};

const subscribeClientToStats = (socketId, streamId) => {
  removeSubscriptionsforSocket(socketId);
  if (statsSubscriptions.has(streamId)){
    log.debug('Adding socket', socketId, ' to subscription')
    statsSubscriptions.get(streamId).socketIds[socketId] = true;
  } else {
    log.debug('Adding new subscription to ' + streamId + ' form ' + socketId);
    const subscribeToThisStream = () => {
      log.debug('Renewing subscription to ' +  streamId);
      subscribeToLicodeStatsStream(streamId,config.stats.subscriptionDuration, config.stats.subscriptionInterva).then((result) => {
        log.debug(`Stats subscription to ${streamId}, result: ${result}`);
      });
    };
    subscribeToThisStream();
    const subscription = {
      socketIds : new Map(),
      interval : setInterval(()=> {
        subscribeToThisStream();
      }, (config.stats.subscriptionDuration - 2) * 1000) // a little margin for renewal
    };
    subscription.socketIds.set(socketId, true);
    statsSubscriptions.set(streamId, subscription);
  }
};

const removeSubscriptionsforSocket = (socketId) => {
  log.debug('Removing subscriptions for ' + socketId);
  statsSubscriptions.forEach((subscription, streamId) => {
    log.debug('Subscription ', streamId, ' has', subscription.socketIds.size, 'listening');
    subscription.socketIds.delete(socketId);
    if (subscription.socketIds.size === 0 ){
      clearInterval(subscription.interval);
      subscribeToLicodeStatsStream(streamId, 0, 0).then((result)=>{
        log.debug(`Removed subscription to ${streamId}: result ${result}`);
        statsSubscriptions.delete(streamId);
      });
    }
  });
};

const removeConnection = (socketId) => {
  log.debug('Removing socketId ' + socketId);
  removeSubscriptionsforSocket(socketId);
  API.sockets.delete(socketId);
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const sendEventToClients = function(event, rooms, streams, users, states) {
  API.sockets.forEach((currentSocket, currentSocketId) => {
    var clientCurrentRoom = getParameterByName('room_id', currentSocket.handshake.headers.referer);   
    if (clientCurrentRoom == event.roomID || clientCurrentRoom == '') {
      currentSocket.emit('newEvent', {
        event: event,
        rooms: rooms,
        streams: streams,
        users: users,
        states: states
      });
    }
  });
};

API.api = {};
API.api.event = function(theEvent) {
  try {
    theEvent = theEvent.message;
    log.info("Event:", theEvent);
    var event = {};
    switch (theEvent.type) {

      case "publish":
        var agentID = theEvent.agent;
        var streamID = theEvent.stream;
        var roomID = theEvent.room;
        var userID = theEvent.user;
        var userName = theEvent.name;
        var initTimestamp = theEvent.timestamp;

        event.streamID = streamID;
        event.roomID = roomID;
        event.userID = userID;
        event.userName = userName;


        if (API.rooms[roomID] === undefined) {
          N.API.getRoom(roomID, function(room){
            API.rooms[roomID] = {
              roomName: JSON.parse(room).name,
              data: JSON.parse(room).data,
              streams: [streamID],
              users: [userID],
              failed: []
            };

            var nSession, sessionID, session;
            if (!API.sessions_active[roomID]) nSession = 1;
            else nSession = API.sessions_active[roomID].nSession + 1;
            sessionID = roomID + "_" + nSession;
            var roomData = {};
            roomData._name = API.rooms[roomID].roomName;
            for (var d in API.rooms[roomID].data) {
              roomData[d] = API.rooms[roomID].data[d];
            }

            session = {
              sessionID: sessionID,
              nSession: nSession,
              roomID: roomID,
              roomData: roomData,
              initTimestamp: initTimestamp,
              streams: [{streamID: streamID, userID: userID, initPublish: initTimestamp }],
              failed: []
            }
            API.sessions_active[roomID] = session;
          })

        } else {

          if (API.rooms[roomID].streams.length == 0) {
            var nSession, sessionID, session;
            if (!API.sessions_active[roomID]) nSession = 1;
            else nSession = API.sessions_active[roomID].nSession + 1;
            sessionID = roomID + "_" + nSession;
            var roomData = {};
            roomData._name = API.rooms[roomID].roomName;
            for (var d in API.rooms[roomID].data) {
              roomData[d] = API.rooms[roomID].data[d];
            }
            session = {
              sessionID: sessionID,
              nSession: nSession,
              roomID: roomID,
              roomData: roomData,
              initTimestamp: initTimestamp,
              streams: [{streamID: streamID, userID: userID, initPublish: initTimestamp }],
              failed: []
            }
            API.sessions_active[roomID] = session;

            if (config.ackuaria.useDB) {
              roomsRegistry.hasRoom(roomID, function(hasRoom){
                if (!hasRoom) {
                  roomsRegistry.addRoom({
                    roomID: roomID,
                    roomName: API.rooms[roomID].roomName,
                    data: API.rooms[roomID].data
                  }, function(saved) {
                    log.info('MongoDB: Added room: ', saved);
                  })
                }
              });
            }

          } else {
            var session = API.sessions_active[roomID];
            var stream = {
              streamID: streamID,
              userID: userID,
              initPublish: initTimestamp
            }
            session.streams.push(stream);
            API.sessions_active[roomID] = session;
          }

          API.rooms[roomID].streams.push(streamID);
          if (API.rooms[roomID].users.indexOf(userID) > -1) {
            API.rooms[roomID].users.push(userID);
          }
        }

        if (API.users[userID] === undefined) {
          API.users[userID] = {
            userName: userName,
            roomID: roomID,
            streams: [streamID],
            subscribedTo: []
          };
        } else {
          API.users[userID].streams.push(streamID);
        }

        API.streams[streamID] = {
          agentID: agentID,
          userID: userID,
          roomID: roomID,
          userName: userName,
          subscribers: []
        };
        break;

      case "unpublish":
        var streamID = theEvent.stream;
        var roomID = theEvent.room;
        var userID = theEvent.user;
        var finalTimestamp = theEvent.timestamp;

        event.streamID = streamID;
        event.roomID = roomID;
        event.userID = userID;

        var session = API.sessions_active[roomID];
        if (session !== undefined) {
          var stream = search(streamID, session.streams);
          stream.finalPublish = finalTimestamp;
        }

        if (API.rooms[roomID] !== undefined) {
          var indexRoom = API.rooms[roomID].streams.indexOf(streamID);
          if (indexRoom > -1) API.rooms[roomID].streams.splice(indexRoom, 1);
          if (API.rooms[roomID].streams.length == 0) {
            // If room is empty the session is over
            if (session !== undefined) {
              session.finalTimestamp = finalTimestamp;
              API.sessions_active[roomID] = session;
              if (config.ackuaria.useDB) {
                sessionsRegistry.addSession(session, function(saved, error) {
                  if (error) log.warn('MongoDB: Error adding session ', error);
                  if (saved) log.info('MongoDB: Added session: ', saved);
                })
              }
            }
          }
        }

        if (API.users[userID] !== undefined) {
          var indexUser = API.users[userID].streams.indexOf(streamID);
          if (indexUser > -1) API.users[userID].streams.splice(indexUser, 1);
        }

        if (API.streams[streamID] !== undefined) {
          var subscribers = API.streams[streamID].subscribers;
          for (var s in subscribers) {
            if (API.users[subscribers[s]]) {
              var indexSub = API.users[subscribers[s]].subscribedTo.indexOf(streamID);
              if (indexSub > -1) API.users[subscribers[s]].subscribedTo.splice(indexSub, 1);
            }
          }
        }

        delete API.streams[streamID];

        delete API.states[streamID];

        API.sessions_active[roomID] = session;
        break;

      case "subscribe":
        var streamID = theEvent.stream;
        var userID = theEvent.user;
        var roomID = theEvent.room;
        var userName = theEvent.name;

        event.streamID = streamID;
        event.roomID = roomID;
        event.userID = userID;
        event.userName = userName;

        API.streams[streamID].subscribers.push(userID);

        if (API.users[userID] === undefined) {
          API.users[userID] = {
            userName: userName,
            roomID: roomID,
            streams: [],
            subscribedTo: [streamID]
          }
        } else {
          API.users[userID].subscribedTo.push(streamID);
        }

        if (config.ackuaria.useDB) {
          roomsRegistry.hasRoom(roomID, function(hasRoom){
            if (!hasRoom) {
              roomsRegistry.addRoom({
                roomID: roomID,
                roomName: API.rooms[roomID].roomName,
                data: API.rooms[roomID].data
              }, function(saved) {
                log.info('MongoDB: Added room: ', saved);
              })
            }
          });
        }
        break;

      case "unsubscribe":
        var streamID = theEvent.stream;
        var userID = theEvent.user;
        var roomID = theEvent.room;

        event.streamID = streamID;
        event.roomID = roomID;
        event.userID = userID;

        if (API.streams[streamID] !== undefined) {
          var indexStream = API.streams[streamID].subscribers.indexOf(userID);
          if (indexStream > -1) API.streams[streamID].subscribers.splice(indexStream, 1);
        }

        if (API.users[userID] !== undefined) {
          var indexUser = API.users[userID].subscribedTo.indexOf(streamID);
          if (indexUser > -1) API.users[userID].subscribedTo.splice(indexUser, 1);
          if (API.users[userID].streams.length == 0 && API.users[userID].subscribedTo.length == 0) {
            delete API.users[userID];
            for (var stream in API.streams) {
              var indexStream = API.streams[stream].subscribers.indexOf(userID);
              if (indexStream > -1) API.streams[stream].subscribers.splice(indexStream, 1);

              delete API.states[stream].subscribers[userID];
            }
          }
        }
        break;

      case "user_disconnection":
        var roomID = theEvent.room;
        var userID = theEvent.user;

        event.roomID = roomID;
        event.subID = userID;

        for (var streamID in API.streams) {
          var indexStream = API.streams[streamID].subscribers.indexOf(userID);
          if (indexStream > -1) API.streams[streamID].subscribers.splice(indexStream, 1);

          delete API.states[streamID].subscribers[userID];

          if (API.streams[streamID].userID == userID){
            delete API.streams[streamID];

            if (API.rooms[roomID] !== undefined) {
              var indexStream = API.rooms[roomID].streams.indexOf(streamID);
              if (indexStream > -1) API.rooms[roomID].streams.splice(indexStream, 1);
            }

            delete API.states[streamID];
          }
        }

        delete API.users[userID];
        break;

      case "connection_status":
        var streamID = theEvent.pub;
        var subID = theEvent.subs;
        var state = theEvent.status;
        var roomID = API.streams[streamID].roomID;

        event.type = "connection_status";
        event.streamID = streamID;
        event.subID = subID;
        event.state = state;
        event.roomID = roomID;

        if (!subID) {
          if (!API.states[streamID]) {
            API.states[streamID] = {
              state: state,
              subscribers: {}
            };
          } else {
            API.states[streamID].state = state;
          }
          subID = API.streams[streamID].userID;

        } else {
          API.states[streamID].subscribers[subID] = state;
        }
        break;

      case "failed":
        var roomID = theEvent.room;
        var userID = theEvent.user;
        var userName = API.users[userID].userName;
        var streamID = theEvent.stream;
        var sdp = theEvent.sdp;

        event.type = "failed";
        event.streamID = streamID;
        event.subID = subID;
        event.roomID = roomID;
        event.sdp = sdp;
        API.sessions_active[roomID].failed.push({streamID: streamID, userID: userID, userName: userName, sdp:sdp});
        API.rooms[roomID].failed.push({streamID: streamID, userID: userID, userName: userName, sdp:sdp});

        var indexRoom = API.rooms[roomID].streams.indexOf(streamID);
        if (indexRoom > -1) API.rooms[roomID].streams.splice(indexRoom, 1);
        break;
      default:
        break;
    }
    sendEventToClients(event, API.rooms, API.streams, API.users, API.states);
    if (config.ackuaria.useDB) {
      eventsRegistry.addEvent(theEvent, function(saved, error) {
        if (error) log.error(error);
      })
    }
  } catch (err) {
    log.error("Error receiving event:", err);
  }
};

API.api.stats = function(theStats) {
  theStats = theStats.message;
  try {
    sendStatsToClients(theStats);

  } catch (err) {
    log.error("Error receiving stat", err);
  }
};

API.addNewConnection = (socket) => {
  log.debug('New socket connected ' + socket.id);
  API.sockets.set(socket.id, socket);
  socket.on('disconnect', removeConnection.bind(null, socket.id));
  socket.on('subscribe_to_stats', subscribeClientToStats.bind(null, socket.id));
};

var module = module || {};
module.exports = API;
