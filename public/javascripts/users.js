var socket = io();
var view_type = "list";
var search;

$(document).ready(function(){

    $('#back').click(function(){ window.location='/ackuaria'});
    $('#userModal').on('show.bs.modal', function (event) {
      var user = $(event.relatedTarget);
      var userID = user.data('userid');
      var userName = user.data('username');
      $('#username').html(" " + userName);
      $('#userid').html(" " + userID);
      $('#dataModal').html(sdp);

    })
    $('#searchBar').keyup(function () {
        search();
    });

    search = function() {
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here
        filter_array = filter.split(' '); // split the user input at the spaces
        var arrayLength = filter_array.length; // Get the length of the filter array

        if (view_type == "grid") {
            $('.userContainer').each(function() {
                var _this = $(this);
                var title = _this.find('.userName').text().toLowerCase();
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
            $('.user').each(function() {
                var _this = $(this);
                var title = _this.find('.userName').text().toLowerCase();
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
            paintUsersList();
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
            view_type = "grid";
            paintUsersGrid();
        }
        $(this).addClass('active');
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
    });
});

socket.on('newEvent', function(evt) {
  lastEvent = evt;
    var event = evt.event;
    var rooms = evt.rooms;
    room = rooms[roomID];

    users = {};
    var totalUsers = evt.users;
    for (var s in totalUsers) {
        if (room.users.indexOf(s) > -1) {
         users[s] = totalUsers[s];
        }
    }

    if (view_type == "grid") paintUsersGrid();
    else if (view_type == "list") paintUsersList();
    else paintPublishersFails();
});


var paintUsersGrid = function() {
    if (room) {
        $('#users').html("");
        var nUsers = room.users.length;
        updateNUsers(nUsers);
        for (var userID in users){
            if (users[userID] !== undefined) {
                var nStreams = users[userID].streams.length;
                var userName = users[userID].userName;
                var nSubscriptions = users[userID].subscribedTo.length;
                createNewPublisherGrid(roomID, userID, nStreams, nSubscriptions, userName);
            }
        }
        if (nUsers == 0) {
            $('#users').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no users in this room right now</strong></div>')
        }
    }
    search();
}

var paintUsersList = function() {
    if (room) {
        $('#users').html("");
        $('#users').append('<div class="userContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-4">User Name</th><th class="col-md-2">User Id</th><th class="col-md-2">Number of published streams</th><th class="col-md-2">Number of subscribed streams</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
        var nUsers = room.users.length;
        updateNUsers(nUsers);
        for (var userID in users){
            if (users[userID] !== undefined) {
                var nStreams = users[userID].streams.length;
                var userName = users[userID].userName;
                var nSubscriptions = users[userID].subscribedTo.length;
                createNewUserList(roomID, userID, nStreams, nSubscriptions, userName);
            }
        }
        if (nUsers == 0) {
            $('#users').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no users in this room right now</strong></div>')
        }
        Sortable.init()
    }
    search();
}

var createNewPublisherGrid = function(roomID, userID, nStreams, nSubscriptions, userName){
    $('#users').append('<div class="col-lg-2 col-md-3 col-sm-4 col-xs-6 userContainer show_grid"><div class="user" id="pub_' + userID + '" data-userid="' + userID + '"><p><div class="userName"> ' + userName +'</div></p><p><div class="userId">' + userID +'</div></p><div class="streamsInUser"><div class="streams"><span id="number" class="bold">' + nStreams + '/' + nSubscriptions + '</span> <span class="light">STREAMS</span> <span class="fa fa-users"></span></div></div></div></div>')
    $('#user_'+ userID).click(function() {
        var userid = $(this).data('');
        if (userid != undefined || userid != null) {
            window.location = '/ackuaria/user?userid=' + userid + '&room_id='+ roomID;
        }
    })
}

var createNewUserList = function(roomID, userID, nStreams, nSubscriptions, userName){
    $('#bodyTable').append('<tr class="user" id="user_' + userID + '" data-userid="' + userID + '"><th class="userName">' + userName + '</th><th class="userId">' + userID + '</th><th id="streamsInUser">' + nStreams + '</th><th id="subscriptionsInUser">' + nSubscriptions + '</th></tr>');
    $('#user_'+ userID).click(function() {
        var userid = $(this).data('userid');
        if (userid != undefined || userid != null) {
            window.location = '/ackuaria/pub?userid=' + userid + '&room_id='+ roomID;
        }
    })
}

var updateNUsers = function(nUsers) {
    $('#numberUsers').html(nUsers);
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
