var socket = io('/', {path: '/ackuaria/socket.io'});
var show_grid = true;
var audio, video;
var subscribers = {};
var sub_modal_now;
var ssrcs = {};
var lastTimestamp, lastBytesAudio, lastBytesVideo;

$(document).ready(function(){


    socket.on('newEvent', function(evt) {
        var event = evt.event;
        rooms = evt.rooms;
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
        users = evt.users; 

        $('#others').html("");
        $('#selected').html("");

        if (room) {
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
        var timestamp = event.timestamp;
        if (pubID == streamID){
            updateSR(audio, video, timestamp);
        }
    });

    socket.on('newRR', function(evt) {
        var event = evt.event;

        var audio = evt.audio;
        var video = evt.video;
        var pubID = event.pub;
        var subID = event.subs;
        var timestamp = event.timestamp;
        var stats = {audio: audio, video: video};
        if (pubID == streamID) {
            subscribers[subID] = stats;
            if (sub_modal_now == subID) {
                updateRR(subID, audio, video, timestamp);
            }
        }
    });

    $('.publisher').click(function(){ window.location = '/ackuaria/subs'});
    $('#backRooms').click(function(){ window.location = '/ackuaria'});
    $('#backStreams').click(function(){ window.location = '/ackuaria/room?room_id=' + roomID});

    $('#subscriberModal').on('show.bs.modal', function (event) {
      var subscriber = $(event.relatedTarget);
      var userName = subscriber.data('username');
      var subID = subscriber.data('subid');
      var stats = subscribers[subID];
      if (stats) {
        var audio = stats.audio;
        var video = stats.video;
        updateRR(subID, audio, video);
      }
      updateModalState(subID);
      var modal = $(this)
      $('#username').html(" " + userName);
      newDataSub(subID);
    })

    $('#subscriberModal').on('hidden.bs.modal', function () {
        sub_modal_now = undefined;
        $("#chartFLVideo").html("");
        $("#chartFLAudio").html("");
        $("#chartBW").html("");

    })
    $('#searchBar').keyup(function () {
        search();
    });

    var search = function(){
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();
        filter_array = filter.split(' ');
        var arrayLength = filter_array.length;
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

    $('#list').click(function() {
        if (!$(this).hasClass("active")){
            show_grid = false;
            paintSubscribersList();
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
            paintSubscribersGrid();
            search();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
    });

    $('#switchVideo').click(function() {
        if (!$(this).hasClass("active")){
            $( ".audioChart" ).hide();
            $( ".videoChart" ).show();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchAudio').addClass('btn-default');
        $('#switchAudio').removeClass('active');
        $('#switchAudio').removeClass('btn-primary');

        $('#switchAll').addClass('btn-default');
        $('#switchAll').removeClass('active');
        $('#switchAll').removeClass('btn-primary');
    });

    $('#switchAudio').click(function() {
        if (!$(this).hasClass("active")){
            $( ".videoChart" ).hide();
            $( ".audioChart" ).show();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchVideo').addClass('btn-default');
        $('#switchVideo').removeClass('active');
        $('#switchVideo').removeClass('btn-primary');

        $('#switchAll').addClass('btn-default');
        $('#switchAll').removeClass('active');
        $('#switchAll').removeClass('btn-primary');
    });

    $('#switchAll').click(function() {
        if (!$(this).hasClass("active")){
            $( ".audioChart" ).show();
            $( ".videoChart" ).show();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchVideo').addClass('btn-default');
        $('#switchVideo').removeClass('active');
        $('#switchVideo').removeClass('btn-primary');

        $('#switchAudio').addClass('btn-default');
        $('#switchAudio').removeClass('active');
        $('#switchAudio').removeClass('btn-primary');
    });

    $('#switchVideoPub').click(function() {
        if (!$(this).hasClass("active")){
            $( "#chartAudio" ).hide();
            $( "#audioCol" ).hide();

            $( "#chartVideo" ).show();
            $( "#videoCol" ).show();

        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchAudioPub').addClass('btn-default');
        $('#switchAudioPub').removeClass('active');
        $('#switchAudioPub').removeClass('btn-primary');

        $('#switchAllPub').addClass('btn-default');
        $('#switchAllPub').removeClass('active');
        $('#switchAllPub').removeClass('btn-primary');
    });

    $('#switchAudioPub').click(function() {
        if (!$(this).hasClass("active")){
            $( "#chartVideo" ).hide();
            $( "#videoCol" ).hide();

            $( "#chartAudio" ).show();
            $( "#audioCol" ).show();

        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchVideoPub').addClass('btn-default');
        $('#switchVideoPub').removeClass('active');
        $('#switchVideoPub').removeClass('btn-primary');

        $('#switchAllPub').addClass('btn-default');
        $('#switchAllPub').removeClass('active');
        $('#switchAllPub').removeClass('btn-primary');
    });

    $('#switchAllPub').click(function() {
        if (!$(this).hasClass("active")){
            $( "#chartVideo" ).show();
            $( "#videoCol" ).show();

            $( "#chartAudio" ).show();
            $( "#audioCol" ).show();

        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#switchVideoPub').addClass('btn-default');
        $('#switchVideoPub').removeClass('active');
        $('#switchVideoPub').removeClass('btn-primary');

        $('#switchAudioPub').addClass('btn-default');
        $('#switchAudioPub').removeClass('active');
        $('#switchAudioPub').removeClass('btn-primary');
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

    var updateModalState = function(subID) {
        var color, state;
        if (states[streamID]) state = states[streamID].subscribers[subID];
        if (!users[subID]){
            $('#username').html(" User disconnected");
        }
        var color = stateToColor(state);
        $('#subState').removeClass('green');
        $('#subState').removeClass('orange');
        $('#subState').removeClass('red');
        $('#subState').addClass(color);

    }

    var updateRR = function(subID, audio, video, timestamp) {
        var FLVideo, FLAudio, BW;
        if (video) {
            FLVideo = video.fractionLost;
            BW = video.bandwidth;
        }
        if (audio) FLAudio = audio.fractionLost;

        var date = new Date(timestamp);
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var dateStr = hour + ":" + minutes +":" + seconds;

        var data = {date: dateStr, FLVideo: FLVideo, FLAudio: FLAudio, BW: BW};
        newDataSub(subID, data)

        if (video && ssrcs[video.sourceSsrc]) {
            $('#dataModal #videoSSRC').html(video.ssrc);
            $('#dataModal #videoBandwidth').html(video.bandwidth);
            $('#dataModal #pli').html(video.PLI);
            $('#dataModal #videoFractionLost').html(Math.round((video.fractionLost * 100 / 256) *100) / 100 + "%");
            $('#dataModal #videoJitter').html(video.jitter);
            $('#dataModal #videoPacketsLost').html(video.packetsLost);
            $('#dataModal #videoSourceSSRC').html(video.sourceSsrc);
        }
        if (audio && ssrcs[audio.sourceSsrc]) {
            $('#dataModal #audioSSRC').html(audio.ssrc);
            $('#dataModal #audioFractionLost').html(Math.round((audio.fractionLost * 100 / 256) *100) / 100 + "%");
            $('#dataModal #audioJitter').html(audio.jitter);
            $('#dataModal #audioPacketsLost').html(audio.packetsLost);
            $('#dataModal #audioSourceSSRC').html(audio.sourceSsrc);
        }

    }

    var updateSR = function(audio, video, timestamp) {
        var bpsAudio, bpsVideo, kbpsAudio, kbpsVideo;
        if (!lastTimestamp && !lastBytesAudio && !lastBytesVideo) {
            lastTimestamp = timestamp;
            if (audio) lastBytesAudio = audio.rtcpBytesSent;
            if (video) lastBytesVideo = video.rtcpBytesSent;
            return;
        } else {
            var timeSince = (timestamp - lastTimestamp) / 1000;
            if (audio) {
                bpsAudio = (((audio.rtcpBytesSent - lastBytesAudio) / timeSince) / 1000) * 8;
                lastBytesAudio = audio.rtcpBytesSent;
            }
            if (video) {
                bpsVideo = (((video.rtcpBytesSent - lastBytesVideo) / timeSince) / 1000) * 8;
                lastBytesVideo = video.rtcpBytesSent;
            }
            if (audio || video) lastTimestamp = timestamp;
        }
        var date = new Date(timestamp);
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var dateStr = hour + ":" + minutes +":" + seconds;

        if (audio) {
            $('#audioSSRC').html(audio.ssrc);
            if (bpsAudio != 0) $('#audioBytesSent').html(Math.round(bpsAudio * 100)/100 + " Kbps");
            $('#audioPacketsSent').html(audio.rtcpPacketSent);
            kbpsAudio = Math.round(bpsAudio * 100)/100;
            ssrcs[audio.ssrc] = "audio";
        }
        if (video) {
            $('#videoSSRC').html(video.ssrc);
            if (bpsVideo != 0) $('#videoBytesSent').html(Math.round(bpsVideo * 100)/100 + " Kbps");
            $('#videoPacketsSent').html(video.rtcpPacketSent);
            kbpsVideo = Math.round(bpsVideo * 100)/100;
            ssrcs[video.ssrc] = "video";
        }

        newDataPub({date: dateStr, kbpsVideo: kbpsVideo, kbpsAudio: kbpsAudio});

    }

    var paintSubscribersGrid = function() {
        $('#subscribers').html("");

        if (room && streams[streamID]) {
            var subscribers = streams[streamID].subscribers;
            var nSubscribers = subscribers.length;
            updateNSubscribers(nSubscribers);
            for (var sub in subscribers){
                var userID = subscribers[sub];
                var userName = users[userID].userName;
                var state = states[streamID].subscribers[userID];
                createNewSubscriberGrid(userID, userName, state);
            }

            var overflowing = false;
            while (!overflowing) {
                $('#subscribers').append('<div class="col-lg-2 col-md-3 col-sm-3 col-xs-3 subscriberFake show_grid"></div>');
                if ($('#subscribers')[0].offsetHeight < $('#subscribers')[0].scrollHeight) {
                    $('#subscribers div.subscriberFake:last').remove();
                    overflowing=true;
                } else {
                    overflowing = false;
                }
            }

        } else {
            updateNamePublisher("Publisher not found");
            updateNSubscribers(0);
        }
    }

    var paintSubscribersList = function() {
        $('#subscribers').html("");
        $('#subscribers').append('<div class="subscriberContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-6">User ID</th><th class="col-md-4">User name</th><th class="col-md-2">Status</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
        if (room && streams[streamID]) {
            var subscribers = streams[streamID].subscribers;
            var nSubscribers = subscribers.length;
            updateNSubscribers(nSubscribers);
            for (var sub in subscribers){
                var userID = subscribers[sub];
                var userName = users[userID].userName;
                var state = states[streamID].subscribers[userID];

                createNewSubscriberList(userID, userName, state);
            }
        } else {
            updateNamePublisher("Publisher not found");
            updateNSubscribers(0);
        }
        Sortable.init()

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
        if (room) {
            var roomStreams = room.streams;
            for (var stream in roomStreams){
                if ((streamID != roomStreams[stream]) && states[roomStreams[stream]] && streams[roomStreams[stream]]) {
                    var state = states[roomStreams[stream]].state;
                    var userName = streams[roomStreams[stream]].userName;
                    createNewPublisher(roomID, roomStreams[stream], userName, state);
                } else if ((streamID == roomStreams[stream]) && states[streamID] && streams[streamID]) {
                    if (states[streamID]){
                        var state = states[streamID].state;
                        var userName = streams[streamID].userName;
                        createMyPublisher(roomID, streamID, userName, state);
                    }
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
                window.location = '/ackuaria/pub?pub_id=' + pub_id + '&room_id='+ roomID;
            }
        })
    }

    var createMyPublisher = function(roomID, streamID, userName, state){
        var color = stateToColor(state);
        $('#selected').append('<div class="col-lg-3 publisherCol selected" id="pub_' + streamID +'" data-pub_id="' + streamID +'"><div class="fa fa-circle ' + color +'"></div><div id="pubNameCarousel">' + userName + '</div></div>');
        $('#pub_'+ streamID).click(function() {
            var pub_id = $(this).data('pub_id');
            if (pub_id != undefined || pub_id != null) {
                window.location = '/ackuaria/pub?pub_id=' + pub_id + '&room_id='+ roomID;
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

    paintSubscribersGrid();
    paintPublishers();

});
