Mustache = require("mustache")
auxiliary = {
  "requireDirectory": function(d) {
    var normalizedPath = require("path").join(__dirname, d);
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./"+d+"/" + file);
    })
  },
  "fileData": function(i,message) {
    var widget = cutie.config.widgets[i]
    if (!cutie.data[i]) { cutie.data[i]=[] }

    // Check alerters
    if (widget.alerts) {
      widget.alerts.forEach(function (al) {
        auxiliary.checkForAlert(message,widget,al)
      })
    }

    cutie.data[i].push(message)
    var limit = 100
    if ("limit" in widget) { limit = widget.limit }
    cutie.data[i].slice(-limit)
    cutie.storage.setItemSync('data',cutie.data)
    auxiliary.log("New message on widget "+i+": "+JSON.stringify(message))
  },
  "checkForAlert": function (message, widget, alert) {
    var value = message.value
    if (!(alert.alerter in alerters)) {
      console.log("Unknown alert system '"+alert.alerter+"' in "+widget.title)
      return false;
    }
    if (eval(alert.condition)) { // HERE BE DRAGONS
      var alertMess = Mustache.render(alert.message, message)
      var driver = alerters[alert.alerter]
      driver.sendAlert(alert, alertMess)
    }
  },
  "log": function(message) {
    cutie.wss.clients.forEach(function (client) {
      var msg = {"type": "log", "timestamp":(new Date()), "message": message}
      client.send(JSON.stringify(msg));
      client.send(JSON.stringify({"type": "data", "data": cutie.data}));
    })
  },
  "triggerAction": function(i) {
    var w = cutie.config.widgets[i]
    if (w.action in actions) {
      actions[w.action].fire(w);
      auxiliary.log("Firing action for widget "+w.title)
    }
  }
};