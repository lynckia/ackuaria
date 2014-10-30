var socket = io();

var hasPublishers = function() {
    var totalDivs = document.getElementsByTagName('div');

    for (var i = 0; i < totalDivs.length; i++) {
        var div = totalDivs[i];
        if (div.className == "publisher") {
            return true;

        }
    }
    return false;
}


// PUBLISH EVENT
var updateEventPublish = function(evt) {

    createNewPublisher(evt.user, evt.stream, evt.name);
}

// SUBSCRIBE EVENT
var updateEventSubscribe = function(evt) {

    createNewSubscriber(evt.user, evt.stream, evt.name);

}

// UNPUBLISH EVENT
var updateEventUnpublish = function(evt) {

    removePublisher(evt.stream);

    removeSubscriber(evt.user);
}

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
    // SENDER STATS
var updateStatsPublisher = function(evt) {
    var pubGraphsDiv = document.getElementById('pubGraphs_' + evt.pub);
    var stats = document.getElementById("statsPub" + evt.pub);
    var audio = document.getElementById("audioPub" + evt.pub);
    var video = document.getElementById("videoPub" + evt.pub);
    var BpsSentAudioDiv = document.getElementById('BpsSentAudio_' + evt.pub);
    var BpsSentVideoDiv = document.getElementById('BpsSentVideo_' + evt.pub);
    if (audio && video && BpsSentAudioDiv && BpsSentVideoDiv) {
        for (var i in evt.stats) {
            var date = new Date();
            var time = date.getTime();

            if (evt.stats[i].type === "audio") {

                audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[i].ssrc + '<br>' + "rtcpBytesSent: " + evt.stats[i].rtcpBytesSent + '<br>' + "rtcpPacketSent: " + evt.stats[i].rtcpPacketSent;
                audio.setAttribute('ssrc', evt.stats[i].ssrc);
                if (!charts['BpsSentAudio_' + evt.pub]) {
                    GRAPH.generateBpsSent('BpsSentAudio_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp, "Audio");
                } else {
                    GRAPH.updateBpsSent('BpsSentAudio_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp);
                }

            } else {
                video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[i].ssrc + '<br>' + "rtcpBytesSent: " + evt.stats[i].rtcpBytesSent + '<br>' + "rtcpPacketSent: " + evt.stats[i].rtcpPacketSent;
                video.setAttribute('ssrc', evt.stats[i].ssrc);
                if (!charts['BpsSentVideo_' + evt.pub]) {
                    GRAPH.generateBpsSent('BpsSentVideo_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp, "Video");
                } else {
                    GRAPH.updateBpsSent('BpsSentVideo_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp);
                }
            }
        }

    }


}

// RECEIVER STATS
var updateStatsSubscriber = function(evt) {

    var subDiv = document.getElementById("sub_" + evt.subs + "_" + evt.pub);
    var stats = document.getElementById("statsSub_" + evt.subs + "_" + evt.pub);
    var audio = document.getElementById("audioSub_" + evt.subs + "_" + evt.pub);
    var video = document.getElementById("videoSub_" + evt.subs + "_" + evt.pub);
    var subVideoGraphsDetail = document.getElementById('subVideoGraphsDetail_' + evt.subs + "_" + evt.pub);
    var subAudioGraphsDetail = document.getElementById('subAudioGraphsDetail_' + evt.subs + "_" + evt.pub);
    var subVideoGraphsSum = document.getElementById('subVideoGraphsSum_' + evt.subs + "_" + evt.pub);
    var subAudioGraphsSum = document.getElementById('subAudioGraphsSum_' + evt.subs + "_" + evt.pub);
    var subVideoGraphsDiv = document.getElementById("subVideoGraphs_" + evt.subs + "_" + evt.pub);
    var subAudioGraphsDiv = document.getElementById("subAudioGraphs_" + evt.subs + "_" + evt.pub);
    var subDetail = document.getElementById('subDetail_' + evt.subs + "_" + evt.pub);
    var fractionLostVideoDiv = document.getElementById('fractionLostVideo_' + evt.subs + "_" + evt.pub);
    var fractionLostAudioDiv = document.getElementById('fractionLostAudio_' + evt.subs + "_" + evt.pub);
    var ppsLostVideoDiv = document.getElementById('ppsLostVideo_' + evt.subs + "_" + evt.pub);
    var ppsLostAudioDiv = document.getElementById('ppsLostAudio_' + evt.subs + "_" + evt.pub);

    if (document.getElementById('audioPub' + evt.pub) && audio && video && stats) {

        if (document.getElementById('audioPub' + evt.pub).ssrc == evt.stats[0].sourceSsrc) {
            if (evt.stats.length == 2) {
                audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[0].ssrc + '<br>' + "fractionLost: " + evt.stats[0].fractionLost + '<br>' + "jitter: " + evt.stats[0].jitter + '<br>' + "packetsLost: " + evt.stats[0].packetsLost;
                video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[1].ssrc + '<br>' + "fractionLost: " + evt.stats[1].fractionLost + '<br>' + "jitter: " + evt.stats[1].jitter + '<br>' + "packetsLost: " + evt.stats[1].packetsLost;
                if (charts) {

                    //FRACTION LOST
                    if (!charts['fractionLostVideo_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                    } else {
                        GRAPH.updateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                    }

                    if (!charts['fractionLostAudio_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                    } else {
                        GRAPH.updateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                    }

                    //PACKETS PER SECOND LOST
                    var date = new Date();
                    var time = date.getTime();
                    if (!charts['ppsLostVideo_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                    } else {
                        // CAMBIAR VALOR, SOLO PARA PRUEBA
                        GRAPH.updatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                    }

                    if (!charts['ppsLostAudio_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                    } else {
                        GRAPH.updatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                    }
                }
            }

        } else {
            if (evt.stats.length == 2) {
                audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[1].ssrc + '<br>' + "fractionLost: " + evt.stats[1].fractionLost + '<br>' + "jitter: " + evt.stats[1].jitter + '<br>' + "packetsLost: " + evt.stats[1].packetsLost;
                video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[0].ssrc + '<br>' + "fractionLost: " + evt.stats[0].fractionLost + '<br>' + "jitter: " + evt.stats[0].jitter + '<br>' + "packetsLost: " + evt.stats[0].packetsLost;
                if (charts) {

                    //FRACTION LOST
                    if (!charts['fractionLostVideo_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                    } else {
                        GRAPH.updateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                    }
                    if (!charts['fractionLostAudio_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                    } else {
                        GRAPH.updateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                    }

                    //PACKETS PER SECOND LOST

                    var date = new Date();
                    var time = date.getTime();
                    if (!charts['ppsLostVideo_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                    } else {
                        //CAMBIAR VALOR, SOLO PARA PRUEBA
                        GRAPH.updatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                    }

                    if (!charts['ppsLostAudio_' + evt.subs + "_" + evt.pub]) {
                        GRAPH.generatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                    } else {
                        GRAPH.updatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                    }

                }
            }

        }

    }
}


socket.on('newEvent', function(evt) {

    var theEvent = evt.theEvent;

    switch (evt.theEvent.type) {
        case "user_connection":
            console.log("Connection");
            //updateEventConnection(evt.theEvent);
            break;


        case "publish":
            console.log("User " + theEvent.user + " Publish");
            updateEventPublish(theEvent);
            break;

        case "subscribe":
            console.log("User " + theEvent.user + " Subscribe");
            updateEventSubscribe(theEvent);
            break;

        case "unpublish":
            updateEventUnpublish(theEvent);
            break;

        case "unsubscribe":
            break;

        case "user_disconnect":
            break;

        case "connection_status":
            updateEventStatus(theEvent);
            break;

        default:
            break;

    }

});

socket.on('newStats', function(evt) {

    var theStats = evt.theStats;

    if (!theStats.subs) {
        updateStatsPublisher(theStats);
    } else updateStatsSubscriber(theStats);


});


var createNewPublisher = function(user, stream, name) {
    // Div de la Lista de todos los publishers
    var pubsListDiv = document.getElementById('pubsList');

    var pubInfo = document.createElement('div');
    pubInfo.setAttribute('id', "pubInfo" + stream);
    pubInfo.className = "publisher";

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + stream);
    connectionState.className = "status_point";

    // Detail que contiene todo lo relacionado con un publisher
    var pubDetail = document.createElement('details');
    pubDetail.setAttribute('id', "pubDetail" + user);
    pubDetail.className = "publisherDetail";

    // Summary con el nombre del publisher
    var pubSum = document.createElement('summary');
    pubSum.innerHTML = "Publisher info";

    // Div que contiene nombre y estadísticas del publisher
    var pubDiv = document.createElement('div');
    pubDiv.setAttribute('id', 'pub' + stream);
    //pubDiv.className = "publisher";
    pubDiv.innerHTML = name + ": PUBLISHER " + user + " CON STREAM " + stream;

    var pubGraphsDiv = document.createElement('div');
    pubGraphsDiv.setAttribute('id', 'pubGraphs_' + stream);


    var BpsSentVideoDiv = document.createElement('div');
    BpsSentVideoDiv.setAttribute('id', 'BpsSentVideo_' + stream);
    BpsSentVideoDiv.className = "chartContainer";

    var BpsSentAudioDiv = document.createElement('div');
    BpsSentAudioDiv.setAttribute('id', 'BpsSentAudio_' + stream);
    BpsSentAudioDiv.className = "chartContainer";

    var stats = document.createElement('div');
    stats.setAttribute('id', 'statsPub' + stream);

    // Párrafo que contiene las estadísticas de audio
    var audio = document.createElement('p');
    audio.setAttribute('id', 'audioPub' + stream);
    audio.className = "audio";

    // Párrafo que contiene las estadísticas de video
    var video = document.createElement('p');
    video.setAttribute('id', 'videoPub' + stream);
    video.className = "video";

    pubInfo.appendChild(connectionState);
    pubInfo.appendChild(pubDiv);

    pubInfo.appendChild(pubDetail);

    //pubSubsDiv va dentro del detail
    pubDetail.appendChild(stats);

    // Detail va dentro de la lista de publishers
    pubsListDiv.appendChild(pubInfo);

    // El summary va antes que el pubSubsDiv, dentro del detail
    pubDetail.insertBefore(pubSum, stats);

    pubGraphsDiv.appendChild(BpsSentVideoDiv);
    pubGraphsDiv.appendChild(BpsSentAudioDiv);
    stats.appendChild(audio);
    stats.appendChild(video);
    stats.appendChild(pubGraphsDiv);

}

var createNewSubscriber = function(user, stream, name) {
    var pubInfo = document.getElementById('pubInfo' + stream);

    var subInfo = document.createElement('div');
    subInfo.setAttribute('id', "subInfo_" + user + "_" + stream);
    subInfo.className = 'subscriber_info';
    subInfo.setAttribute("user", user);

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + user + "_" + stream);
    connectionState.className = "status_point";

    // Detail que contiene todo lo relacionado con un subscriber
    var subDetail = document.createElement('details');
    subDetail.setAttribute('id', "subDetail_" + user + "_" + stream);
    subDetail.className = "subscriberDetail";
    subDetail.setAttribute('user', user);

    // Summary con el nombre del subscriber
    var subSum = document.createElement('summary');
    subSum.innerHTML = "Subscriber info";

    // Div que contiene toda la información relacionada con un subscriber
    var subDiv = document.createElement('div');
    subDiv.setAttribute('id', 'sub_' + user + '_' + stream);
    subDiv.innerHTML = name + ": SUBSCRIBER " + user;

    var stats = document.createElement('div');
    stats.setAttribute('id', 'statsSub_' + user + "_" + stream);

    var audio = document.createElement('p');
    audio.setAttribute('id', 'audioSub_' + user + "_" + stream);
    audio.className = "audio";

    var video = document.createElement('p');
    video.setAttribute('id', 'videoSub_' + user + "_" + stream);
    video.className = "video";

    var subVideoGraphsDetail = document.createElement('details');
    subVideoGraphsDetail.setAttribute('id', 'subVideoGraphsDetail_' + user + "_" + stream);
    subVideoGraphsDetail.className = "subscriberGraphsDetail";

    var subAudioGraphsDetail = document.createElement('details');
    subAudioGraphsDetail.setAttribute('id', 'subAudioGraphsDetail_' + user + "_" + stream);
    subAudioGraphsDetail.className = "subscriberGraphsDetail";

    var subVideoGraphsSum = document.createElement('summary');
    subVideoGraphsSum.setAttribute('id', 'subVideoGraphsSum_' + user + "_" + stream);
    subVideoGraphsSum.innerHTML = "Video Graphs";

    var subAudioGraphsSum = document.createElement('summary');
    subAudioGraphsSum.setAttribute('id', 'subAudioGraphsSum_' + user + "_" + stream);
    subAudioGraphsSum.innerHTML = "Audio Graphs";

    var subVideoGraphsDiv = document.createElement('div');
    subVideoGraphsDiv.setAttribute('id', "subVideoGraphs_" + user + "_" + stream);

    var subAudioGraphsDiv = document.createElement('div');
    subAudioGraphsDiv.setAttribute('id', "subAudioGraphs_" + user + "_" + stream);


    var fractionLostVideoDiv = document.createElement('div');
    fractionLostVideoDiv.setAttribute('id', 'fractionLostVideo_' + user + "_" + stream);
    fractionLostVideoDiv.className = "fractionLost";


    var fractionLostAudioDiv = document.createElement('div');
    fractionLostAudioDiv.setAttribute('id', 'fractionLostAudio_' + user + "_" + stream);
    fractionLostAudioDiv.className = "fractionLost";

    var ppsLostVideoDiv = document.createElement('div');
    ppsLostVideoDiv.setAttribute('id', 'ppsLostVideo_' + user + "_" + stream);
    ppsLostVideoDiv.className = "chartContainer";

    var ppsLostAudioDiv = document.createElement('div');
    ppsLostAudioDiv.setAttribute('id', 'ppsLostAudio_' + user + "_" + stream);
    ppsLostAudioDiv.className = "chartContainer";

    pubInfo.appendChild(subInfo);
    subInfo.appendChild(connectionState);
    subInfo.appendChild(subDiv);
    subInfo.appendChild(subDetail);
    subDetail.appendChild(stats);

    subDetail.insertBefore(subSum, stats);

    stats.appendChild(audio);
    stats.appendChild(video);

    stats.appendChild(subVideoGraphsDetail);
    stats.appendChild(subAudioGraphsDetail);

    subVideoGraphsDetail.appendChild(subVideoGraphsDiv);
    subAudioGraphsDetail.appendChild(subAudioGraphsDiv);

    subVideoGraphsDetail.insertBefore(subVideoGraphsSum, subVideoGraphsDiv);
    subAudioGraphsDetail.insertBefore(subAudioGraphsSum, subAudioGraphsDiv);
    subDetail.appendChild(subVideoGraphsDetail);
    subDetail.appendChild(subAudioGraphsDetail);
    subVideoGraphsDetail.appendChild(subVideoGraphsDiv);
    subAudioGraphsDetail.appendChild(subAudioGraphsDiv);

    subVideoGraphsDetail.insertBefore(subVideoGraphsSum, subVideoGraphsDiv);
    subAudioGraphsDetail.insertBefore(subAudioGraphsSum, subAudioGraphsDiv);

    subVideoGraphsDiv.appendChild(fractionLostVideoDiv);
    subAudioGraphsDiv.appendChild(fractionLostAudioDiv);

    subVideoGraphsDiv.appendChild(ppsLostVideoDiv);
    subAudioGraphsDiv.appendChild(ppsLostAudioDiv);
}

var removeSubscriber = function(user) {
    var totalDivs = document.getElementsByTagName('div');

    for (var i = 0; i < totalDivs.length; i++) {
        var div = totalDivs[i];
        if (div.className == "publisher") {
            for (var j = 0; j < div.children.length; j++) {
                if (div.children[j].getAttribute("user") == user) {
                    div.children[j].parentNode.removeChild(div.children[j]);
                }
            }

        }
    }
}

var removePublisher = function(stream) {

    var pubs = document.getElementById('pubsList');
    var pub = document.getElementById('pubInfo' + stream);
    pubs.removeChild(pub);

}

var paintUsers = function(roomInfo, userStream, statusId, userName) {

    if (!hasPublishers()) {
        for (var stream in roomInfo) {
            createNewPublisher(userStream[stream], stream, userName[userStream[stream]]);
            createStatus(stream, statusId[stream]);
            for (var i = 0; i < roomInfo[stream].length; i++) {
                createNewSubscriber(roomInfo[stream][i], stream, userName[roomInfo[stream][i]]);
                var id = roomInfo[stream][i] + "_" + stream;
                createStatus(id, statusId[id]);
            }
        }
    }
}