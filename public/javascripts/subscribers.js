var socket = io();

$(document).ready(function(){

    $('.publisher').click(function(){ window.location='subs'});
    $('#backRooms').click(function(){ window.location='/'});
    $('#backStreams').click(function(){ window.location='/room?room_id=' + roomID});

    $('#subscriberModal').on('show.bs.modal', function (event) {
      var subscriber = $(event.relatedTarget);
      var userName = subscriber.data('username');
      var modal = $(this)
      $('#username').html(" " + userName);
    })
    $('#searchBar').keyup(function () {
        var filter_array = new Array();
        var filter = this.value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array

        $('.subscriberContainer').each(function() {
            /* cache a reference to the current .media (you're using it twice) */
            var _this = $(this);
            var title = _this.find('#subName').text().toLowerCase();

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

socket.on('newEvent', function(evt) {
    var event = evt.event;
    var rooms = evt.rooms;
    var listStreams = evt.streams;
    var users = evt.users;
    var room = event.roomID;
    var streamID = getMyStream();

    $('#subscribers').html("");
    $('#others').html("");
    $('#selected').html("");

    if (rooms[room]) {
        if (listStreams[streamID]) {
            for (var s in listStreams[streamID]["subscribers"]) {
                var userID = listStreams[streamID]["subscribers"][s];
                var userName = users[userID]["userName"];
                createNewSubscriber(userID, userName);
            }
            updateNSubscribers(listStreams[streamID]["subscribers"].length);

        } else {
            updateNamePublisher("Publisher not found");
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
        updateNamePublisher("Publisher not found");
    }



    
});


var createNewSubscriber = function(userID, userName){
    $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 subscriberContainer" data-toggle="modal" data-target="#subscriberModal" data-username="' + userName + '" id="sub_' + userID +'"><div class="fa fa-circle green"></div><div id="subName">' + userName +'</div></div>');
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
    $('#selected').append('<div class="col-lg-3 publisherCol selected" id="pub_' + streamID +'" data-pub_id="' + streamID +'"><div class="fa fa-circle green"></div><div id="pubNameCarousel">' + userName + '</div></div>');

    $('#pub_'+ streamID).click(function() {
    var pub_id = $(this).data('pub_id');

    if (pub_id != undefined || pub_id != null) {
        window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
    }
})
}
