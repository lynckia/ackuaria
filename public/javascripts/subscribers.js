var socket = io();


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
    var stream = event.streamID;

    $('#subscribers').html("");

    if (rooms[room] && streams[streamID] ) {
        for (var s in streams[streamID]["subscribers"]) {
            var userID = streams[streamID]["subscribers"][s];
            var userName = users[userID]["userName"];
            createNewSubscriber(userID, userName);
        }
        updateNSubscribers(streams[streamID]["subscribers"].length);
    } else {
        updateNSubscribers(0);
    }


    
});


var createNewSubscriber = function(userID, userName){
    $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 col-min col-max subscriberCol" data-toggle="modal" data-target="#subscriberModal" id="sub_' + userID +'"><div class="fa fa-circle green"></div><div id="subName">' + userName +'</div></div>');
}



var updateNSubscribers = function(nSubscribers){
    $('#numberSubs').html(nSubscribers);
}


var paintSubscribers = function(streamID, roomID, rooms, streams, users) {
    if (rooms[roomID] && streams[streamID]) {

        var subscribers = streams[streamID]["subscribers"];
        var nSubscribers = streams[streamID]["subscribers"].length;
        updateNSubscribers(nSubscribers);

        for (var sub in subscribers){
            var userID = subscribers[sub];
            var userName = users[userID]["userName"];
            createNewSubscriber(userID, userName);
        }
    } else updateNSubscribers(0);


}