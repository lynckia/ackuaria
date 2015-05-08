var socket = io();
var show_grid = true;
$(document).ready(function(){

    //Śearch bar code
    $('#searchBar').keyup(function () {
        var filter_array = new Array();
        var filter = this.value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array
        if (show_grid) {
            $('.roomContainer').each(function() {
                var _this = $(this);
                var title = _this.find('.roomName').text().toLowerCase();
                var hidden = 0;
                for (var i = 0; i < arrayLength; i++) {
                     if (title.indexOf(filter_array[i]) < 0) {
                        _this.hide();
                        hidden = 1;
                    }
                }
                if (hidden == 0)  {
                   _this.show();
                }
            });
        } else {
            $('.room').each(function() {
                var _this = $(this);
                var title = _this.find('.roomName').text().toLowerCase();
                var hidden = 0;
                for (var i = 0; i < arrayLength; i++) {
                     if (title.indexOf(filter_array[i]) < 0) {
                        _this.hide();
                        hidden = 1;
                    }
                }
                if (hidden == 0)  {
                   _this.show();
                }
            });
        }
    });

    // Grid/List switch
    $('#list').click(function() {

        if (!$(this).hasClass("active")){
            show_grid = false;
            paintRoomsList(rooms);
        }


        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');


        $('#grid').addClass('btn-default');
        $('#grid').removeClass('active');
        $('#grid').removeClass('btn-primary');
           
    });

    $('#grid').click(function() {
        if (!$(this).hasClass("active")){
            show_grid = true;
            console.log(rooms);
            paintRoomsGrid(rooms);
        }

        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');


        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
           
    });

})

var updateEventStatus = function(evt) {

    var id = evt.subs ? evt.subs + '_' + evt.pub : evt.pub;
    $("#con_state_" + id).removeClass();

    switch (evt.status) {

        case 500:
            $("#con_state_" + id).addClass('status_point fail');
            break;

        case 103:
            $("#con_state_" + id).addClass('status_point ready');
            break;

        default:
            $("#con_state_" + id).addClass('status_point started');
            break;
    }


}


var createStatus = function(id, status) {

        $("#con_state_" + id).removeClass();

        switch (status) {

            case 500:
                $("#con_state_" + id).addClass('status_point fail');
                break;

            case 103:
                $("#con_state_" + id).addClass('status_point ready');
                break;


            default:
                $("#con_state_" + id).addClass('status_point started');
                break;
        }

    }


socket.on('newEvent', function(evt) {
    rooms = evt.rooms;
    if (show_grid){
        paintRoomsGrid();
    } else {
        paintRoomsList();
    }
});

var paintRoomsGrid = function(){
    $('#rooms').html("");
    var nRooms = Object.keys(rooms).length
    updateNRooms(nRooms);
    for (var room in rooms) {
        if (!$('#room_'+room).length){
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            var roomName = rooms[room]["roomName"];
            createNewRoomGrid(roomID, nStreams, roomName);
        } else {
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            updateNStreams(roomID, nStreams);
        }
    }
};

var paintRoomsList = function(){
    $('#rooms').html("");
    var nRooms = Object.keys(rooms).length
    updateNRooms(nRooms);
    $('#rooms').append('<div class="roomContainer show_list"><table class="table table-hover"><thead><tr><th class="col-md-4">ID</th><th class="col-md-4">Room Name</th><th class="col-md-4">Streams in Room</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
    for (var room in rooms) {
        if (!$('#room_'+room).length){
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            var roomName = rooms[room]["roomName"];
            createNewRoomList(roomID, nStreams, roomName);        
        } else {
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            updateNStreams(roomID, nStreams);
        }
    }

};


var createNewRoomGrid = function(roomID, nStreams, roomName){
    $('#rooms').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 roomContainer show_grid"><div class="room" id="room_' + roomID + '"data-room_id="' + roomID + '"><p><div class="roomName">' + roomName + '</div></p><p><div class="roomId">' + roomID + '</div></p><div class="streamsInRoom"><div class="streams"><span id="number" class="bold">' + nStreams + '</span> <span class="light">STREAMS</span> <span class="fa fa-user"></span></div></div></div></div>');
    $('#room_'+ roomID).click(function() {
    var room_id = $(this).data('room_id');
    if (room_id != undefined || room_id != null) {
        window.location = '/room?room_id=' + room_id;
    }
    })
}

var createNewRoomList = function(roomID, nStreams, roomName, last){
    $('#bodyTable').append('<tr class="room" id="room_' + roomID + '" data-room_id="' + roomID + '"><th>'+ roomID + '</th><th class="roomName">' + roomName + '</th><th id="number">' + nStreams + '</th></tr>')
    $('#room_'+ roomID).click(function() {
    var room_id = $(this).data('room_id');
    if (room_id != undefined || room_id != null) {
        window.location = '/room?room_id=' + room_id;
    }
    })
}

var updateNStreams = function(roomID, nStreams){
    $('#room_' + roomID + ' .streams ' + '#number').html(nStreams);
}

var updateNRooms = function(nRooms) {
    $('#numberRooms').html(nRooms);

}
