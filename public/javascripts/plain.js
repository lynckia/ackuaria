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

    createNewPublisher(evt.user, evt.stream, evt.name, evt.room);
}

// SUBSCRIBE EVENT
var updateEventSubscribe = function(evt) {

    createNewSubscriber(evt.user, evt.stream, evt.name);

}

// UNPUBLISH EVENT
var updateEventUnpublish = function(evt) {

    removePublisher(evt.stream, evt.room);

    removeSubscriber(evt.user);

    if (!document.getElementById('pubsList_' + evt.room).hasChildNodes()){
        removeRoom(evt.room);
    }
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

var createNewRoom = function(roomId){
    var roomsListDiv = document.getElementById('roomsList');
    var newRoom = document.createElement('div');
    newRoom.setAttribute('id', "room_" + roomId);

    var roomInfo = document.createElement('div');
    roomInfo.setAttribute('id', 'roomInfo_'+ roomId);
    roomInfo.innerHTML = "ROOM " + roomId;
    roomInfo.className = "roomInfo";

    var roomPubs = document.createElement('div');
    roomPubs.setAttribute('id', 'roomPubs_' + roomId);

    newRoom.appendChild(roomInfo);
    newRoom.appendChild(roomPubs);
    roomsListDiv.appendChild(newRoom);

}
var createNewPublisher = function(user, stream, name, room) {

    var roomPubs = document.getElementById('roomPubs_' + room);
    if (roomPubs===null){
        createNewRoom(room);
        var roomPubs = document.getElementById('roomPubs_' + room);
    }

    // Div de la Lista de todos los publishers
    var pubsListDiv = document.getElementById('pubsList_' + room);
    if (!pubsListDiv){
        var pubsListDiv = document.createElement('div');
        pubsListDiv.setAttribute('id', 'pubsList_' + room);
    }

    var pubInfo = document.createElement('div');
    pubInfo.setAttribute('id', "pubInfo" + stream);
    pubInfo.className = "publisher";
    pubInfo.innerHTML = name + ": PUBLISHER " + user + " CON STREAM " + stream;

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + stream);
    connectionState.className = "status_point";

    
    pubInfo.appendChild(connectionState);
    
    // Detail va dentro de la lista de publishers
    pubsListDiv.appendChild(pubInfo);

    // El summary va antes que el pubSubsDiv, dentro del detail

    roomPubs.appendChild(pubsListDiv);

}

var createNewSubscriber = function(user, stream, name) {
    var pubInfo = document.getElementById('pubInfo' + stream);

    var subInfo = document.createElement('div');
    subInfo.setAttribute('id', "subInfo_" + user + "_" + stream);
    subInfo.className = 'subscriber_info';
    subInfo.setAttribute("user", user);
    subInfo.innerHTML = name + ": SUBSCRIBER " + user;

    var connectionState = document.createElement('div');
    connectionState.setAttribute('id', "con_state_" + user + "_" + stream);
    connectionState.className = "status_point";

    

    pubInfo.appendChild(subInfo);
    subInfo.appendChild(connectionState);
    
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

var removePublisher = function(stream, room) {

    var pubs = document.getElementById('pubsList_' + room);
    var pub = document.getElementById('pubInfo' + stream);
    pubs.removeChild(pub);

}

var removeRoom = function(room){
    var roomToRemove = document.getElementById('room_'  + room);
    var roomsList = document.getElementById('roomsList');
    roomsList.removeChild(roomToRemove);
}

var paintUsers = function(roomsInfo, userStream, statusId, userName, rooms, streamRoom) {

    if (!hasPublishers()) {
        for (var j = 0; j<rooms.length; j++){
            createNewRoom(rooms[j]);
        }
        for (var room in roomsInfo){

            for (var stream in roomsInfo[room]) {
                createNewPublisher(userStream[stream], stream, userName[userStream[stream]], streamRoom[stream]);
                createStatus(stream, statusId[stream]);
                for (var i = 0; i < roomsInfo[room][stream].length; i++) {
                    createNewSubscriber(roomsInfo[room][stream][i], stream, userName[roomsInfo[room][stream][i]]);
                    var id = roomsInfo[room][stream][i] + "_" + stream;
                    createStatus(id, statusId[id]);
                }
            }
        }
    }
}