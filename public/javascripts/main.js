

var socket = io();



// PUBLISH EVENT
var updateEventPublish = function(evt){

    // Div de la Lista de todos los publishers
    var pubsListDiv = document.getElementById('pubsList');

    var pubInfo = document.createElement('div');
    pubInfo.setAttribute('id', "pubInfo" + evt.stream);

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + evt.stream);
    connectionState.className = "status_point";

    // Detail que contiene todo lo relacionado con un publisher y sus subscribers
    var pubDetail = document.createElement('details');
    pubDetail.setAttribute('id', "pubDetail" + evt.user);
    pubDetail.className = "publisherDetail";

    // Summary con el nombre del publisher
    var pubSum = document.createElement('summary');
    pubSum.innerHTML = "Detail";

    // Div que contiene al publisher y sus subscribers
    var pubSubsDiv = document.createElement('div');
    pubSubsDiv.setAttribute('id', 'pubSubs' + evt.stream);

    // Div que contiene nombre y estadísticas del publisher
    var pubDiv = document.createElement('div');
    pubDiv.setAttribute('id', 'pub' + evt.stream );
    //pubDiv.className = "publisher";
    pubDiv.innerHTML = "PUBLISHER " + evt.user + " CON STREAM " + evt.stream ;

    var pubGraphsDiv = document.createElement('div');
    pubGraphsDiv.setAttribute('id', 'pubGraphs_' + evt.stream);


    var BpsSentVideoDiv = document.createElement('div');
    BpsSentVideoDiv.setAttribute('id', 'BpsSentVideo_' + evt.stream);
    BpsSentVideoDiv.className = "chartContainer";

    var BpsSentAudioDiv = document.createElement('div');
    BpsSentAudioDiv.setAttribute('id', 'BpsSentAudio_' + evt.stream);
    BpsSentAudioDiv.className = "chartContainer";

    pubInfo.appendChild(connectionState);
    pubInfo.appendChild(pubDiv);
    //pubInfo.appendChild(pubDetail);


    // pubSubsDiv va dentro del detail
    // pubDetail.appendChild(pubSubsDiv);
    // pubSubsDiv.appendChild(pubGraphsDiv);

    // Detail va dentro de la lista de publishers
    pubsListDiv.appendChild(pubInfo);

    // El summary va antes que el pubSubsDiv, dentro del detail
    // pubDetail.insertBefore(pubSum, pubSubsDiv);

    // pubGraphsDiv.appendChild(BpsSentVideoDiv);
    // pubGraphsDiv.appendChild(BpsSentAudioDiv);

   
}

// SUBSCRIBE EVENT
var updateEventSubscribe = function(evt){


    var pubInfo = document.getElementById('pubInfo' + evt.stream);

    var subInfo = document.createElement('div');
    subInfo.setAttribute('id', "subInfo_" + evt.user + "_" + evt.stream);
    subInfo.className = 'subscriber_info';

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + evt.user + "_" + evt.stream);
    connectionState.className = "status_point";

    
    // Detail que contiene todo lo relacionado con un subscriber
    var subDetail = document.createElement('details');
    subDetail.setAttribute('id', "subDetail_" + evt.user + "_" + evt.stream);
    subDetail.className = "subscriberDetail";
    subDetail.setAttribute('user', evt.user);

    // Summary con el nombre del subscriber
    var subSum = document.createElement('summary');
    subSum.innerHTML = "Detail";

    // Div que contiene toda la información relacionada con un subscriber
    var subDiv = document.createElement('div');
    subDiv.setAttribute('id', 'sub_' + evt.user + '_' + evt.stream);
    subDiv.innerHTML = "<p> SUBSCRIBER " + evt.user + '</p>';

    pubInfo.appendChild(subInfo);
    subInfo.appendChild(connectionState);
    subInfo.appendChild(subDiv);
    // subInfo.appendChild(subDetail);
    // subDetail.insertBefore(subSum, subDiv);


}

// UNPUBLISH EVENT
var updateEventUnpublish = function( evt) {
   var pubs = document.getElementById('pubsList');
   var pub = document.getElementById('pubInfo' + evt.stream);
   pubs.removeChild(pub);
   // var subs = document.getElementsByTagName('details');

   // for ( var i = 0; i<subs.length; i++){
   //      if (subs[i].getAttribute('user')){
   //          if (subs[i].getAttribute('user') == evt.user){
   //              var sub = subs[i];
   //              var parent = sub.parentNode;
   //              parent.removeChild(sub);
   //          }
   //      }

   //  }
   
}

var updateEventStatus = function (evt) {
    
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
            $("#con_state_" + id).addClass('status_point');
            break;
    }
    
}


