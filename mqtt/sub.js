const mqtt = require ("mqtt");
var client = mqtt.connect ('mqtt://broker.hivemq.com');
client.on('connect', function (){
    client.subscribe("Pradeep")
    console.log("client has subcribed successfully");
});

    client.on('message', function(topic, message){
        console.log(message.toString());
    })
                                  
