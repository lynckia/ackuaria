var socket = io();

$(document).ready(function(){

    $('#back').click(function(){ window.location='/'});
    $('#searchBar').keyup(function () {
        var filter_array = new Array();
        var filter = this.value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array

        $('.publisherContainer').each(function() {
            /* cache a reference to the current .media (you're using it twice) */
            var _this = $(this);
            var title = _this.find('#pubName').text().toLowerCase();

            /* 
                title and filter are normalized in lowerCase letters
                for a case insensitive search
             */

            var hidden = 0; // Set a flag to see if a div was hidden

            // Loop through all the words in the array and hide the div if found
            for (var i = 0; i < arrayLength; i++) {
                 if (title.indexOf(filter_array[i]) < 0) {
                    _this.hide();
                    hidden = 1;
                }
            }
            // If the flag hasn't been tripped show the div
            if (hidden == 0)  {
               _this.show();
            }
        });
    });

    $('#list').click(function() {


        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');


        $('#cuadr').addClass('btn-default');
        $('#cuadr').removeClass('active');
        $('#cuadr').removeClass('btn-primary');
           
    });

    $('#cuadr').click(function() {


        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');


        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
           
    });
});

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
            
            var streamID = rooms[room]["streams"][s];
            var nSubscribers = streams[streamID]["subscribers"].length;
            var userName = streams[streamID]["userName"];
            createNewPublisher(room, streamID, nSubscribers, userName);
           
        }
        updateNStreams(rooms[room]["streams"].length);
    } else {
        updateNStreams(0);
    }


    
});

//CREAR FUNCIÓN PARA VACÍAR HTML

var createNewPublisher = function(roomID, streamID, nSubscribers, userName){
    $('#publishers').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 publisherContainer"><div class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><p><div id="pubName"><span class="fa fa-circle green"></span> ' + userName +'</div></p><p><div id="pubId">' + streamID +'</div></p><div id="subsInPub"><div id="subscribers"><span id="number" class="bold">' + nSubscribers + '</span> <span class="light">SUBSCRIBERS</span> <span class="fa fa-users"></span></div></div></div></div>')
    $('#pub_'+ streamID).click(function() {
    var pub_id = $(this).data('pub_id');

    if (pub_id != undefined || pub_id != null) {
        window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
    }
})

}

var updateNSubscribers = function(streamID, nSubscribers){
    $('#pub_' + streamID + ' #subscribers ' + '#number').html(nSubscribers);
}
var updateNStreams = function(nStreams) {
    $('#numberStreams').html(nStreams);

}
var paintPublishers = function(roomID, rooms, streams, users) {
    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        var nStreams = rooms[roomID]["streams"].length;
        updateNStreams(nStreams);
        for (var stream in roomStreams){
            var streamID = roomStreams[stream];
            var nSubscribers = streams[roomStreams[stream]]["subscribers"].length;
            var userName = streams[roomStreams[stream]]["userName"];
            createNewPublisher(roomID, streamID, nSubscribers, userName);
        }
    } else updateNStreams(0);

}
