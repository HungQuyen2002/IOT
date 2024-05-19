// Import các thư viện và component từ React và các thư viện khác
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaFan,
  FaThermometerHalf,
  FaTint,
  FaSun,
  FaLightbulb,
} from "react-icons/fa";
import mqtt from "mqtt";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  // Khai báo các state để lưu trữ dữ liệu cảm biến và trạng thái của các thiết bị
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [isLightOn, setIsLightOn] = useState<boolean>(() => {
    const storedState = localStorage.getItem("isLightOn");
    return storedState ? JSON.parse(storedState) : false;
  });
  const [isFanOn, setIsFanOn] = useState<boolean>(() => {
    const storedState = localStorage.getItem("isFanOn");
    return storedState ? JSON.parse(storedState) : false;
  });
  const [fanRotation, setFanRotation] = useState<number>(0);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [mqttClient, setMqttClient] = useState<any>(null);

  // Kết nối và đăng ký sự kiện từ máy chủ MQTT khi component được mount
  useEffect(() => {
    const client = mqtt.connect("wss://mqtt-dashboard.com:8884/mqtt", {
      clientId: "frontend-client",
    });

    client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      client.subscribe("datasensor");
    });

    client.on("message", (topic, message) => {
      if (topic === "datasensor") {
        const data = JSON.parse(message.toString());
        // Cập nhật dữ liệu cảm biến từ MQTT
        setTemperature(data.temp);
        setHumidity(data.hum);
        setLight(data.light);
        // Thêm dữ liệu mới vào sensorData
        setSensorData((prevData) => [
          ...prevData,
          {
            time: Date.now(),
            temperature: data.temp,
            humidity: data.hum,
            light: data.light,
          },
        ]);
        // Gửi dữ liệu cảm biến từ MQTT đến endpoint của máy chủ
        fetch("http://localhost:3000/save_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp: data.temp,
            hum: data.hum,
            light: data.light,
          }),
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      }
    });

    setMqttClient(client);

    // Hủy đăng ký khi component bị unmount
    return () => {
      client.end();
    };
  }, []);

  // Hàm thay đổi trạng thái của đèn
  const changeStateLight = () => {
    const newIsLightOn = !isLightOn;
    setIsLightOn(newIsLightOn);
    localStorage.setItem("isLightOn", JSON.stringify(newIsLightOn));
    // Publish trạng thái mới của đèn qua MQTT
    if (mqttClient) {
      mqttClient.publish("controll_device", newIsLightOn ? "led/1" : "led/0");
    }

    // Gửi dữ liệu hành động từ MQTT đến endpoint của máy chủ
    fetch("http://localhost:3000/save_action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device: "LED",
        action: newIsLightOn ? "ON" : "OFF",
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };

  // Hàm thay đổi trạng thái của quạt
  const changeStateFan = () => {
    const newIsFanOn = !isFanOn;
    setIsFanOn(newIsFanOn);
    localStorage.setItem("isFanOn", JSON.stringify(newIsFanOn));
    // Publish trạng thái mới của quạt qua MQTT
    if (mqttClient) {
      mqttClient.publish("controll_device", newIsFanOn ? "fan/1" : "fan/0");
    }

    // Gửi dữ liệu hành động từ MQTT đến endpoint của máy chủ Node.js
    fetch("http://localhost:3000/save_action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device: "FAN",
        action: newIsFanOn ? "ON" : "OFF",
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };

  // Cập nhật góc quay của quạt khi trạng thái của quạt thay đổi
  useEffect(() => {
    if (isFanOn) {
      const interval = setInterval(() => {
        setFanRotation((prevRotation) => (prevRotation + 10) % 360);
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isFanOn]);

  // Render giao diện
  return (
    <div>
      {/* Phần header của dashboard */}
      <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
        <Link to="/" className="text-2xl font-semibold border border-b-2">
          DASHBOARD
        </Link>
        <Link to="/datasensors" className="text-2xl font-semibold">
          DATA SENSOR
        </Link>
        <Link to="/actionhistory" className="text-2xl font-semibold">
          ACTION HISTORY
        </Link>
        <Link to="/profile" className="text-2xl font-semibold">
          PROFILE
        </Link>
      </div>

      {/* Phần chính của dashboard */}
      <div className="main max-w-[1536px] mt-2 mx-auto">
        {/* Hiển thị thông tin về nhiệt độ, độ ẩm và ánh sáng */}
        <div className="Temp_Humi_Light flex justify-between w-full">
          {/* Thông tin về nhiệt độ */}
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mx-2 rounded-xl bg-gradient-to-t from-red-100 to-red-600">
            <div className="flex items-center">
              <FaThermometerHalf className="text-red-500 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Nhiệt Độ : {temperature ?? "Loading..."}°C
              </p>
            </div>
          </div>
          {/* Thông tin về độ ẩm */}
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-blue-100 to-blue-600">
            <div className="flex items-center">
              <FaTint className="text-blue-500  text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Độ Ẩm : {humidity ?? "Loading..."}%
              </p>
            </div>
          </div>
          {/* Thông tin về ánh sáng */}
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-yellow-100 to-yellow-300">
            <div className="flex items-center">
              <FaSun className="text-yellow-400 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Ánh Sáng : {light ?? "Loading..."} lux
              </p>
            </div>
          </div>
        </div>

        {/* Biểu đồ hiển thị biến đổi của nhiệt độ, độ ẩm và ánh sáng */}
        <div className="flex w-full h-[518px] mt-2 mx-2">
          {/* Biểu đồ */}
          <div className="w-[67.2%] flex flex-col items-center justify-center border border-gray-400 rounded-xl mr-2 ">
            <LineChart
              width={850}
              height={450}
              data={sensorData} // Kết hợp dữ liệu đã nhận từ MQTT ở đây
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(unixTime) =>
                  new Date(unixTime).toLocaleTimeString()
                }
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Đường biểu đồ cho nhiệt độ */}
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#d31a1a"
                name="Nhiệt Độ"
              />
              {/* Đường biểu đồ cho độ ẩm */}
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#046ea6"
                name="Độ Ẩm"
              />
              {/* Đường biểu đồ cho ánh sáng */}
              <Line
                type="monotone"
                dataKey="light"
                stroke="#FFD700"
                name="Ánh Sáng"
              />
            </LineChart>
          </div>

          {/* Điều khiển đèn và quạt */}
          <div className="w-1/3 flex flex-col items-center justify-center  rounded-xl mr-4">
            {/* Phần điều khiển đèn */}
            <div className="w-full h-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl mb-2 bg-gradient-to-r from-blue-200 to-orange-200">
              <div className="flex flex-col items-center">
                <FaLightbulb
                  className={`${
                    isLightOn ? "text-yellow-500" : "text-black"
                  } text-8xl `}
                />
                {/* Nút bật/tắt đèn */}
                <button
                  onClick={changeStateLight}
                  className={`mt-5 border border-gray-400 rounded-xl px-7 py-2 font-medium ${
                    isLightOn ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {isLightOn ? "OFF" : "ON"}
                </button>
              </div>
            </div>

            {/* Phần điều khiển quạt */}
            <div className="w-full h-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl bg-gradient-to-r from-orange-200 to-blue-200">
              <div className="flex flex-col items-center mt-4">
                <FaFan
                  className={`text-${
                    isFanOn ? "black" : "black"
                  }-500 text-8xl `}
                  style={{ transform: `rotate(${fanRotation}deg)` }}
                />
                {/* Nút bật/tắt quạt */}
                <button
                  onClick={changeStateFan}
                  className={`mt-5 border border-gray-400 rounded-xl px-7 py-2 font-medium ${
                    isFanOn ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {isFanOn ? "OFF" : "ON"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
