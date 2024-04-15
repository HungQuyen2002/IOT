const mqtt = require("mqtt");
const sql = require("mssql");
const { saveSensorDataToDB } = require("./sensorController");
const { saveActionToDB } = require("./actionController"); // Import function from actionController

const mqttClient = mqtt.connect("mqtt://192.168.190.186", {
  clientId: "backend-client",
  username: "hung",
  password: "hung",
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT Broker");
  mqttClient.subscribe("datasensor");
  mqttClient.subscribe("controll_device"); // Subscribe to the control topic
});

mqttClient.on("message", (topic, message) => {
  if (topic === "datasensor") {
    const data = JSON.parse(message.toString());
    saveSensorDataToDB(data);
  } else if (topic === "controll_device") {
    const action = message.toString();
    saveActionToDB(action);
  }
});

function saveSensorDataToDB(data) {
  const { temp, hum, light } = data;
  const request = new sql.Request();
  request.query(
    `INSERT INTO SensorData (temperature, humidity, light) VALUES (${temp}, ${hum}, ${light})`,
    (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Data saved to SQL Server");
      }
    }
  );
}

function saveActionToDB(action) {
  const request = new sql.Request();
  request.query(
    `INSERT INTO ActionHistory (action) VALUES ('${action}')`,
    (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Action saved to SQL Server");
      }
    }
  );
}

module.exports = mqttClient;
