var twilio = require('twilio');
var client;
alerters["twilio"] = {
  "init": function () {
    var twilioconf = cutie.config.alerters.twilio
    if (!twilioconf) { return; }
    client = new twilio(twilioconf.accountSid, twilioconf.authToken);
  },
  "sendAlert": function (alert, alertMess) {
    var twilioconf = cutie.config.alerters.twilio
    client.messages.create({
      body: alertMess,
      to: twilioconf.to,
      from: twilioconf.from
      // XXX rate limit
    })
  }
}