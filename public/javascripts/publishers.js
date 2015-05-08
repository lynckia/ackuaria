var socket = io();
var show_grid = true;

$(document).ready(function(){

    $('#back').click(function(){ window.location='/'});

    $('#searchBar').keyup(function () {
        search();
    });

    var search = function() {
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here
        filter_array = filter.split(' '); // split the user input at the spaces
        var arrayLength = filter_array.length; // Get the length of the filter array

        if (show_grid) {
            $('.publisherContainer').each(function() {
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
    }

    $('#list').click(function() {
        if (!$(this).hasClass("active")){
            show_grid = false;
            paintPublishersList();
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
            paintPublishersGrid();
            search();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
           
    });
});

var stateToColor = function(state) {
    var color;
    switch (state) {
        case 500:
            color = "red";
            break;
        case 104:
            color = "green";
            break;
        default:
            color = "orange";
            break;
    }
    return color;
}

var updateEventStatus = function(streamID, state) {
    var color = stateToColor(state);

    $("#conn_state_" + streamID).removeClass('green');
    $("#conn_state_" + streamID).removeClass('orange');
    $("#conn_state_" + streamID).removeClass('red');

    $("#conn_state_" + streamID).addClass(color);
}

socket.on('newEvent', function(evt) {
    var event = evt.event;
    rooms = evt.rooms;
    streams = evt.streams;
    users = evt.users;
    roomID = event.roomID;
    states = evt.states;
    if (show_grid) paintPublishersGrid();
    else paintPublishersList();
});


var paintPublishersGrid = function() {
    $('#publishers').html("");
    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        var nStreams = rooms[roomID]["streams"].length;
        updateNStreams(nStreams);
        for (var stream in roomStreams){
            var streamID = roomStreams[stream];
            var nSubscribers = streams[roomStreams[stream]]["subscribers"].length;
            var userName = streams[roomStreams[stream]]["userName"];
            var state = states[streamID].state;
            createNewPublisherGrid(roomID, streamID, nSubscribers, userName, state);
        }
        updateNStreams(rooms[roomID]["streams"].length);

    } else {
        updateNStreams(0);
    }
}

var paintPublishersList = function() {
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
            var state = states[streamID].state;
            createNewPublisherList(roomID, streamID, nSubscribers, userName, state);
        }
        updateNStreams(rooms[roomID]["streams"].length);

    } else updateNStreams(0);
}

var createNewPublisherGrid = function(roomID, streamID, nSubscribers, userName, state){
    var color = stateToColor(state);
    $('#publishers').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 publisherContainer show_grid"><div class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><p><div class="pubName"><span id="conn_state_' + streamID + '" class="status fa fa-circle ' + color + '"></span> ' + userName +'</div></p><p><div class="pubId">' + streamID +'</div></p><div class="subsInPub"><div class="subscribers"><span id="number" class="bold">' + nSubscribers + '</span> <span class="light">SUBSCRIBERS</span> <span class="fa fa-users"></span></div></div></div></div>')
    $('#pub_'+ streamID).click(function() {
        var pub_id = $(this).data('pub_id');
        if (pub_id != undefined || pub_id != null) {
            window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
        }
    })
}

var createNewPublisherList = function(roomID, streamID, nSubscribers, userName, state){
    var color = stateToColor(state);
    $('#bodyTable').append('<tr class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><th>' + streamID + '</th><th class="pubName">' + userName + '</th><th><span class="status fa fa-circle ' + color + '"></th><th>' + nSubscribers + '</th></tr>');
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