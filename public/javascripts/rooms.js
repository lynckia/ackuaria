var socket = io();

$(document).ready(function(){

    $('#searchBar').keyup(function () {
        var filter_array = new Array();
        var filter = this.value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array

        $('.roomContainer').each(function() {
            /* cache a reference to the current .media (you're using it twice) */
            var _this = $(this);
            var title = _this.find('#roomName').text().toLowerCase();

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
    var rooms = evt.rooms;
    var nRooms = Object.keys(rooms).length
    updateNRooms(nRooms);
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
    $('#rooms').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 roomContainer"><div class="room" id="room_' + roomID + '"data-room_id="' + roomID + '"><p><div id="roomName">' + roomName + '</div></p><p><div id="roomId">' + roomID + '</div></p><div id="streamsInRoom"><div id="streams"><span id="number" class="bold">' + nStreams + '</span> <span class="light">STREAMS</span> <span class="fa fa-user"></span></div></div></div></div>');
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

var updateNRooms = function(nRooms) {
    $('#numberRooms').html(nRooms);

}

var paintRooms = function(rooms) {
    var nRooms = Object.keys(rooms).length
    updateNRooms(nRooms);
    for (var room in rooms) {
        var roomID = room;
        var nStreams = rooms[room]["nStreams"];
        var roomName = rooms[room]["roomName"];
        createNewRoom(roomID, nStreams, roomName);
    }
   
}