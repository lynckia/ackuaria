
var API = {};
var logger = require('./logger').logger;
var config = require('./../ackuaria_config');
var log = logger.getLogger("Ackuaria");
var db = require('./mdb/dataBase').db;
var eventsRegistry = require('./mdb/eventsRegistry');
var statsRegistry = require('./mdb/statsRegistry');
var sessionsRegistry = require('./mdb/sessionsRegistry');
var N = require('./../nuve');

GLOBAL.config = config || {};


API.sockets = [];

API.rooms = {};
API.streams = {};
API.users = {};
API.states = {};
API.currentRoom;
API.sessions_active = {};

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function search(id, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].streamID === id) {
            return myArray[i];
        }
    }
}

API.api = {
    event: function(theEvent) {
        try {
            log.info("Event:", theEvent);
            var event = {};
            switch (theEvent.type) {

                case "publish":
                    // Memoria local para datos
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
                                streams: [streamID],
                                users: [userID],
                                failed: []
                            };           
                        })
                    } else {

                        if (API.rooms[roomID].streams.length == 0) {
                            var nSession, sessionID, session;
                            if (!API.sessions_active[roomID]) nSession = 1;
                            else nSession = API.sessions_active[roomID].nSession + 1;
                            sessionID = roomID + "_" + nSession;

                            session = {
                                sessionID: sessionID,
                                nSession: nSession,
                                roomID: roomID,
                                initTimestamp: initTimestamp,
                                streams: [{streamID: streamID, userID: userID, initPublish: initTimestamp }],
                                failed: []
                            }
                            API.sessions_active[roomID] = session;
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
                        if (indexSub > -1) API.streams[streamID].subscribers.splice(indexSub, 1);
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
            if (API.currentRoom == event.roomID || API.currentRoom == "") {
                API.send_event_to_clients(event, API.rooms, API.streams, API.users, API.states);
            }
            if (config.ackuaria.useDB) {        
                eventsRegistry.addEvent(theEvent, function(saved, error) {
                    // if (saved) log.info(saved);
                    if (error) log.error(error);
                })
            }

            //}

        } catch (err) {
            console.log("Error receiving event:", err);
        }
    },
    stats: function(theStats) {
        //log.info('Stat: ', theStats);
        try {
            API.send_stats_to_clients(theStats);

        } catch (err) {
            log.error("Error receiving stat", err);
        }
    }
};

API.send_event_to_clients = function(event, rooms, streams, users, states) {
    for (var s in API.sockets) {
        API.sockets[s].emit('newEvent', {
            event: event,
            rooms: rooms,
            streams: streams,
            users: users,
            states: states
        });
    }
}

API.send_stats_to_clients = function(event) {
    if (!event.subs) {
        var pubID = String(event.pub);
        var stats = event.stats;
        var video, audio;
        if (stats && stats.length > 0) {
            if (stats[0].type == "video") {
                video = stats[0];
                audio = stats[1];
            } else {
                video = stats[1];
                audio = stats[0];
            }
        }

        for (var s in API.sockets) {
            API.sockets[s].emit('newSR', {
                event: event,
                audio: audio,
                video: video
            });
        }
    } else {
        var pubID = String(event.pub);
        var subID = event.subs;
        var stats = event.stats;
        var video, audio;
        if (stats && stats.length > 0) {
            if (stats[0].PLI) {
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