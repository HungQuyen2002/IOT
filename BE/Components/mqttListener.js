const mqtt = require("mqtt");
const sql = require("mssql");
const { saveSensorData } = require("./sensorController");
const { saveAction } = require("./actionController");

const mqttClient = mqtt.connect("mqtt://192.168.190.186", {
  clientId: "backend-client",
  username: "hung",
  password: "hung",
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT Broker");
  mqttClient.subscribe("datasensor");
  mqttClient.subscribe("controll_device");
});

mqttClient.on("message", (topic, message) => {
  if (topic === "datasensor") {
    const data = JSON.parse(message.toString());
    // Gọi hàm lưu dữ liệu cảm biến từ sensorController
    saveSensorData(data);
  } else if (topic === "controll_device") {
    const action = message.toString();
    // Gọi hàm lưu lịch sử hành động từ actionController
    saveAction(action);
  }
});

module.exports = mqttClient;
