var socket = io();
var view_type = "grid";

$(document).ready(function(){

    $("#removeFails").click(function(){
        var route = "/delete/" + roomID;
        $.post(route, function(newRoom){
            room = newRoom;
            paintPublishersFails();
            $('#publishers').html('<div class="alert alert-danger" role="alert"><strong>Done! Removed all failed streams in this room</strong></div>')

        });
    });

    $('#back').click(function(){ window.location='/ackuaria/agents'});
    $('#publisherModal').on('show.bs.modal', function (event) {
      var publisher = $(event.relatedTarget);
      var streamID = publisher.data('streamid');
      var oldSDP = "";
      var sdp = "";
      for (var f in room.failed) {
        if (room.failed[f].streamID == streamID){
            oldSDP = room.failed[f].sdp;
            if (oldSDP) {
                sdp = oldSDP.replace(/(?:\r\n|\r|\n)/g, '<br />');
            } else {
                sdp = "No SDP found for this failed stream"
            }
        }
      }
      var userName = publisher.data('username');
      var subID = publisher.data('subid');
      $('#username').html(" " + userName);
      $('#userid').html(" " + subID);
      $('#dataModal').html(sdp);

    })
    $('#searchBar').keyup(function () {
        search();
    });

    var search = function() {
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here
        filter_array = filter.split(' '); // split the user input at the spaces
        var arrayLength = filter_array.length; // Get the length of the filter array

        if (view_type == "grid" || view_type == "failed") {
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
            view_type = "list";
            paintPublishersList();
            search();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#grid').addClass('btn-default');
        $('#grid').removeClass('active');
        $('#grid').removeClass('btn-primary');

        $('#fails').addClass('btn-default');
        $('#fails').removeClass('active');
        $('#fails').removeClass('btn-primary');
           
        $('#removeFails').hide();
    });

    $('#grid').click(function() {
        if (!$(this).hasClass("active")){
            view_type = "grid";
            paintPublishersGrid();
            search();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');

        $('#fails').addClass('btn-default');
        $('#fails').removeClass('active');
        $('#fails').removeClass('btn-primary');
        
        $('#removeFails').hide();
    });
    $('#fails').click(function() {
        if (!$(this).hasClass("active")){
            view_type = "failed";
            paintPublishersFails();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');

        $('#grid').addClass('btn-default');
        $('#grid').removeClass('active');
        $('#grid').removeClass('btn-primary');

        $('#removeFails').show();
           
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
    var rooms = evt.rooms;
    room = rooms[roomID];

    streams =  {};
    var totalStreams = evt.streams;
    for (var s in totalStreams){
        if (room.streams.indexOf(parseInt(s)) > -1) {
         streams[s] = totalStreams[s];
        }
    }

    states = {};
    var totalStates = evt.states;
    for (var s in totalStates){
        if (room.streams.indexOf(parseInt(s)) > -1) {
         states[s] = totalStates[s];
        }
    }

    if (view_type == "grid") paintPublishersGrid();
    else if (view_type == "list") paintPublishersList();
    else paintPublishersFails();

    updateAlerts();
});


var paintPublishersGrid = function() {
    if (agent) {
        $('#publishers').html("");
        var nStreams = streams.length;
        updateNStreams(nStreams);
        for (var streamID in streams){
            if (streams[streamID] !== undefined) {
                var roomID = streams[streamID].roomID;
                var nSubscribers = streams[streamID].subscribers.length;
                var userName = streams[streamID].userName;
                createNewPublisherGrid(roomID, streamID, nSubscribers, userName);
            }
        }
        if (nStreams == 0) {
            $('#publishers').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no publishers in this agent right now</strong></div>')
        }
    }

}

var paintPublishersList = function() {
    if (agent) {
        $('#publishers').html("");
        $('#publishers').append('<div class="publisherContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-4">User ID</th><th class="col-md-4">User Name</th><th class="col-md-2">Publisher Status</th><th class="col-md-2">Number of subscribers</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
        var nStreams = streams.length;
        updateNStreams(nStreams);
        for (var streamID in streams){
            if (streams[streamID] !== undefined) {
                var roomID = streams[streamID].roomID;
                var nSubscribers = streams[streamID].subscribers.length;
                var userName = streams[streamID].userName;
                createNewPublisherList(roomID, streamID, nSubscribers, userName);
            }
        }
        if (nStreams == 0) {
            $('#publishers').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no publishers in this agent right now</strong></div>')
        }
        Sortable.init()
    }
}

var createNewPublisherGrid = function(roomID, streamID, nSubscribers, userName){
    var color = stateToColor(104);
    $('#publishers').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 publisherContainer show_grid"><div class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><p><div class="pubName"><span id="conn_state_' + streamID + '" class="status fa fa-circle ' + color + '"></span> ' + userName +'</div></p><p><div class="pubId">' + streamID +'</div></p><div class="subsInPub"><div class="subscribers"><span id="number" class="bold">' + nSubscribers + '</span> <span class="light">SUBSCRIBERS</span> <span class="fa fa-users"></span></div></div></div></div>')
    $('#pub_'+ streamID).click(function() {
        var pub_id = $(this).data('pub_id');
        if (pub_id != undefined || pub_id != null) {
            window.location = '/ackuaria/pub?pub_id=' + pub_id + '&room_id='+ roomID;
        }
    })
}

var createNewPublisherList = function(roomID, streamID, nSubscribers, userName){
    var color = stateToColor(104);
    $('#bodyTable').append('<tr class="publisher" id="pub_' + streamID + '" data-pub_id="' + streamID + '"><th class="pubId">' + streamID + '</th><th class="pubName">' + userName + '</th><th><span class="status fa fa-circle ' + color + '"></th><th id="subsInPub">' + nSubscribers + '</th></tr>');
    $('#pub_'+ streamID).click(function() {
        var pub_id = $(this).data('pub_id');
        if (pub_id != undefined || pub_id != null) {
            window.location = '/ackuaria/pub?pub_id=' + pub_id + '&room_id='+ roomID;
        }
    })
}

var updateNSubscribers = function(streamID, nSubscribers){
    $('#pub_' + streamID + ' #subscribers ' + '#number').html(nSubscribers);
}
var updateNStreams = function(nStreams) {
    $('#numberStreams').html(nStreams);
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})