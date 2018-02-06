var fs = require("fs")

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 9090 });
const express = require('express');
const app = express();

var entries = require('object.entries');
if (!Object.entries) { entries.shim(); }

var storage = require('node-persist');
storage.initSync();

require("./aux");

const bodyParser= require('body-parser')

datasources = {};    auxiliary.requireDirectory("datasources")
widgethandlers = {}; auxiliary.requireDirectory("widgethandlers")
alerters = {};       auxiliary.requireDirectory("alerters")
actions = {};        auxiliary.requireDirectory("actions")

// Data
var data = storage.getItemSync('data') || []
var rateLimits = storage.getItemSync('rateLimits') || {}

global.cutie =  {
  "data": data,
  "wss": wss,
  "config": config,
  "storage": storage,
  "rateLimits": rateLimits
}

var mustacheExpress = require('mustache-express');
app.engine('mustache', mustacheExpress());

app.use(bodyParser.urlencoded({extended: true,limit: '50mb'}))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.set('views', __dirname + '/website');

// Align datasources with widgets
for (const [key,ds] of Object.entries(datasources)) {
  ds.init();
}
for (const [key,alerter] of Object.entries(alerters)) {
  alerter.init();
}

app.get('/', function (req, res) {
  res.render('index.html')
})

wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(message) {
    if (message == "Send me data!") {
      ws.send(JSON.stringify({"type": "data", "data": cutie.data}));
    } else if (message == "Send me config!") {
      ws.send(JSON.stringify({"type": "config", "config": cutie.config}));
    } else if (match = message.match(/button (\d+)/)) {
      auxiliary.triggerAction(match[1])
    }
  });
});

app.use(express.static('website'))

var port = cutie.config.port || 3000
app.listen(port, () => console.log(`Cutie server listening on port ${port}`))