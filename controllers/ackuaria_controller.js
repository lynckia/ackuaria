
var API = require('./../common/api');
var N = require('./../nuve');

exports.loadRooms = function(req, res) {
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