var socket = io();
var show_grid = false;
var audio, video;
var subscribers = {};
var sub_modal_now;
var ssrcs = {};
var lastTimestamp, lastBytesAudio, lastBytesVideo;
const publisherVideoStats = ['clientHostType', 'PLI', 'keyFrames', 'bitrateCalculated'];
const publisherAudioStats = ['bitrateCalculated'];
const subscriberVideoStats = ['clientHostType', 'PLI', 'keyFrames', 'bitrateCalculated', 'packetsLost', 'jitter'];
const subscriberAudioStats = ['bitrateCalculated', 'packetsLost', 'jitter'];


$(document).ready(function(){
    socket.emit('subscribe_to_stats', streamID);
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

    socket.on('newStats', function(evt) {
      var event = evt.event;
      var pubID = event.streamId;
      delete event.streamId
      let publisherVideo = [];
      let publisherAudio;
      if (pubID == streamID) {
        for (var id in event) {
          if (id === 'publisher'){
            for (var ssrc in event[id]) {
              if (event[id][ssrc].type === 'video'){
                let videoEntry = event[id][ssrc];
                videoEntry.ssrc = ssrc
                publisherVideo.push(videoEntry);
              } else if (event[id][ssrc].type === 'audio') {
                publisherAudio = event[id][ssrc];
                publisherAudio.ssrc = ssrc;
              }
            }
          } else {
            let stats = {};
            for (var ssrc in event[id]) {
              if(event[id][ssrc].type === 'video') {
                stats.video = event[id][ssrc];
                stats.video.ssrc = ssrc;
              } else if (event[id][ssrc].type === 'audio') {
                stats.audio = event[id][ssrc];
                stats.audio.ssrc = ssrc;
              }
            }
            if (stats.video || stats.audio) {
              subscribers[id] = stats;
              if (sub_modal_now == id) {
                updateRR(id, stats.audio, stats.video, event.timestamp);
                updateCharts(pubID, id, event);
              }
            }
          }
        }
        if (publisherVideo.length > 0 || publisherAudio) {
          updateSR(publisherAudio, publisherVideo, event.timestamp);
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
        destroyCharts();
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
            BW = video.bitrateCalculated/1000;
        }
        if (audio) FLAudio = audio.fractionLost;

        var date = new Date(timestamp);
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var dateStr = hour + ":" + minutes +":" + seconds;

        var data = {date: dateStr, FLVideo: FLVideo, FLAudio: FLAudio, BW: BW};
        newDataSub(subID, data)

        if (video) {
          let htmlData = '';
          subscriberVideoStats.forEach((value) => {
            if (video[value] || video[value] === 0) {
              htmlData+=`${value}: ${video[value]} </br>`
            }
          });
          htmlData += '<hr>';
          $('#videoDataSub').html(htmlData);
        }
        if (audio) {
          let htmlData = '';
          subscriberAudioStats.forEach((value) => {
            if (audio[value] || audio[value] === 0) {
              htmlData+=`${value}: ${audio[value]} </br>`
            }
          });
          $('#audioDataSub').html(htmlData);
        }

    }

    var updateSR = function(audio, video, timestamp) {
        let bpsAudio = 0;
        let bpsVideo = 0;
        var date = new Date(timestamp);
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var dateStr = hour + ":" + minutes +":" + seconds;

        if (audio) {
          let data = '';
          bpsAudio = audio.bitrateCalculated;
          publisherAudioStats.forEach((value) => {
            if (audio[value] || audio[value] === 0) {
              data += `<div class="propertyTitle"> ${value}: <span class="propertyContent">${audio[value]}</span></div>`
            }
          });
          $('#audioData').html(data);
          ssrcs[audio.ssrc] = "audio";
        }
        if (video) {
          let data = '';
          video.forEach((videoData) => {
            bpsVideo += videoData.bitrateCalculated;
            ssrcs[videoData.ssrc] = "video";
            data += `<div class="propertytitle"> SSRC: <span class="propertycontent">${videoData.ssrc}</span></div>`
            publisherVideoStats.forEach((value) => {
              if (videoData[value] || videoData[value] === 0) {
                data += `<div class="propertytitle"> ${value}: <span class="propertycontent">${videoData[value]}</span></div>`
              }
            });
            data+='<hr>';
          });
          $('#videoData').html(data);
        }
        newDataPub({date: dateStr, kbpsVideo: bpsVideo/1000, kbpsAudio: bpsAudio/1000});

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
        $('#subscribers').append('<div class="subscriberContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-6">User Name</th><th class="col-md-2">User ID</th><th class="col-md-2">Status</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
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

        $('#bodyTable').append('<tr id="sub_' + userID + '" class="subscriber" data-toggle="modal" data-target="#subscriberModal" data-state="' + color + '" data-subid="' + userID + '" data-username="' + userName + '" ><th class="subName">' + userName + '</th><th class="subId">' + userID + '</th><th class="status"><span class="fa fa-circle ' + color + '"></span></th></tr>');
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

    paintSubscribersList();
    paintPublishers();

});