// SENDER STATS
var updateStatsPublisher = function(evt) {
    var pubGraphsDiv = document.getElementById('pubGraphs_' +evt.pub);

    // Compruebo si es la primera vez que llegan estadísticas
    if (!document.getElementById("statsPub"+evt.pub)){

        // Div que contiene las estadísticas del publisher
        var stats = document.createElement('div');
        stats.setAttribute('id', 'statsPub' + evt.pub);

        // Párrafo que contiene las estadísticas de audio
        var audio = document.createElement('p');
        audio.setAttribute('id', 'audioPub'+evt.pub);
        audio.className = "audio";

        // Párrafo que contiene las estadísticas de video
        var video = document.createElement('p');
        video.setAttribute('id', 'videoPub'+evt.pub);
        video.className = "video";

        var BpsSentVideoDiv = document.createElement('div');
        BpsSentVideoDiv.setAttribute('id', 'BpsSentVideo_' + evt.pub);
        BpsSentVideoDiv.className = "chartContainer";

        var BpsSentAudioDiv = document.createElement('div');
        BpsSentAudioDiv.setAttribute('id', 'BpsSentAudio_' + evt.pub);
        BpsSentAudioDiv.className = "chartContainer";



    }
    else {
        var stats = document.getElementById("statsPub"+evt.pub);
        var audio = document.getElementById("audioPub" + evt.pub);
        var video = document.getElementById("videoPub" + evt.pub);
        var BpsSentAudioDiv = document.getElementById('BpsSentAudio_' + evt.pub);
        var BpsSentVideoDiv = document.getElementById('BpsSentVideo_' + evt.pub);


    }


    var pubDiv = document.getElementById("pub"+evt.pub);

    for (var i in evt.stats){
        var date = new Date();
        var time = date.getTime();

        if (evt.stats[i].type==="audio"){

            audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[i].ssrc + '<br>' + "rtcpBytesSent: " + evt.stats[i].rtcpBytesSent + '<br>' + "rtcpPacketSent: " + evt.stats[i].rtcpPacketSent;
            audio.setAttribute('ssrc', evt.stats[i].ssrc);
            if (!charts['BpsSentAudio_' + evt.pub]){
                GRAPH.generateBpsSent('BpsSentAudio_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp, "Audio");
            }
            else {
                GRAPH.updateBpsSent('BpsSentAudio_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp);
            }

        }

        else {
            video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[i].ssrc + '<br>' + "rtcpBytesSent: " + evt.stats[i].rtcpBytesSent + '<br>' + "rtcpPacketSent: " + evt.stats[i].rtcpPacketSent;
            video.setAttribute('ssrc', evt.stats[i].ssrc);
            if (!charts['BpsSentVideo_' + evt.pub]){
                GRAPH.generateBpsSent('BpsSentVideo_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp, "Video");
            }
            else {
                GRAPH.updateBpsSent('BpsSentVideo_' + evt.pub, evt.stats[i].rtcpBytesSent, evt.timestamp);
            }
        }
    }
    
    if (pubDiv && stats && audio && video) {
        stats.appendChild(audio);
        stats.appendChild(video);
        pubDiv.appendChild(stats);


    }
    
}


// RECEIVER STATS
var updateStatsSubscriber = function(evt){
      
    var subDiv = document.getElementById("sub_"+evt.subs +"_" + evt.pub);

    // Compruebo si es la primera vez que llegan estadísticas
    if (!document.getElementById("statsSub_"+evt.subs+"_" + evt.pub)){
        var stats = document.createElement('div');
        stats.setAttribute('id', 'statsSub_' + evt.subs+"_" + evt.pub);

        var audio = document.createElement('p');
        audio.setAttribute('id', 'audioSub_'+evt.subs +"_" +evt.pub);
        audio.className = "audio";

        var video = document.createElement('p');
        video.setAttribute('id', 'videoSub_'+evt.subs +"_" + evt.pub);
        video.className = "video";

        var subVideoGraphsDetail = document.createElement('details');
        subVideoGraphsDetail.setAttribute('id', 'subVideoGraphsDetail_' + evt.subs + "_" + evt.pub);
        subVideoGraphsDetail.className = "subscriberVideoGraphsDetail";

        var subAudioGraphsDetail = document.createElement('details');
        subAudioGraphsDetail.setAttribute('id', 'subAudioGraphsDetail_' + evt.subs + "_" + evt.pub);
        subAudioGraphsDetail.className = "subscriberAudioGraphsDetail";

        var subVideoGraphsSum = document.createElement('summary');
        subVideoGraphsSum.setAttribute('id', 'subVideoGraphsSum_' + evt.subs + "_" + evt.pub);
        subVideoGraphsSum.innerHTML = "Video Graphs!";

        var subAudioGraphsSum = document.createElement('summary');
        subAudioGraphsSum.setAttribute('id', 'subAudioGraphsSum_' + evt.subs + "_" + evt.pub);
        subAudioGraphsSum.innerHTML = "Audio Graphs!";

        var subVideoGraphsDiv = document.createElement('div');
        subVideoGraphsDiv.setAttribute('id', "subVideoGraphs_" + evt.subs + "_" + evt.pub );

        var subAudioGraphsDiv = document.createElement('div');
        subAudioGraphsDiv.setAttribute('id', "subAudioGraphs_" + evt.subs + "_" + evt.pub );


        var subDetail = document.getElementById('subDetail_' + evt.subs + "_" + evt.pub);

        var fractionLostVideoDiv = document.createElement('div');
        fractionLostVideoDiv.setAttribute('id', 'fractionLostVideo_' + evt.subs + "_" + evt.pub);
        fractionLostVideoDiv.className = "fractionLost";


        var fractionLostAudioDiv = document.createElement('div');
        fractionLostAudioDiv.setAttribute('id', 'fractionLostAudio_' + evt.subs + "_" + evt.pub);        
        fractionLostAudioDiv.className = "fractionLost";

        var ppsLostVideoDiv = document.createElement('div');
        ppsLostVideoDiv.setAttribute('id', 'ppsLostVideo_' + evt.subs + "_" + evt.pub);
        ppsLostVideoDiv.className = "chartContainer";
        
        var ppsLostAudioDiv = document.createElement('div');
        ppsLostAudioDiv.setAttribute('id', 'ppsLostAudio_' + evt.subs + "_" + evt.pub);
        ppsLostAudioDiv.className = "chartContainer";

        

    }
    else {
        var stats = document.getElementById("statsSub_"+evt.subs+"_" + evt.pub);
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

    }

    if (subDiv) {
        stats.appendChild(audio);
        stats.appendChild(video);
        subDiv.appendChild(stats);
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
        

    if (document.getElementById('audioPub' + evt.pub)){

        if (document.getElementById('audioPub' + evt.pub).ssrc == evt.stats[0].sourceSsrc){
            audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[0].ssrc + '<br>' + "fractionLost: " + evt.stats[0].fractionLost + '<br>' + "jitter: " + evt.stats[0].jitter + '<br>' + "packetsLost: " + evt.stats[0].packetsLost;
            video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[1].ssrc + '<br>' + "fractionLost: " + evt.stats[1].fractionLost + '<br>' + "jitter: " + evt.stats[1].jitter + '<br>' + "packetsLost: " + evt.stats[1].packetsLost;
            if (charts){

                //FRACTION LOST
                if (!charts['fractionLostVideo_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                }
                else {
                    GRAPH.updateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                }

                if (!charts['fractionLostAudio_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                }
                else {
                    GRAPH.updateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                }

                //PACKETS PER SECOND LOST

                var date = new Date();
                var time = date.getTime();
                if (!charts['ppsLostVideo_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                }
                else {
                    // CAMBIAR VALOR, SOLO PARA PRUEBA
                    GRAPH.updatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                }

                if (!charts['ppsLostAudio_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                }
                else {
                    GRAPH.updatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                }




            }
        }
        else {
            audio.innerHTML = "AUDIO STATS <br>" + "ssrc: " + evt.stats[1].ssrc + '<br>' + "fractionLost: " + evt.stats[1].fractionLost + '<br>' + "jitter: " + evt.stats[1].jitter + '<br>' + "packetsLost: " + evt.stats[1].packetsLost;
            video.innerHTML = "VIDEO STATS <br>" + "ssrc: " + evt.stats[0].ssrc + '<br>' + "fractionLost: " + evt.stats[0].fractionLost + '<br>' + "jitter: " + evt.stats[0].jitter + '<br>' + "packetsLost: " + evt.stats[0].packetsLost;
            if (charts){

                //FRACTION LOST
                if (!charts['fractionLostVideo_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                }
                else {
                    GRAPH.updateFractionLost('fractionLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].fractionLost);
                }
                if (!charts['fractionLostAudio_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                }
                else {
                    GRAPH.updateFractionLost('fractionLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].fractionLost);
                }

                //PACKETS PER SECOND LOST

                var date = new Date();
                var time = date.getTime();
                if (!charts['ppsLostVideo_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                }
                else {
                    //CAMBIAR VALOR, SOLO PARA PRUEBA
                    GRAPH.updatePpsLost('ppsLostVideo_' + evt.subs + "_" + evt.pub, evt.stats[0].packetsLost, time);
                }

                if (!charts['ppsLostAudio_' + evt.subs + "_" + evt.pub]){
                    GRAPH.generatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                }
                else {
                    GRAPH.updatePpsLost('ppsLostAudio_' + evt.subs + "_" + evt.pub, evt.stats[1].packetsLost, time);
                }

            }
        }

        

    }
}


socket.on('newEvent', function (evt) {

   var theEvent = evt.theEvent;
   switch (evt.theEvent.type){
      case "user_connection":
         console.log("Connection");
         //updateEventConnection(evt.theEvent);
         break;
      
   	
   	case "publish":
   		console.log("User " + theEvent.user + " Publish" );
   		updateEventPublish(theEvent);
         break;
   	
    case "subscribe":
   		console.log("User " + theEvent.user + " Subscribe" );
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

socket.on('newStats', function (evt) {

   var theStats = evt.theStats;


   if (!theStats.subs){
      updateStatsPublisher(theStats);
   }
   else updateStatsSubscriber(theStats);


 });