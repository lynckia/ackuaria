/*global require, exports*/



// Logger

var dataBaseURL = require("./../../ackuaria_config").ackuaria.dataBaseURL;

var collections = ["events", "stats", "rooms", "sessions"];
exports.db = require("mongojs").connect(dataBaseURL, collections);

