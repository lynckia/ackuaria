var socket = io();
var show_grid = true;

var stream_ssrc, audio, video;
var subscribers = {};
var sub_modal_now;

socket.on('newEvent', function(evt) {
    var event = evt.event;
    rooms = evt.rooms;
    streams = evt.streams;
    users = evt.users;
    roomID = event.roomID;
    states = evt.states;

    $('#others').html("");
    $('#selected').html("");

    if (rooms[roomID]) {
        if (show_grid) paintSubscribersGrid();
        else paintSubscribersList();

        paintPublishers();
    } else {
        updateNSubscribers(0)
        updateNamePublisher("Room not found");
    }

    if (sub_modal_now == event.subID) updateModalState(event.subID);
});

socket.on('newSR', function(evt) {
    var event = evt.event;
    var pubID = event.pub;
    audio = evt.audio;
    video = evt.video;
    stream_ssrc = evt.stream_ssrc;
    if (pubID == streamID && audio && video){
        stream_ssrc = evt.stream_ssrc;
        $('#videoSSRC').html(video.ssrc);
        $('#audioSSRC').html(audio.ssrc);
      
        $('#videoBytesSent').html(video.rtcpBytesSent);
        $('#audioBytesSent').html(audio.rtcpBytesSent);

        $('#videoPacketsSent').html(video.rtcpPacketSent);
        $('#audioPacketsSent').html(audio.rtcpPacketSent);
        
    }
});

socket.on('newRR', function(evt) {
    var event = evt.event;
    var audio = evt.audio;
    var video = evt.video;
    var pubID = event.pub;
    var subID = event.subs;
    var stats = {"audio": audio, "video": video};
    if (pubID == streamID) {
        if (!subscribers[subID]){
            subscribers[subID] = [stats];
        } else if (subscribers[subID] && subscribers[subID].length < 10) {
            subscribers[subID].unshift(stats);
        } else {
            subscribers[subID].pop();
            subscribers[subID].unshift(stats);
        }
        if (sub_modal_now == subID && audio && video) {
            updateRR(subID, audio, video);

        }
    }

});
var updateModalState = function(subID) {
    var color, state;
    if (states[streamID]) state = states[streamID].subscribers[subID];
    if (!users[subID]){
        $('#username').html(" User disconnected");

    }

    switch (state) {
        case 103:
            color = "orange";
            break;
        case 104:
            color = "green";
            break;
        default:
            color = "red";
            break;
    }
      $('#subState').removeClass('green');
      $('#subState').removeClass('orange');
      $('#subState').removeClass('red');
      $('#subState').addClass(color);

}
var updateRR = function(subID, audio, video) {
    $('#dataModal #videoSSRC').html(video.ssrc);
    $('#dataModal #audioSSRC').html(audio.ssrc);
  
    $('#dataModal #pli').html(video.PLI);
    $('#dataModal #videoBandwidth').html(video.bandwidth);

    $('#dataModal #videoFractionLost').html(video.fractionLost);
    $('#dataModal #audioFractionLost').html(audio.fractionLost);

    $('#dataModal #videoJitter').html(video.jitter);
    $('#dataModal #audioJitter').html(audio.jitter);

    $('#dataModal #videoPacketsLost').html(video.packetsLost);
    $('#dataModal #audioPacketsLost').html(audio.packetsLost);

    $('#dataModal #videoSourceSSRC').html(video.sourceSsrc);
    $('#dataModal #audioSourceSSRC').html(audio.sourceSsrc);
}

