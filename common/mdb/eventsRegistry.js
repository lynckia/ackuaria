var db = require('./dataBase').db;

var getEvent = exports.getEvent = function(id, callback) {
    "use strict";

    db.events.findOne({
        _id: db.ObjectId(id)
    }, function(err, event) {
        if (event === undefined) {
            log.warn('Event ', id, ' not found');
        }
        if (callback !== undefined) {
            callback(event);
        }
    });
};

var hasEvent = exports.hasEvent = function(id, callback) {
    "use strict";

    getEvent(id, function(event) {
        if (event === undefined) {
            callback(false);
        } else {
            callback(true);
        }
    });
};

exports.addEvent = function(event, callback) {
    "use strict";

    db.events.save(event, function(error, saved) {
        if (error) log.warn('MongoDB: Error adding event: ', error);
        if (callback !== undefined) {
            callback(saved);
        }
    });
};

/*
 * Removes a determined room from the data base.
 */
var removeEvent = exports.removeEvent = function(id, callback) {
    "use strict";

    hasEvent(id, function(hasEvent) {
        if (hasEvent) {
            db.events.remove({
                _id: db.ObjectId(id)
            }, function(error, removed) {
                if (error) log.warn('MongoDB: Error removing event: ', error);
                callback("yes");
            });
        }
    });
};

exports.removeEventsByRoom = function(roomId, callback) {

    db.events.find({
        room: roomId
    }).toArray(function(err, events) {
        if (err || !events) {
            console.log("There are no events for room " + roomId);
        } else {
            for (var i in events) {
                removeEvent(events[i]._id, function(removed) {
                    console.log(removed);
                });
            }

            callback("Removed all events in room " + roomId);
        }
    })
};

exports.getEvents = function(callback) {
    db.events.find({}).toArray(function(err, events) {
        if (err) {
            console.log("Error: " + err);
        } else {
            callback(events);
        }
    });
};

exports.getEventsOfRoom = function(roomId, callback) {
    db.events.find({
        room: roomId
    }).toArray(function(err, events) {
        if (err || !events) {
            console.log("There are no events for room " + roomId);
        } else {
            callback(events);
        }
    })
};

exports.getEventsOfUser = function(userId, callback) {
    db.events.find({
        user: userId
    }).toArray(function(err, events) {
        if (err || !events) {
            console.log("There are no events for user " + userId);
        } else {
            callback(events);
        }
    })
};

exports.getEventsByType = function(type, callback) {

    db.events.find({
        type: type
    }).toArray(function(err, events) {
        if (err || !events) {
            console.log("There are no events of type " + type);
        } else {
            callback(events);
        }
    })
};

exports.getEventsByDate = function(timestampInit, timestampFinal, callback) {

    if (timestampInit && timestampFinal) {

        db.events.find({
            timestamp: {
                $gt: timestampInit,
                $lt: timestampFinal
            }
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date ");
            } else {
                callback(events);
            }
        })

    } else if (timestampInit && !timestampFinal) {

        db.events.find({
            timestamp: {
                $gt: timestampInit
            }
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date");
            } else {

                callback(events);

            }
        })

    } else if (timestampFinal && !timestampinit) {

        db.events.find({
            timestamp: {
                $lt: timestampFinal
            }
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date");
            } else {

                callback(events);

            }
        })
    }
};



exports.getEventsByDateAndType = function(timestampInit, timestampFinal, type, callback) {

    if (timestampInit && timestampFinal) {

        db.events.find({
            timestamp: {
                $gt: timestampInit,
                $lt: timestampFinal
            },
            type: type
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date ");
            } else {
                callback(events);
            }
        })

    } else if (timestampInit && !timestampFinal) {

        db.events.find({
            timestamp: {
                $gt: timestampInit
            }
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date");
            } else {

                callback(events);

            }
        })

    } else if (timestampFinal && !timestampinit) {

        db.events.find({
            timestamp: {
                $lt: timestampFinal
            }
        }).toArray(function(err, events) {
            if (err || !events) {
                console.log("There are no events on this date");
            } else {

                callback(events);

            }
        })
    }
};

exports.removeAllEvents = function() {

    db.events.remove();
    //callback("All events removed succesfully");

};
