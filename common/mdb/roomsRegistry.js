var db = require('./dataBase').db;

var getRoom = exports.getRoom = function(id, callback) {
    "use strict";

    db.rooms.findOne({
        _id: db.ObjectId(id)
    }, function(err, room) {
        if (room === undefined) {
            console.log('Room ', id, ' not found');
        }
        if (callback !== undefined) {
            callback(room);
        }
    });
};

exports.hasRoom= function(roomID, callback) {
    "use strict";
    db.rooms.findOne({
        roomID: roomID
    }, function(err, room) {
        if (room === null) {
            callback(false);
        } else {
            callback(true);
        }
    });
};


exports.getRoomByRoomId = function(roomId, callback) {
    "use strict";

    db.rooms.findOne({
        roomId: roomId
    }, function(err, room) {
        if (room === undefined) {
            console.log('Room ', id, ' not found');
        }
        if (callback !== undefined) {
            callback(room);
        }
    });
};


exports.addRoom = function(room, callback) {
    "use strict";

    db.rooms.save(room, function(error, saved) {
        if (error) console.log('MongoDB: Error adding room: ', error);
        if (callback !== undefined) {
            callback(saved);
        }
    });
};

exports.updateRoomPublish = function(roomId, pubId, callback) {
    var pubs = [];
    var nPubs;

    db.rooms.findOne({
        roomId: roomId
    }, function(err, room) {
        if (room) {

            pubs = room.publishers;
            nPubs = room.nPubs;
            nPubs++;
            pubs.push(pubId);

            db.rooms.update({
                roomId: roomId
            }, {
                $set: {
                    publishers: pubs,
                    nPubs: nPubs
                }
            }, function(err, result) {
                if (err)
                    callback("Couldn't update room info");

                else
                    callback("Added publisher to room info");
            })
        } else console.log(err);
    })
}


exports.updateRoomUnpublish = function(roomId, pubId, callback) {

    db.rooms.findOne({
        roomId: roomId
    }, function(err, room) {
        if (room) {

            nPubs = room.nPubs;
            nPubs--;

            db.rooms.update({
                roomId: roomId
            }, {
                $set: {
                    nPubs: nPubs
                }
            }, function(err, result) {
                if (err)
                    callback("Couldn't update room info");

                else {
                    if (nPubs == 0) {
                        callback("One publisher less in room info", true);

                    } else callback("One publisher less in room info", false);
                }
            })
        } else console.log(err);
    })
}



exports.updateRoomSession = function(roomId, nSession, callback) {

    db.rooms.findOne({
        roomId: roomId
    }, function(err, room) {
        if (room) {

            db.rooms.update({
                roomId: roomId
            }, {
                $set: {
                    nSession: nSession
                }
            }, function(err, result) {
                if (err)
                    callback("Couldn't add session to room " + roomId);
                else
                    callback("Added session to room " + roomId);
            })
        } else console.log(err);
    })
}

exports.getRooms = function(callback) {

    db.rooms.find({}).toArray(function(err, rooms) {
        if (err || !rooms) {
            console.log("There are no rooms ");
        } else {
            callback(rooms);
        }
    });
}

// Devuelve un array con todos los publishers de una room
exports.getPublishersInRoom = function(roomId, callback) {
    
    db.rooms.findOne({
        roomId: roomId
    }, function(err, room) {
        if (room) {
            callback(room.publishers);
        }
        if (err) {
            callback(err);
        }
    })
}

// Devuelve un array con todos los publishers
exports.getPublishers = function(callback) {
    var a = [];
    db.rooms.find({}, function(err, rooms) {
        for (room in rooms){
            a = a.concat(rooms[room].publishers);
        }
        callback(a);
    })


}
exports.getTotalRooms = function(callback) {
    var a = [];
    db.rooms.find({}, function(err, rooms) {
        if (err){
            callback(err);
        }

        if (rooms){
            var total = 0;
            for (room in rooms){
                total++;
            }
            callback(total);
        }
        else {
                    callback("There are no rooms");

        }

    })


}

exports.removeAllRooms = function() {

    db.rooms.remove();
}