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

exports.updateSession = function(sessionId, pubId, callback) {

	var pubs = [];
	var nPubs;

	db.sessions.findOne({
		sessionId: sessionId
	}, function(err, session) {
		if (session) {
			pubs = session.publishers;
			pubs.push(pubId);
			db.sessions.update({
				sessionId: sessionId
			}, {
				$set: {
					publishers: pubs
				}
			}, function(err, result) {
				if (err)
					callback("Couldn't update session info");
				else
					callback("Added publisher to session info");
			})
		}
	})
}

exports.finishSession = function(sessionId, finalTimestamp, callback) {

	db.sessions.findOne({
		sessionId: sessionId
	}, function(err, session) {
		if (session) {
			
			db.sessions.update({
				sessionId: sessionId
			}, {
				$set: {
					finalTimestamp: finalTimestamp
				}
			}, function(err, result) {
				if (err)
					callback("Couldn't finish session" + sessionId);
				else
					callback("Session " + sessionId + " finished!");
			})
		}
	})
}

exports.initSession = function(sessionId, initTimestamp, callback) {
	
	db.sessions.findOne({
		sessionId: sessionId
	}, function(err, session) {
		if (session) {

			db.sessions.update({
				sessionId: sessionId
			}, {
				$set: {
					initTimestamp: initTimestamp
				}
			}, function(err, result) {
				if (err)
					callback("Couldn't init session " + sessionId);
				else
					callback("Session " + sessionId + " initialized!");
			})
		}
	})
}

exports.getSessions = function(callback) {

    db.sessions.find({}).toArray(function(err, sessions) {
        if (err || !sessions) {
            console.log("There are no sessions ");
        } else {
            callback(sessions);
        }
    });
}

exports.getSessionsByRoom = function(roomId, callback) {

    db.sessions.find({room: roomId}).toArray(function(err, sessions) {
        if (err || !sessions) {
            console.log("There are no sessions ");
        } else {
            callback(sessions);
        }
    });
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