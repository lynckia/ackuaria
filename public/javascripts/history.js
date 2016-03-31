$(document).ready(function(){
	var filter_count = 0;
	var _last_data = info;

	$.fn.toggleDisabled = function() {
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};

	$("#initCalendar").datepicker();
	$("#finalCalendar").datepicker();

	document.getElementById("initButton").onclick = function(e) {
		$("#initCalendar").focus();
	}
	document.getElementById("finalButton").onclick = function(e) {
		$("#finalCalendar").focus();
	}

	var delete_filter = function(target) {
		$(target).remove();
	}	


	var delete_all_filters = function() {
		$("#initCalendar").val('');
		$("#finalCalendar").val('');
		$('#room_id').val('');
		$('#room_name').val('');

		$('#key_0 option:eq(0)').prop('selected', true);
		$('#value_0').val('');

		for (var i=1; i<=filter_count; i++){
			var target = '#filter_row_' + i;
			$(target).remove();
		}
	}

	var new_filter = function() {
		filter_count++;
		var html = '<div class="row filter_row key_value" id="filter_row_' + filter_count + '">' + 
			'<div class="filters col-md-2"><span>Key </span></div>' +
			'<div class="filters col-md-4"><div class="form-group">' + 
            '<select class="form-control key" id="key_' + filter_count + '">' +
            '<option value="">Select key</option>';

        for (var k in keys) {
        	html = html + '<option>' + keys[k] + '</option>';
        }

        html += '</select></div></div>' + 
			'<div class="filters col-md-1"><span class="value_label">Value </span></div>' + 
			'<div class="filters col-md-4"><input id="value_' + filter_count + '" class="filter value" type="text" placeholder="Insert value"></div>' + 
			'<div class="filters col-md-1"><span class="button toolIcon fa fa-times removeButton" todelete="filter_row_' + filter_count + '" id="remove_button_' + filter_count + '"></span></div>' + 
			'</div>';

		$(html).insertBefore($('#addFilter_row'));
                           
		$('#remove_button_' + filter_count).click(function() {
			var target = '#' + $(this).attr('todelete');
			delete_filter(target);
		});
	};

	document.getElementById("addButton").onclick = function(e) {
		new_filter();
	}

	$('#remove_button_0').click(function() {
		var target = '#' + $(this).attr('todelete');
		delete_filter(target);
	});
	
	$('#deleteFiltersButton').click(function() {
		delete_all_filters();
	});

	$('input').keyup(function(e) {
		console.log('k', e);

		e = e || event;
		if (e.keyCode === 13) {
			search();
		}
		return true;
	});

	$('#searchButton').click(function() {
		search();
	});

	var search = function () {

		var url = 'info/rooms?';

		var room_id = $('#room_id').val();
		var room_name = $('#room_name').val();

		if (room_id !== '') {
			url = 'info/rooms/' + room_id + '?';
		}

		if (room_name !== '') {
			url = url + '_name=' + room_name + '&';  
		}

		for (var i = 0; i < $('.key_value').length; i++) {
			var key = $('.key:eq(' + i + ')').val();
			var value = $('.value:eq(' + i + ')').val();

			if (key !== '' && key !== undefined) {
				url = url + key + '=' + value + '&';  
			}
		}

		var initDate = $("#initCalendar").datepicker('getDate');
		var finalDate = $("#finalCalendar").datepicker('getDate');

		if (initDate) {
			var i_year = initDate.getFullYear() + '';
			var i_month = initDate.getMonth() + 1 + '';
			var i_day = initDate.getDate() + '';

			if (i_month.length === 1) i_month = '0' + i_month;
			if (i_day.length === 1) i_day = '0' + i_day;

			url += 'init=' + i_day  + i_month + i_year + '&';
		}

		if (finalDate) {
			var f_year = finalDate.getFullYear() + '';
			var f_month = finalDate.getMonth() + 1 + '';
			var f_day = finalDate.getDate() + '';

			if (f_month.length === 1) f_month = '0' + f_month;
			if (f_day.length === 1) i_day = '0' + i_day;

			url += 'final=' + f_day  + f_month + f_year;
		}

		$.ajax({
			url: url,
			type: 'GET',
			statusCode: {
				200: function (data, status, xhr) {
					_last_data = data;
					paintRoomsList(data.room_list);
					paintRoomsStats(data);
				},
				// TODO: Handle errors 
				500: function (data, status, xhr) {

				}
			}
		});
	}

	$('#exportButton').click(function() {
		var csv = get_csv(_last_data);

        var blob = new Blob([csv], {type: "text/plain"});
        var blobURL = window.URL.createObjectURL(blob);

        var a = document.createElement("a");
	    document.body.appendChild(a);
	    a.style = "display: none";
	        
        a.href = blobURL;
        a.download = 'ackuaria.csv';
        a.click();
        window.URL.revokeObjectURL(blobURL);
        document.body.removeChild(a);
        
	});
});

