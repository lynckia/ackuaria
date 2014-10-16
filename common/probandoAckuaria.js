
var db = require('./mdb/dataBase.js').db;
var eventsRegistry = require('./mdb/eventsRegistry');
var statsRegistry = require('./mdb/statsRegistry');
var roomsRegistry = require('./mdb/roomsRegistry');
var sessionsRegistry = require('./mdb/sessionsRegistry');

// eventsRegistry.getEventsByRoom("541830da69c86b9c0ae1c6fb", function(events) {
// 	console.log("*******************************");
// 	console.log(events);
// 	console.log("*******************************");
// })

// statsRegistry.getStatsByPublisher(434215049492195260, function(events) {
// 	console.log("*******************************");
// 	console.log(events);
// 	console.log("*******************************");
// })

 // eventsRegistry.removeEventsByRoom("541830da69c86b9c0ae1c6fb", function(result){
 // 	console.log(result);
 // });



// statsRegistry.getStats(function(stats){
// 	console.log("*********STATS***********");
// 	console.log(stats);
// })

eventsRegistry.getEventsByRoom("5409b8b7b05b969f0c2a973c", function(events){	
	console.log("********EVENTS*********");

	console.log(events);

})
roomsRegistry.getRooms(function(rooms) {
	console.log("********ROOMS*********");
	console.log(rooms);
})
sessionsRegistry.getSessions(function(sessions){
	console.log("********SESSIONS*********");

	console.log(sessions);
})


// roomsRegistry.removeAllRooms();
// sessionsRegistry.removeAllSessions();
// statsRegistry.removeAllStats();
// eventsRegistry.removeAllEvents();
// db.close();