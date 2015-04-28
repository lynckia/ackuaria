var socket = io();
var show_grid = true;
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
        search();
    });


    $('#list').click(function() {
        if (!$(this).hasClass("active")){
            show_grid = false;
            paintSubscribersList(streamID, roomID, rooms, streams, users);
            search();
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
            paintSubscribersGrid(streamID, roomID, rooms, streams, users);
            search();
        }

        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
           
    });

    var search = function(){

        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array
        if (show_grid){
            $('.subscriberContainer').each(function() {
                var _this = $(this);
                var title = _this.find('.subName').text().toLowerCase();
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
            $('.subscriber').each(function() {
            var _this = $(this);
            var title = _this.find('.subName').text().toLowerCase();
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
    }
    
})

socket.on('newEvent', function(evt) {
    var event = evt.event;
    rooms = evt.rooms;
    streams = evt.streams;
    users = evt.users;
    roomID = event.roomID;

    $('#others').html("");
    $('#selected').html("");

    if (rooms[roomID]) {
        if (show_grid) paintSubscribersGrid(streamID, roomID, rooms, streams, users);
        else paintSubscribersList(streamID, roomID, rooms, streams, users);

        paintPublishers(streamID, roomID, rooms, streams, users);
    } else {
        updateNSubscribers(0)
        updateNamePublisher("Room not found");
    }    
});



var paintSubscribersGrid = function(streamID, roomID, rooms, streams, users) {
    $('#subscribers').html("");

    if (rooms[roomID] && streams[streamID]) {
        var subscribers = streams[streamID]["subscribers"];
        var nSubscribers = streams[streamID]["subscribers"].length;
        updateNSubscribers(nSubscribers);
        for (var sub in subscribers){
            var userID = subscribers[sub];
            var userName = users[userID]["userName"];
            createNewSubscriberGrid(userID, userName);
        }
    } else {
        updateNamePublisher("Publisher not found");
        updateNSubscribers(0);
    }
}

var paintSubscribersList = function(streamID, roomID, rooms, streams, users) {
    $('#subscribers').html("");
    $('#subscribers').append('<div class="subscriberContainer show_list"><table class="table table-hover"><thead><tr><th class="col-md-6">User ID</th><th class="col-md-4">User name</th><th class="col-md-2">Status</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
    if (rooms[roomID] && streams[streamID]) {
        var subscribers = streams[streamID]["subscribers"];
        var nSubscribers = streams[streamID]["subscribers"].length;
        updateNSubscribers(nSubscribers);
        for (var sub in subscribers){
            var userID = subscribers[sub];
            var userName = users[userID]["userName"];
            createNewSubscriberList(userID, userName);
        }
    } else {
        updateNamePublisher("Publisher not found");
        updateNSubscribers(0);
    }
}


var createNewSubscriberGrid = function(userID, userName){
    $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 subscriberContainer show_grid" data-toggle="modal" data-target="#subscriberModal" data-username="' + userName + '" id="sub_' + userID +'"><div class="fa fa-circle green"></div><div class="subName">' + userName +'</div></div>');
}
var createNewSubscriberList = function(userID, userName){
    $('#bodyTable').append('<tr id="sub_' + userID + '" class="subscriber" data-toggle="modal" data-target="#subscriberModal" data-username="' + userName + '" ><th class="subId">' + userID + '</th><th class="subname">' + userName + '</th><th class="status"><span class="fa fa-circle green"></span></th></tr>');
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

var updateNSubscribers = function(nSubscribers){
    $('#numberSubs').html(nSubscribers);
}

var updateNamePublisher = function(name) {
        $('#pubName').html(name);

}