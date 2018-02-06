var mqtt = require('mqtt')
var clients = {}

datasources["mqttsub"] = {
  "init": function () {
    if (!("mqttconnections" in cutie.config)) return;
    // Establish connections
    for ([key, connection] of Object.entries(cutie.config.mqttconnections)) {
      clients[key] = mqtt.connect({
          "servers":[{
            "host": connection.server,
            "port": connection.port,
          }],
          "username": connection.username,
          "password": connection.password
        })
      clients[key].on('connect', function () {
        console.log("Subscribing to "+connection.topic)
        clients[key].subscribe(connection.topic)
      })
    }
    for (const i in cutie.config.widgets) {
      const widget = cutie.config.widgets[i]
      if (widget.datasource=="mqttsub") {
        clients[widget.connection].on('message', function (topic, message) {
          console.log("New message on "+widget.title)
          message = JSON.parse(message);
          auxiliary.fileData(i,
          {
            "timestamp": new Date(message.metadata.time),
            "value": message.payload_fields[widget.field]
          })
        })
      }
    }
  }
}