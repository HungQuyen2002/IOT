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
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [windspeed, setWindspeed] = useState<number | null>(null);

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
  const [windspeedData, setWindspeedData] = useState<any[]>([]); // Dữ liệu cho biểu đồ tốc độ gió
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
        setTemperature(data.temp);
        setHumidity(data.hum);
        setLight(data.light);
        setWindspeed(data.windspeed);
        setSensorData((prevData) => [
          ...prevData,
          {
            time: Date.now(),
            temperature: data.temp,
            humidity: data.hum,
            light: data.light,
          },
        ]);

        setWindspeedData((prevData) => [
          ...prevData,
          {
            time: Date.now(),
            windspeed:data.windspeed, 
          },
        ]);

        fetch("http://localhost:3000/save_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp: data.temp,
            hum: data.hum,
            light: data.light,
            windspeed: data.windspeed, // Thêm giá trị windspeed vào request
          }),
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      }
    });

    setMqttClient(client);

    return () => {
      client.end();
    };
  }, []);


  const changeStateLight = () => {
    const newIsLightOn = !isLightOn;
    setIsLightOn(newIsLightOn);
    localStorage.setItem("isLightOn", JSON.stringify(newIsLightOn));
    if (mqttClient) {
      mqttClient.publish("controll_device", newIsLightOn ? "led/1" : "led/0");
    }

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

  const changeStateFan = () => {
    const newIsFanOn = !isFanOn;
    setIsFanOn(newIsFanOn);
    localStorage.setItem("isFanOn", JSON.stringify(newIsFanOn));
    if (mqttClient) {
      mqttClient.publish("controll_device", newIsFanOn ? "fan/1" : "fan/0");
    }

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

  useEffect(() => {
    if (isFanOn) {
      const interval = setInterval(() => {
        setFanRotation((prevRotation) => (prevRotation + 10) % 360);
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isFanOn]);

  return (
    <div>
      <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
        <Link to="/" className="text-2xl font-semibold border-b-2">
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

      <div className="main max-w-[1536px] mt-2 mx-auto">
        <div className="Temp_Humi_Light flex justify-between w-full">
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mx-2 rounded-xl bg-gradient-to-t from-red-100 to-red-600">
            <div className="flex items-center">
              <FaThermometerHalf className="text-red-500 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Nhiệt Độ : {temperature ?? "Loading..."}°C
              </p>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-blue-100 to-blue-600">
            <div className="flex items-center">
              <FaTint className="text-blue-500  text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Độ Ẩm : {humidity ?? "Loading..."}%
              </p>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-yellow-100 to-yellow-300">
            <div className="flex items-center">
              <FaSun className="text-yellow-400 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Ánh Sáng : {light ?? "Loading..."} lux
              </p>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-gray-100 to-gray-300">
            <div className="flex items-center">
              <p className="text-2xl font-medium">
                Tốc độ gió : {windspeed ?? "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full h-[518px] mt-2 mx-2 ">
          <div className="w-3/4 flex items-center justify-center border border-gray-400 rounded-xl mr-2">
            <div className="w-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl mr-2">
              <LineChart
                width={500}
                height={450}
                data={sensorData}
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
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#d31a1a"
                  name="Nhiệt Độ"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#046ea6"
                  name="Độ Ẩm"
                />
                <Line
                  type="monotone"
                  dataKey="light"
                  stroke="#FFD700"
                  name="Ánh Sáng"
                />
              </LineChart>
            </div>

            <div className="w-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl">
              <LineChart
                width={500}
                height={450}
                data={windspeedData}
                margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
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
                <Line
                  type="monotone"
                  dataKey="windspeed"
                  stroke="#1E90FF"
                  name="Tốc Độ Gió"
                />
              </LineChart>
            </div>
          </div>

          <div className="flex w-1/4 h-[518px] mt-2 mx-2">
            <div className="w-full flex flex-col items-center justify-center rounded-xl mr-4">
              <div className="w-full h-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl mb-2 bg-gradient-to-r from-blue-200 to-orange-200">
                <div className="flex flex-col items-center">
                  <FaLightbulb
                    className={`${
                      isLightOn ? "text-yellow-500" : "text-black"
                    } text-8xl `}
                  />
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

              <div className="w-full h-1/2 flex flex-col items-center justify-center border border-gray-400 rounded-xl bg-gradient-to-r from-orange-200 to-blue-200">
                <div className="flex flex-col items-center mt-4">
                  <FaFan
                    className={`text-${
                      isFanOn ? "black" : "black"
                    }-500 text-8xl `}
                    style={{ transform: `rotate(${fanRotation}deg)` }}
                  />
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
    </div>
  );
};

export default Dashboard;
