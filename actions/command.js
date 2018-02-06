
const { exec } = require('child_process');

actions["command"] = {
  "fire": function(w) {
    exec(w.command, (error, stdout, stderr) => {
    })
  }
}