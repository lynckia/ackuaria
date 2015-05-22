var db = require('./dataBase').db;

var getSession = exports.getSession = function(id, callback) {
	"use strict";

	db.sessions.findOne({
		_id: db.ObjectId(id)
	}, function(err, session) {
		if (session === undefined) {
			log.warn('Session ', id, ' not found');
		}
		if (callback !== undefined) {
			callback(room);
		}
	});
};

var hasSession = exports.hasSession = function(id, callback) {
	"use strict";

	getSession(id, function(session) {
		if (session === undefined) {
			callback(false);
		} else {
			callback(true);
		}
	});
};

exports.addSession = function(session, callback) {
	"use strict";

	db.sessions.save(session, function(error, saved) {
		if (error) log.warn('MongoDB: Error adding session: ', error);
		if (callback !== undefined) {
			callback(saved);
		}
	});
};


exports.getSessions = function(callback) {

    db.sessions.find({}).toArray(function(err, sessions) {
        if (err || !sessions) {
        	callback([]);
            console.log("There are no sessions ");
        } else {
            callback(sessions);
        }
    });
}

exports.getSessionsOfRoom = function(roomID, callback) {

    db.sessions.find({roomID: roomID}).toArray(function(err, sessions) {
        if (err || !sessions) {
         	callback([]);
            console.log("There are no sessions ");
        } else {
            callback(sessions);
        }
    });
}

exports.getSessionsOfUser = function(userID, callback) {
	var sessions = [];
    db.sessions.find().forEach(function(err, doc) {
    	if (!doc) callback(sessions);
    	else {
    		var streams = doc.streams;
    		for (var s in streams) {
    			if (streams[s].userID == userID) {
    				sessions.push(doc);
    				break;
    			}

    		}
    	}
    })
}

exports.getSessionsOfStream = function(streamID, callback) {
	var sessions = [];
    db.sessions.find().forEach(function(err, doc) {
    	if (!doc) callback(sessions);
    	else {
    		var streams = doc.streams;
    		for (var s in streams) {
    			if (streams[s].streamID == streamID) {
    				sessions.push(doc);
    				break;
    			}

    		}
    	}
    })
}







exports.getSessionsBySessionId = function(sessionId, callback) {

    db.sessions.find({sessionId: sessionId}).toArray(function(err, sessions) {
        if (err || !sessions) {
            console.log("There are no sessions ");
        } else {
            callback(sessions);
        }
    });
}


exports.getPublishersInSession = function(sessionId, callback) {
	
    db.sessions.findOne({
        sessiomId: sessionId
    }, function(err, session) {
        if (session) {
            callback(session.publishers);
        }
        if (err) {
            callback(err);
        }
    })
}

exports.removeAllSessions = function() {

    db.sessions.remove();
}

//getSessionByDate
//getSessionTimestamps
//getNumberOfSession