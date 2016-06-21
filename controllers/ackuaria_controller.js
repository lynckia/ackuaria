
var API = require('./../common/api');
var N = require('./../nuve');
var config = require('./../ackuaria_config');
var api_controller = require('./api_controller');
var amqper = require('./../common/amqper');

exports.updateRooms = function(req, res, next) {
   var date = new Date().getTime();

   if (req.originalUrl == "/ackuaria/" || !API.lastUpdated || (date - API.lastUpdated) >= config.ackuaria.call_time * 1000) {
      console.log("Calling Nuve...");
      N.API.getRooms(function(roomList) {
         var rooms = JSON.parse(roomList);
         var test_rooms = {};
         for (var i in rooms) {
            var room = rooms[i];
            if (!API.rooms[room._id]) {
               test_rooms[room._id] = {
                   roomName: room.name,
                   streams: [],
                   users: [],
                   failed: []
               };
            } else {
               test_rooms[room._id] = API.rooms[room._id];
            }
         }

         API.rooms = test_rooms;
         API.lastUpdated = new Date().getTime();
         console.log("Nuve called: Updated Room List");

         next();
      })   
   } else {
      console.log("Too soon for calling Nuve again.");
      next();
   }
}

exports.loadRooms = function(req, res) {
   API.currentRoom = "";
   res.render('rooms', {
      view: "rooms",
      rooms: API.rooms
   });
};

exports.loadPublishers = function(req, res) {
	var roomID = req.query.room_id;
   var fails = req.query.fails;
   API.currentRoom = roomID;
   var room = API.rooms[roomID];

   if (API.rooms[roomID]) var roomName = API.rooms[roomID].roomName;
   else {
      room = null;
      var roomName = "Not found";
   }

   var streamsInRoom = {};
   var usersInRoom = {};
   var statesInRoom = {};

   for (var s in API.streams){
      if (room.streams.indexOf(parseInt(s)) > -1) {
         streamsInRoom[s] = API.streams[s];
      }
   }

   for (var s in API.states){
      if (room.streams.indexOf(parseInt(s)) > -1) {
         statesInRoom[s] = API.states[s];
      }
   }

   res.render('publishers', {
      view: "publishers",
      roomID: roomID,
      roomName: roomName,
      room: room,
      streams: streamsInRoom,
      states: statesInRoom
   });
};

exports.loadSubscribers = function(req, res) {
   var streamID = req.query.pub_id;
   var roomID = req.query.room_id;
   var room = API.rooms[roomID];

   API.currentRoom = roomID;
   if (API.streams[streamID])  var userName = API.streams[streamID].userName;
   else var userName = "Publisher not found";

   if (API.rooms[roomID]) var roomName = API.rooms[roomID].roomName;
   else var roomName = "Not found";
   
   var streamsInRoom = {};
   for (var s in API.streams){
      if (room.streams.indexOf(parseInt(s)) > -1) {
         streamsInRoom[s] = API.streams[s];
      }
   }

   var statesInRoom = {};
   for (var s in API.states){
      if (room.streams.indexOf(parseInt(s)) > -1) {
         statesInRoom[s] = API.states[s];
      }
   }

   res.render('subscribers', {
      view: "subscribers",
      roomID: roomID,
      roomName: roomName,
      room: room,
      streamID: streamID,
      userName: userName,
      streams: streamsInRoom,
      users: API.users,
      states: statesInRoom
   });
};

exports.loadHistory = function(req, res) {
   api_controller.get_room_list({}, undefined, undefined, function(info) {
      var keys_list = [];

      for (var r in info.room_list) {
         if (info.room_list[r].data) {
            var keys = Object.keys(info.room_list[r].data);
            for (var k in keys) {
               if (keys[k] !== '_name' && keys_list.indexOf(keys[k]) === -1) {
                  keys_list.push(keys[k]);
               }
            }
         }
      }

      res.render('history', {
         view: "history",
         info: info,
         keys: keys_list
      });
   })
};

exports.loadAgents = function(req, res, next) {
   var streams = {};
   for (var a in API.agents) {
      streams[a] = [];
      for (var s in API.streams){
         if (API.streams[s].agentID == a) {
            streams[a].push(s);
         }
      }
   }
   res.render('agents', {
      view: "agents",
      agents: API.agents,
      streams: streams
   });
}

exports.loadAgent = function(req, res, next) {
   var agentID = req.query.agent_id;
   API.currentAgent = agentID;
   var agent = API.agents[agentID];

   if (API.agents[agentID]) {
      var agentMetadata = API.agents[agentID].metadata;
      var agentStats = API.agents[agentID].stats;
   }
   else {
      agent = null;
   }

   var streamsInAgent = {};

   for (var s in API.streams){
      if (API.streams[s].agentID == agentID) {
         streamsInAgent[s] = API.streams[s];
      }
   }

   res.render('agent', {
      view: "agent",
      agentID: agentID,
      agent: agent,
      agentMetadata: agentMetadata,
      agentStats: agentStats,
      streams: streamsInAgent,
   });
}