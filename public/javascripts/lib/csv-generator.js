var get_csv = function (data) {
	var init = data.init_date;
	var fin = data.final_date;
	var sess = data.n_sessions;
	var users = data.n_users;
	var time = data.time_published;

	var rooms = data.room_list;

	var csv = 'init_date;final_date;total_sessions;tatal_users;total_published_time;\n';
	csv = csv + init + ';' + fin + ';' + sess + ';' + users + ';' + time + '\n';
	csv = csv + 'room_id;room_name;sessions;users;published_time;metadata;\n';

	var room, room_name;

	for (var r in rooms) {
		room = rooms[r];
		room.data = room.data || {};
		room_name = room.data._name;
		delete room.data._name;
		csv = csv + r + ';' + room_name + ';' + room.n_sessions + ';' + room.n_users + ';' + room.time_published + ';' + JSON.stringify(room.data) +'\n';
	}

	return csv;
}