var socket = io();
var show_grid = true;

$(document).ready(function(){
    //Śearch bar code
    $('#searchBar').keyup(function () {
        search();
    });

    var search = function() {
        var filter_array = new Array();
        var filter = $('#searchBar')[0].value.toLowerCase();  // no need to call jQuery here
        filter_array = filter.split(' '); // split the user input at the spaces
        var arrayLength = filter_array.length; // Get the length of the filter array
        if (show_grid) {
            $('.agentContainer').each(function() {
                var _this = $(this);
                var title1 = _this.find('.agentId').text().toLowerCase();
                var title2 = _this.find('.agentMetadata').text().toLowerCase();
                var hidden = 0;
                for (var i = 0; i < arrayLength; i++) {
                    if (title1.indexOf(filter_array[i]) < 0 && title2.indexOf(filter_array[i]) < 0) {
                        _this.hide();
                        hidden = 1;
                    }
                }
                if (hidden == 0)  {
                   _this.show();
                }
            });
        } else {
            $('.agent').each(function() {
                var _this = $(this);
                var title1 = _this.find('.agentID').text().toLowerCase();
                var title2 = _this.find('.agentMetadata').text().toLowerCase();
                var hidden = 0;
                for (var i = 0; i < arrayLength; i++) {
                    if (title1.indexOf(filter_array[i]) < 0 && title2.indexOf(filter_array[i]) < 0) {
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

    // Grid/List switch
    $('#list').click(function() {
        if (!$(this).hasClass("active")){
            show_grid = false;
            paintAgentsList();
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
            paintAgentsGrid();
            search();
        }
        $(this).addClass('active');  
        $(this).addClass('btn-primary');
        $(this).removeClass('btn-default');

        $('#list').addClass('btn-default');
        $('#list').removeClass('active');
        $('#list').removeClass('btn-primary');
    });
})
socket.on('agentsEvent', function(evt) {
    agents = evt.agents;
    streams = evt.streams;
    if (show_grid){
        paintAgentsGrid();
    } else {
        paintAgentsList();
    }
});

var paintAgentsGrid = function(){
    $('#agents').html("");
    var nAgents = Object.keys(agents).length;
    updateNAgents(nAgents);
    var keys = [];
    for (a in agents) {
        keys.push(a);
    }
    keys.sort();
    len = keys.length;
    for (i=0; i<len; i++) {
        agent = keys[i];
        if (!$('#agent_'+ agent).length){
            var agentID = agent;
            var nStreams = streams[agent].length;
            var agentMetadata = "Metadata: " + JSON.stringify(agents[agent].metadata);
            var cpu = agents[agent].stats.perc_cpu*100
            var agentCPU = "CPU: " + cpu.toFixed(2) + " %";
            createNewAgentGrid(agentID, nStreams, agentMetadata, agentCPU);
        } else {
            var agentID = agent;
            var nStreams = streams[agent].length;
            updateNStreams(agentID, nStreams);
        }
    }
    if (nAgents == 0) {
        $('#agents').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no agents</strong></div>')
    }
};

var paintAgentsList = function(){
    $('#agents').html("");
    var nAgents = Object.keys(agents).length
    updateNAgents(nAgents);

    var keys = [];
    for (a in agents) {
        keys.push(a);
    }
    keys.sort();
    len = keys.length;
    $('#agents').append('<div class="agentContainer show_list"><table class="sortable-theme-bootstrap table table-hover" data-sortable><thead><tr><th class="col-md-4">ID</th><th class="col-md-4">Agent Metadata</th><th class="col-md-2">Streams in Agent</th><th class ="col-md-2">CPU Use</th></tr></thead><tbody id="bodyTable"></tbody></table></div>');
    for (i=0; i<len; i++) {
        agent = keys[i];
        if (!$('#agent_'+agent).length){
            var agentID = agent;
            var nStreams = streams[agent].length;
            var cpu = agents[agent].stats.perc_cpu*100
            var agentCPU = cpu.toFixed(2) + " %";
            var agentMetadata = JSON.stringify(agents[agent].metadata);
            createNewAgentList(agentID, nStreams, agentMetadata, agentCPU);        
        } else {
            var agentID = agent;
            var nStreams = streams[agent].length;
            updateNStreams(agentID, nStreams);
        }
    }
    if (nAgents == 0) {
        $('#agents').html('<div class="alert alert-danger" role="alert"><strong>Oops! There are no agents</strong></div>')
    }
    Sortable.init()
};

var createNewAgentGrid = function(agentID, nStreams, agentMetadata, agentCPU){
    $('#agents').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 agentContainer show_grid"><div class="agent" id="agent_' + agentID + '"data-agent_id="' + agentID + '"><div class="agentMetadata">' + agentMetadata + '</div><div class="agentCPU">' + agentCPU + '</div><div class="agentId">' + agentID + '</div><div class="streamsInAgent"><div class="streams"><span id="number" class="bold">' + nStreams + '</span> <span class="light">STREAMS</span> <span class="fa fa-user"></span></div></div></div></div>');
    $('#agent_'+ agentID).click(function() {
        var agent_id = $(this).data('agent_id');
        if (agent_id != undefined || agent_id != null) {
            window.location = '/ackuaria/agent?agent_id=' + agent_id;
        }
    })
}

var createNewAgentList = function(agentID, nStreams, agentMetadata, agentCPU){
    $('#bodyTable').append('<tr class="agent show_list" id="agent_' + agentID + '" data-agent_id="' + agentID + '"><th class="agentID">'+ agentID + '</th><th class="agentMetadata">' + agentMetadata + '</th><th id="number">' + nStreams + '</th><th id="useCPU">' + agentCPU + '</th></tr>')
    $('#agent_'+ agentID).click(function() {
        var agent_id = $(this).data('agent_id');
        if (agent_id != undefined || agent_id != null) {
            window.location = '/ackuaria/agent?agent_id=' + agent_id;
        }
    })
}

var updateNStreams = function(agentID, nStreams){
    $('#agent_' + agentID + ' .streams ' + '#number').html(nStreams);
}

var updateNAgents = function(nAgents) {
    $('#numberAgents').html(nAgents);
}
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
