$(document).ready(function(){
	var filter_count = 0;

	$.fn.toggleDisabled = function() {
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};

	$("#initCalendar").datepicker();
	$("#finalCalendar").datepicker();

	$("#filterCollapse").hide();
	$("#collapseButtonUp").hide();

	$("#configButton, .collapsed").click(function() {
		$("#filterCollapse").toggle();
		$("#collapseButtonUp").toggle();
		$("#collapseButtonDown").toggle();
		$("#searchBar").toggleDisabled();
		$('#searchBar').val("");
		$('#searchBar').keyup();
	})
	
	document.getElementById("initButton").onclick = function(e) {
		$("#initCalendar").focus();
	}
	document.getElementById("finalButton").onclick = function(e) {
		$("#finalCalendar").focus();
	}
	$('#searchBar').keyup(function () {
        search();
    });

    var search = function() {
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here
        filter_array = filter.split(' '); // split the user input at the spaces
        var arrayLength = filter_array.length; // Get the length of the filter array
        $('.room').each(function() {
            var _this = $(this);
            var title1 = _this.find('.roomID').text().toLowerCase();
            var title2 = _this.find('.roomName').text().toLowerCase();
            var hidden = 0;
            for (var i = 0; i < arrayLength; i++) {
                if (title1.indexOf(filter_array[i]) < 0 && title2.indexOf(filter_array[i]) < 0) {
                    _this.hide();
                    hidden = 1;
                }
            }
            if (hidden == 0)  {
               _this.show();
            }
        });
    }

	var delete_filter = function(target) {
		$(target).remove();
	}	


	var delete_all_filters = function() {
		for (var i=0; i<=filter_count; i++){
			var target = '#filter_row_' + i;
			console.log(target);
			$(target).remove();
		}
	}

	var new_filter = function() {
		filter_count++;
		$('<div class="row filter_row" id="filter_row_' + filter_count + '"><div class="filters col-md-5"><span>Key </span><input id="key" class="filter" type="text" placeholder="e.g. public"></div><div class="filters col-md-5"><span>Value </span><input id="value" class="filter" type="text" placeholder="e.g. true"></div><div class="filters col-md-2"><span class="button dateIcon fa fa-times removeButton" todelete="filter_row_' + filter_count + '" id="remove_button_' + filter_count + '"></span></div></div>').insertBefore($('#addFilter'));
		$('#remove_button_' + filter_count).click(function() {
			var target = '#' + $(this).attr('todelete');
			delete_filter(target);
		});
	};

	document.getElementById("addButton").onclick = function(e) {
		new_filter();
	}

	$('#remove_button_1').click(function() {
		var target = '#' + $(this).attr('todelete');
		delete_filter(target);
	});
	
	$('#deleteFiltersButton').click(function() {
		delete_all_filters();
	});
});

var paintRoomsList = function(){
    $('#rooms').html("");
    var nRooms = Object.keys(rooms).length
    $('#rooms').append('<div class="roomContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-4">ID</th><th class="col-md-4">Room Name</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
    for (var room in rooms) {
            var roomID = room;
            var roomName = rooms[room].roomName;
            createNewRoomList(roomID, roomName);        
    }

    Sortable.init()
};

var createNewRoomList = function(roomID, roomName){
    $('#bodyTable').append('<tr class="room show_list" id="room_' + roomID + '" data-room_id="' + roomID + '"><th class="roomID">'+ roomID + '</th><th class="roomName">' + roomName + '</th></tr>')
    $('#room_'+ roomID).click(function() {
        var room_id = $(this).data('room_id');
    })
}