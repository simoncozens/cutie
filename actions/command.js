
const { exec } = require('child_process');

actions["command"] = {
  "fire": function(w) {
    exec(w.command, (error, stdout, stderr) => {
      if (error) {
        auxiliary.log(`Error running ${w.command}: ${error}`);
        return;
      }
    })
  }
}