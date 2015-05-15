/**
 * Main js logic
 *
 */

var monitoringTpl;
var tableTpl;
var messageTpl;

var url = 'http://www.json-generator.com/api/json/get/bGGGtKKsya?indent=0';

var globalId = 0;
var prefix = 'monitor-';
var dataContainer = '.data';
var graphContainer = '.graph';

var timeout = 20000;
var intervalDuration = 1000 * 5 * 60; // 5 minutes

var Monitors = [];
var monitorLimit = 10;

// ----------------------------------------------------------------------------------------------

//
// TEMPLATES
//

var getMonitorTpl = $.get('/js/templates/monitoring.dust', function(tpl){
    monitoringTpl = dust.compile(tpl, 'monitoring');
    dust.loadSource(monitoringTpl);
});

var getTableTpl = $.get('/js/templates/table.dust', function(tpl){
    tableTpl = dust.compile(tpl, 'table');
    dust.loadSource(tableTpl);
});

var getMessageTpl = $.get('/js/templates/message.dust', function(tpl){
    messageTpl = dust.compile(tpl, 'message');
    dust.loadSource(messageTpl);
});

$.when(getMonitorTpl, getTableTpl, getMessageTpl)
    .done(function(tplMonitor, tplTable, tplMessage){
        intervalRequest(url);
    })
    .fail(function(xhr, type, error){
        throwError(error);
    });

// ----------------------------------------------------------------------------------------------

//
// MAIN LOGIC
//

// get data
function getMonitorData(req){
    // change state
    $('.refresh').loadingOn();

    // init request
    $.ajax({
        type: 'GET',
        url: req,
        dataType: 'json',
        timeout: timeout,
        crossDomain: true
        })
        .done(function(data){
            if(data){
                $.each(data, renderMonitor);
            } else {
                checkLater();
            }
            })
        .fail(function(xhr, type, error){
            throwError(error);
            })
        .always(function(){
            $('main').loadingOff();
            $('.refresh').loadingOff();
        });
}

// render monitor
function renderMonitor(id, data){
    var elementID = prefix + globalId;
    var graphID = elementID + '-graph';
    var tableID = elementID + '-table';
    var content = $('#content');
    var monitor;

    // add monitor to collection
    Monitors.push(elementID);

    // render skeleton
    dust.render('monitoring', {id : elementID, gId : graphID, tId : tableID}, function(err, out){
        if(err){
            throwError(err);
            return;
        }

        // append monitor skeleton
        content.prepend(out);
        monitor = $('#' + elementID);

        // assign controls
        setHandlers(elementID);

        // show loading state
        monitor.loadingOn();

        // render table
        if(data.data && data.data.length){
            dust.render('table', data, function(err, out){
                if(err){
                    throwError(err);
                    return;
                }

                // append table
                $('#' + elementID + ' ' + dataContainer).append(out);

                // remove loading state
                setTimeout(function(){
                    monitor.loadingOff();
                }, 500);
            });
        } else {
            dust.render('message', data, function(err, out){
                if(err){
                    throwError(err);
                    return;
                }

                // append message
                $('#' + elementID + ' ' + dataContainer).append(out);

                // remove loading state
                setTimeout(function(){
                    monitor.loadingOff();
                }, 500);
            });
        }

        // render graph
        if(data.graphData && data.graphData.nodes){
            renderGraph(graphID, data.graphData);
        } else {
            $('#' + graphID).remove();
        }

        // iterate id
        globalId++;

        // hide unused monitors
        refreshMonitors();
    });
}

// render graph
function renderGraph(id, data){

    // graph object
    var g = {
        nodes: [],
        edges: []
    };

    // create sigma instance
    var s = new sigma({
        graph: g,
        container: id,
        renderer: {
            container: document.getElementById(id),
            type: 'canvas'
        },
        settings: {
            minNodeSize: 4,
            maxNodeSize: 8,
            minEdgeSize: 2,
            maxEdgeSize: 2,
            sideMargin: 1,
            minArrowSize: 8,

            font: 'Arial',
            labelThreshold: 4,

            defaultLabelSize: 12,
            defaultNodeColor: '#fff',
            defaultEdgeColor: '#eee',
            defaultLabelColor: '#fff',

            defaultEdgeType: 'arrow',

            edgeColor: 'default',
            borderSize: 2,
            defaultNodeBorderColor: '#666',
            labelHoverShadowColor: 'transparent',
            defaultHoverLabelBGColor: '#fff',
            defaultLabelHoverColor: '#333'
        }
    });

    //
    // parse json
    try{
        sigma.parsers.json(
            // data
            data,
            // sigma reference
            s,
            // callback
            function() {

                var i,
                    nodes = s.graph.nodes(),
                    nodesLength = nodes.length,
                    edges = s.graph.edges(),
                    edgesLength = edges.length;

                // iterate nodes
                for (i = 0; i < nodesLength; i++) {
                    nodes[i].x = Math.random();
                    nodes[i].y = Math.random();
                    nodes[i].size = s.graph.degree(nodes[i].id);
                    nodes[i].label = " " + nodes[i].id;
                }

                // iterate edges
//                for (i = 0; i < edgesLength; i++) {
//                    edges[i].size = 5;
//                }

                // refresh kills proper arrow drawing
                //s.refresh();

                // force layout
                s.startForceAtlas2({
                    barnesHutOptimize: true,
                    adjustSizes: true,
                    gravity: 2.8 // greater value - greater proximity
                });

                setTimeout(function(){
                    s.killForceAtlas2();
                }, 1500);

            }
        );
    } catch(err){
        throwError(err);
    }

}

//
// hide unused monitors
function refreshMonitors(){
    var i;

    for(i=0; i<Monitors.length; i++){
        $('#' + Monitors[i]).removeClass('__hidden');
    }

    if(globalId > monitorLimit){
        var hiddenMonitors = Monitors.slice(0, Monitors.length - monitorLimit);
        for(i=0; i<hiddenMonitors.length; i++){
            $('#' + hiddenMonitors[i]).addClass('__hidden');
        }
    }
}

//
// init interval request
function intervalRequest(req){
    // set interval
    setInterval(function(){
        getMonitorData(req);
    }, intervalDuration);
    // first call
    getMonitorData(req);
}

// ----------------------------------------------------------------------------------------------

//
// CONTROLS
//

function setHandlers(id){
    var monitor = $('#' + id);
    monitor.on('click.monitor', '.js-remove', function(){
        // delete from screen
        monitor.remove();
        // delete from list
        Monitors.splice(Monitors.indexOf(id), 1);

        // callbacks
        notify('Monitor removed', 1000);
        refreshMonitors();
    });
}

//
// manual data call
$('.js-refresh').on('click', function(){
    getMonitorData(url);
});

// ----------------------------------------------------------------------------------------------

//
// UTILS
//


//
// resolve response with message
function checkLater(){
    var refresh = $('.refresh');

    withDelay(
        function(){ refresh.addClass('__message'); },
        function(){ refresh.removeClass('__message'); }
    );
}