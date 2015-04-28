var socket = io();
var show_grid = true;
$(document).ready(function(){

    $('#back').click(function(){ window.location='/'});
    $('#searchBar').keyup(function () {
        var filter_array = new Array();
        var filter = this.value.toLowerCase();  // no need to call jQuery here

        filter_array = filter.split(' '); // split the user input at the spaces

        var arrayLength = filter_array.length; // Get the length of the filter array

        if (show_grid) {
            $('.publisherContainer').each(function() {
                console.log("fñlasjfñlasjfa");
                var _this = $(this);
                var title = _this.find('.pubName').text().toLowerCase();
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
            $('.publisher').each(function() {
                var _this = $(this);
                var title = _this.find('.pubName').text().toLowerCase();
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

    $('#list').click(function() {

        if (!$(this).hasClass("active")){
            show_grid = false;
            paintPublishersList(roomID, rooms, streams, users);
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
            paintPublishersGrid(roomID, rooms, streams, users);
        }
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
    rooms = evt.rooms;
    streams = evt.streams;
    users = evt.users;
    roomID = event.roomID;

    if (show_grid) paintPublishersGrid(roomID, rooms, streams, users);
    else paintPublishersList(roomID, rooms, streams, users);
    
});

var paintPublishersGrid = function(roomID, rooms, streams, users) {
    $('#publishers').html("");
    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        var nStreams = rooms[roomID]["streams"].length;
        updateNStreams(nStreams);
        for (var stream in roomStreams){
            var streamID = roomStreams[stream];
            var nSubscribers = streams[roomStreams[stream]]["subscribers"].length;
            var userName = streams[roomStreams[stream]]["userName"];
            createNewPublisherGrid(roomID, streamID, nSubscribers, userName);
        }
        updateNStreams(rooms[roomID]["streams"].length);

    } else updateNStreams(0);
}

var paintPublishersList = function(roomID, rooms, streams, users) {
    $('#publishers').html("");
    $('#publishers').append('<div class="publisherContainer show_list"><table class="table table-hover"><thead><tr><th class="col-md-4">User ID</th><th class="col-md-4">User Name</th><th class="col-md-2">Publisher Status</th><th class="col-md-2">Number of subscribers</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');

    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        var nStreams = rooms[roomID]["streams"].length;
        updateNStreams(nStreams);
        for (var stream in roomStreams){
            var streamID = roomStreams[stream];
            var nSubscribers = streams[roomStreams[stream]]["subscribers"].length;
            var userName = streams[roomStreams[stream]]["userName"];
            createNewPublisherList(roomID, streamID, nSubscribers, userName);
        }
        updateNStreams(rooms[roomID]["streams"].length);

    } else updateNStreams(0);
}


var createNewPublisherGrid = function(roomID, streamID, nSubscribers, userName){
    $('#publishers').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 publisherContainer show_grid"><div class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><p><div class="pubName"><span class="status fa fa-circle green"></span> ' + userName +'</div></p><p><div class="pubId">' + streamID +'</div></p><div class="subsInPub"><div class="subscribers"><span id="number" class="bold">' + nSubscribers + '</span> <span class="light">SUBSCRIBERS</span> <span class="fa fa-users"></span></div></div></div></div>')
    $('#pub_'+ streamID).click(function() {
        var pub_id = $(this).data('pub_id');
        if (pub_id != undefined || pub_id != null) {
            window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
        }
    })

}

var createNewPublisherList = function(roomID, streamID, nSubscribers, userName){
    $('#bodyTable').append('<tr class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><th>' + streamID + '</th><th class="pubName">' + userName + '</th><th><span class="status fa fa-circle green"></th><th>' + nSubscribers + '</th></tr>');
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
