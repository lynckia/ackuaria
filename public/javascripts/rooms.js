var socket = io();

var hasPublishers = function() {
    var totalDivs = document.getElementsByTagName('div');

    for (var i = 0; i < totalDivs.length; i++) {
        var div = totalDivs[i];
        if (div.className == "publisher") {
            return true;

        }
    }
    return false;
}


// PUBLISH EVENT
var updateEventPublish = function(evt) {
    var roomID = evt.room;
    var streamID = evt.stream;
    var userID = evt.user;
    
}

// SUBSCRIBE EVENT
var updateEventSubscribe = function(evt) {

    createNewSubscriber(evt.user, evt.stream, evt.name);

}

// UNPUBLISH EVENT
var updateEventUnpublish = function(evt) {

    removePublisher(evt.stream, evt.room);

    removeSubscriber(evt.user);

    if (!document.getElementById('pubsList_' + evt.room).hasChildNodes()){
        removeRoom(evt.room);
    }
}

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
    var rooms = evt.rooms;
    $('#rooms').html("");

    for (var room in rooms) {
        if (!$('#room_'+room).length){
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            var roomName = rooms[room]["roomName"];
            createNewRoom(roomID, nStreams, roomName);
        } else {
            var roomID = room;
            var nStreams = rooms[room]["nStreams"];
            updateNStreams(roomID, nStreams);
        }
    }

    
});


var createNewRoom = function(roomID, nStreams, roomName){
    $('#rooms').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 col-min col-centered"><div class="room" id="room_' + roomID + '"data-room_id="' + roomID + '"><p><div id="roomName">' + roomName + '</div></p><p><div id="roomId">' + roomID + '</div></p><div id="streamsInRoom"><div id="streams"><span id="number" class="bold">' + nStreams + '</span> <span class="light">STREAMS</span> <span class="fa fa-user"></span></div></div></div></div>');
    $('#room_'+ roomID).click(function() {
    var room_id = $(this).data('room_id');
    if (room_id != undefined || room_id != null) {
        window.location = '/room?room_id=' + room_id;
    }
    })
}

var updateNStreams = function(roomID, nStreams){
    $('#room_' + roomID + ' #streams ' + '#number').html(nStreams);
}

var paintRooms = function(rooms) {
    for (var room in rooms) {
        var roomID = room;
        var nStreams = rooms[room]["nStreams"];
        var roomName = rooms[room]["roomName"];
        createNewRoom(roomID, nStreams, roomName);
    }
   
}