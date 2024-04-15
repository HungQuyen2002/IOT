const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./Components/db");
const { convertToVietnameseTime } = require("./Components/dateConverter");
const cors = require("cors");  
const {
  saveSensorData,
  getSensorData,
} = require("./Components/sensorController");
const {
  saveAction,
  getActionHistory,
} = require("./Components/actionController");

const app = express();

const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

connectDB()
  .then(() => {
    // API lưu dữ liệu cảm biến
    app.post("/save_data", saveSensorData);

    // API lấy dữ liệu cảm biến
    app.get("/sensor_data", getSensorData);

    // API lưu lịch sử hành động
    app.post("/save_action", saveAction);

    // API lấy lịch sử hành động
    app.get("/action_history", getActionHistory);

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to SQL Server:", err);
  });
