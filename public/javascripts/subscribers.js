var socket = io();


socket.on('newEvent', function(evt) {
    var event = evt.event;
    var rooms = evt.rooms;
    var listStreams = evt.streams;
    var users = evt.users;
    var room = event.roomID;
    var streamID = getMyStream();

    $('#subscribers').html("");
    $('#others').html("");
    $('#active').html("");

    if (rooms[room]) {
        if (listStreams[streamID]) {
            for (var s in listStreams[streamID]["subscribers"]) {
                var userID = listStreams[streamID]["subscribers"][s];
                var userName = users[userID]["userName"];
                createNewSubscriber(userID, userName);
            }
            updateNSubscribers(listStreams[streamID]["subscribers"].length);

        } else {
            updateNamePublisher("Disconnected");
            updateNSubscribers(0);
        }

        for (var stream in listStreams){
            var userName = listStreams[stream]["userName"];
            if (stream == streamID) {
                createMyPublisher(room, streamID, userName);
            }
            else {
                createNewPublisher(room, streamID, userName);
            }
            //DEBERIA SER STREAMID???
        }
    } else {
        updateNSubscribers(0)
        updateNamePublisher("Disconnected");
    }



    
});


var createNewSubscriber = function(userID, userName){
    $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 col-min col-max subscriberCol" data-toggle="modal" data-target="#subscriberModal" id="sub_' + userID +'"><div class="fa fa-circle green"></div><div id="subName">' + userName +'</div></div>');
}



var updateNSubscribers = function(nSubscribers){
    $('#numberSubs').html(nSubscribers);
}

var updateNamePublisher = function(name) {
        $('#pubName').html(name);

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

var paintPublishers = function(streamID, roomID, rooms, streams, users) {
    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        for (var stream in roomStreams){

            if (streamID != roomStreams[stream]) {
                var userName = streams[roomStreams[stream]]["userName"];
                createNewPublisher(roomID, roomStreams[stream], userName);
            } else {
                var userName = streams[roomStreams[stream]]["userName"];
                createMyPublisher(roomID, roomStreams[stream], userName);
            }
        }
    }

}

var createNewPublisher = function(roomID, streamID, userName){
    $('#others').append('<div class="col-lg-3 publisherCol" id="pub_' + streamID +'"data-pub_id="' + streamID +'"><div class="fa fa-circle green"></div><div id="pubNameCarousel">' + userName + '</div></div>');

    $('#pub_'+ streamID).click(function() {

    var pub_id = $(this).data('pub_id');

    if (pub_id != undefined || pub_id != null) {
        window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
    }
})
}

var createMyPublisher = function(roomID, streamID, userName){
    $('#active').append('<div class="col-lg-3 publisherCol active" id="pub_' + streamID +'" data-pub_id="' + streamID +'"><div class="fa fa-circle green"></div><div id="pubNameCarousel">' + userName + '</div></div>');

    $('#pub_'+ streamID).click(function() {
    var pub_id = $(this).data('pub_id');

    if (pub_id != undefined || pub_id != null) {
        window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
    }
})
}
