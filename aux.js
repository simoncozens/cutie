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
    cutie.data[i].push(message)
    var limit = 100
    if ("limit" in widget) { limit = widget.limit }
    cutie.data[i].slice(-limit)
    cutie.storage.setItemSync('data',cutie.data)
    auxiliary.log("New message on widget "+i+": "+JSON.stringify(message))
  },
  "log": function(message) {
    cutie.wss.clients.forEach(function each(client) {
      var msg = {"type": "log", "timestamp":(new Date()), "message": message}
      client.send(JSON.stringify(msg));
      client.send(JSON.stringify({"type": "data", "data": cutie.data}));
    })
  }
};