$(document).ready(function(){
    $('.publisher').click(function(){ window.location='subs'});
    $('#backRooms').click(function(){ window.location='/'});
    $('#backStreams').click(function(){ window.location='/room?room_id=' + roomID});

    $('#subscriberModal').on('show.bs.modal', function (event) {
      var subscriber = $(event.relatedTarget);
      var userName = subscriber.data('username');
      var subID = subscriber.data('subid');
      sub_modal_now = subID;
      var buffer = subscribers[subID];
      if (buffer != undefined && buffer[0]) {
        var audio = buffer[0].audio;
        var video = buffer[0].video;
        if (audio && video) updateRR(subID, audio, video);
      }
      updateModalState(subID);
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

var paintSubscribersGrid = function() {
    $('#subscribers').html("");

    if (rooms[roomID] && streams[streamID]) {
        var subscribers = streams[streamID]["subscribers"];
        var nSubscribers = streams[streamID]["subscribers"].length;
        updateNSubscribers(nSubscribers);
        for (var sub in subscribers){
            var userID = subscribers[sub];
            var userName = users[userID]["userName"];
            var state = states[streamID].subscribers[userID];
            createNewSubscriberGrid(userID, userName, state);
        }
    } else {
        updateNamePublisher("Publisher not found");
        updateNSubscribers(0);
    }
}

var paintSubscribersList = function() {
    $('#subscribers').html("");
    $('#subscribers').append('<div class="subscriberContainer show_list"><table class="table table-hover"><thead><tr><th class="col-md-6">User ID</th><th class="col-md-4">User name</th><th class="col-md-2">Status</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
    if (rooms[roomID] && streams[streamID]) {
        var subscribers = streams[streamID]["subscribers"];
        var nSubscribers = streams[streamID]["subscribers"].length;
        updateNSubscribers(nSubscribers);
        for (var sub in subscribers){
            var userID = subscribers[sub];
            var userName = users[userID]["userName"];
            var state = states[streamID].subscribers[userID];

            createNewSubscriberList(userID, userName, state);
        }
    } else {
        updateNamePublisher("Publisher not found");
        updateNSubscribers(0);
    }
}

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

var createNewSubscriberGrid = function(userID, userName, state){
    var color = stateToColor(state);
    $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 subscriberContainer show_grid" data-toggle="modal" data-target="#subscriberModal" data-state="' + color + '" data-subid="' + userID + '" data-username="' + userName + '" id="sub_' + userID +'"><div class="fa fa-circle ' + color + '"></div><div class="subName">' + userName +'</div></div>');
}
var createNewSubscriberList = function(userID, userName, state){
    var color = stateToColor(state);

    $('#bodyTable').append('<tr id="sub_' + userID + '" class="subscriber" data-toggle="modal" data-target="#subscriberModal" data-state="' + color + '" data-subid="' + userID + '" data-username="' + userName + '" ><th class="subId">' + userID + '</th><th class="subname">' + userName + '</th><th class="status"><span class="fa fa-circle ' + color + '"></span></th></tr>');
}

var paintPublishers = function() {
    if (rooms[roomID]) {
        var roomStreams = rooms[roomID]["streams"];
        for (var stream in roomStreams){
            if (streamID != roomStreams[stream]) {
                var state = states[roomStreams[stream]].state;
                var userName = streams[roomStreams[stream]]["userName"];
                createNewPublisher(roomID, roomStreams[stream], userName, state);
            } else {
                var state = states[streamID].state;
                var userName = streams[roomStreams[stream]]["userName"];
                createMyPublisher(roomID, roomStreams[stream], userName, state);
            }
        }
        updateStatePublisher();
    }

}

var createNewPublisher = function(roomID, streamID, userName, state){
    var color = stateToColor(state);

    $('#others').append('<div class="col-lg-3 publisherCol" id="pub_' + streamID +'"data-pub_id="' + streamID +'"><div class="fa fa-circle ' + color + '"></div><div id="pubNameCarousel">' + userName + '</div></div>');

    $('#pub_'+ streamID).click(function() {

    var pub_id = $(this).data('pub_id');

    if (pub_id != undefined || pub_id != null) {
        window.location = '/pub?pub_id=' + pub_id + '&room_id='+ roomID;
    }
})
}

var createMyPublisher = function(roomID, streamID, userName, state){
    var color = stateToColor(state);

    $('#selected').append('<div class="col-lg-3 publisherCol selected" id="pub_' + streamID +'" data-pub_id="' + streamID +'"><div class="fa fa-circle ' + color +'"></div><div id="pubNameCarousel">' + userName + '</div></div>');

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
var updateStatePublisher = function() {
    var state;
    if (states[streamID]) state = states[streamID].state;    

    var color = stateToColor(state);

    $('#pubState').removeClass('green');
    $('#pubState').removeClass('orange');
    $('#pubState').removeClass('red');

    $('#pubState').addClass(color);

}