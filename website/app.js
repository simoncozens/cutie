var data = [];
var config = {};
var ws = new WebSocket("ws://"+document.location.hostname+":9090");

var addLineGraph = function (widget, d, wconfig) {
  var gElem = $("<div>")
  gElem.addClass("graph")
  gData = []
  d.forEach(function(el) {
    if (el.value != 0 || !wconfig.ignore_zeros) {
      gData.push({x: new Date(el.timestamp).getTime()/1000, y: el.value })
    }
  })
  var graph = new Rickshaw.Graph( {
    element: gElem[0],
    renderer: "line",
    width: 320,
    height: 200,
    max: wconfig.max,
    min: wconfig.min,
    series: [
      {
        color: 'steelblue',
        data: gData,
        name: wconfig.title
      }
    ]
  } );
  var x_axis = new Rickshaw.Graph.Axis.Time({graph: graph});
  var yAxis = new Rickshaw.Graph.Axis.Y({graph: graph });
  var hoverDetail = new Rickshaw.Graph.HoverDetail( {graph: graph } );
  graph.render();
  x_axis.render();
  yAxis.render();
  widget.append(gElem);
}

var addButton = function(widget, d, wconfig) {
  var butt = $('<br/><div><label class="switch"><input type="checkbox"><span class="slider round"></span></label></div>')
  widget.append(butt)
}
var redrawScreen = function() {
  $("#widgets").empty()
  config.widgets.forEach(function (w,i) {
    wHtml = $("<div>");
    wHtml.addClass("widget");
    wHtml.append('<span class="title">'+w.title+"</span>")
    if(w.type=="linegraph") { addLineGraph(wHtml, data[i],w) }
    if(w.type=="button") { addButton(wHtml, data[i],w) }
    $("#widgets").append(wHtml);
  })
}
ws.onmessage = function(evt) {
   msg = JSON.parse(evt.data)
   if (msg.type == "log") {
     $("#log").html($("#log").html()+msg.timestamp+" : "+msg.message+"\n");
   } else if (msg.type == "config") {
    config = msg.config;
   } else if (msg.type == "data") {
    data = msg.data;
    redrawScreen()
   }
};
ws.onopen = function (event) {
  ws.send("Send me config!");
  ws.send("Send me data!");
}
