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
    var event = evt.event;
    var rooms = evt.rooms;
    var streams = evt.streams;
    var users = evt.users;
    var room = event.roomID;

    $('#publishers').html("");
    if (rooms[room]) {
        for (var s in rooms[room]["streams"]) {
            if (!$('#pub_'+rooms[room]["streams"][s]).length){
                var streamID = rooms[room]["streams"][s];
                var nSubscribers = streams[streamID]["subscribers"].length;
                var userName = streams[streamID]["userName"];
                createNewPublisher(streamID, nSubscribers, userName);
            } else {
                var streamID = rooms[room]["streams"][s];
                var nSubscribers = streams[streamID]["subscribers"].length;
                updateNSubscribers(streamID, nSubscribers);
            }
        }
    }


    
});


var createNewPublisher = function(streamID, nSubscribers, userName){
    $('#publishers').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 col-min col-max"><div class="publisher" id="pub_' + streamID + '"><p><div id="pubName"><span class="fa fa-circle green"></span> ' + userName +'</div></p><p><div id="pubId">' + streamID +'</div></p><div id="subsInPub"><div id="subscribers"><span id="number" class="bold">' + nSubscribers + '</span> <span class="light">SUBSCRIBERS</span> <span class="fa fa-users"></span></div></div></div></div>')
    

}

var updateNSubscribers = function(streamID, nSubscribers){
    $('#pub_' + streamID + ' #subscribers ' + '#number').html(nSubscribers);
}
var paintPublishers = function(room, streams, users) {
    if (room == "undefined") {
        console.log("EMPTY ROOM");
    }
    var roomStreams = room["streams"];
    for (var stream in roomStreams){
        var streamID = roomStreams[stream];
        var nSubscribers = streams[roomStreams[stream]]["subscribers"].length;
        var userName = streams[roomStreams[stream]]["userName"];
        createNewPublisher(streamID, nSubscribers, userName);
    }
   
}