var paintRoomsStats = function(data){
    $('#stats_sessions').html(data.n_sessions);
    $('#stats_rooms').html(data.n_rooms);
    $('#stats_users').html(data.n_users);
    $('#stats_time').html(getHumanTime(data.time_published));
};

var paintRoomsList = function(room_list){
    $('#bodyTable').html("");
    var nRooms = Object.keys(room_list).length;
    for (var room in room_list) {
        var roomID = room;
        createNewRoomList(roomID, room_list[room]);        
    }

    if (nRooms === 0) {
    	$('#bodyTable').append('<tr class="show_list room_empty"><td colspan="2"><span>No rooms</span></td></tr>');
    }
};

var createNewRoomList = function(roomID, room){
	var roomName = (room.data || {})._name || '-';
	var nSessions = room.n_sessions;
	var nUsers = room.n_users;
	var time = room.time_published;

    $('#bodyTable').append('<tr class="room show_list" id="room_' + roomID + '" data-room_id="' + roomID + '">' + 
    	'<td class="roomID">'+ roomID + '</td>' + 
    	'<td class="roomName">' + roomName + '</td>' +
    	'<td class="collapseButtons"><span class="collapseButtonDown fa fa-angle-down" id="collapseButtonDown_' + roomID + '"></span>' + 
		'<span class="collapseButtonUp fa fa-angle-up hidden" id="collapseButtonUp_' + roomID + '"></span></td>' +
    	'</tr>');
    $('#bodyTable').append('<tr class="room_detail show_list hidden" id="room_detail_' + roomID + '" data-room_id="' + roomID + '"><td colspan="3">' + 
    	'<span>Sessions </span><span class="info bold dark">' +  nSessions + '</span>' +
    	'<span>Users </span><span class="info bold dark">' +  nUsers + '</span>' +
    	'<span>Time published </span><span class="info bold dark">' +  getHumanTime(time) + '</span>' +
    	'</td></tr>');
    $('#room_' + roomID).click(function() {
        var room_id = $(this).data('room_id');

        $("#collapseButtonUp_" + room_id).removeClass('hidden');
		$("#collapseButtonDown_" + room_id).addClass('hidden');

       	$('.room').removeClass('selected');
       	$(".collapseButtonUp").addClass('hidden');
		$(".collapseButtonDown").removeClass('hidden');

        if (!$('#room_detail_' + room_id).hasClass('hidden')) {
        	$('.room_detail').addClass('hidden');
        	
        } else {
        	$('.room_detail').addClass('hidden');
        	$('#room_detail_' + room_id).removeClass('hidden');
        	$('#room_' + room_id).addClass('selected');
        	$("#collapseButtonUp_" + room_id).removeClass('hidden');
			$("#collapseButtonDown_" + room_id).addClass('hidden');
        }

    })
};

var getHumanTime = function (secs) {
	var hours = parseInt(secs/3600);
	var minutes = parseInt((secs - hours*3600) / 60);
	var seconds = parseInt(secs - hours*3600 - minutes*60);
	var time = hours + "h " + minutes + "m " + seconds + "s"; 
	return time;
}