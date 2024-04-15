const mqtt = require("mqtt");
var client = mqtt.connect("mqtt://broker.hivemq.com");
client.on("connect", function () {
  setInterval(function () {
    var random = Math.random() * 50;
    console.log(random);
    if(random<30){
        client.publish('Pradeep', 'Simple MQTT using HiveMQ: ' + random.toString() + '.')
    }
  }), 30000;
});
