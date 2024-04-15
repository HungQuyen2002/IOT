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

const Dashboard: React.FC = () => {
  const [temperatureData, setTemperatureData] = useState<
    { time: number; temperature: number }[]
  >([]);
  const [humidityData, setHumidityData] = useState<
    { time: number; humidity: number }[]
  >([]);
  const [lightData, setLightData] = useState<{ time: number; light: number }[]>(
    []
  );

  const [isLightOn, setIsLightOn] = useState<boolean>(false);
  const [isFanOn, setIsFanOn] = useState<boolean>(false);
  const [fanRotation, setFanRotation] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTemperature = Math.floor(Math.random() * 101);
      const newHumidity = Math.floor(Math.random() * 101);
      const newLight = Math.floor(Math.random() * 1001);
      const currentTime = Date.now();

      setTemperatureData((prevData) =>
        [...prevData, { time: currentTime, temperature: newTemperature }].slice(
          -10
        )
      );
      setHumidityData((prevData) =>
        [...prevData, { time: currentTime, humidity: newHumidity }].slice(-10)
      );
      setLightData((prevData) =>
        [...prevData, { time: currentTime, light: newLight }].slice(-10)
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const changeStateLight = () => {
    setIsLightOn((prev) => !prev);
  };

  const changeStateFan = () => {
    setIsFanOn((prev) => !prev);
  };

  useEffect(() => {
    if (isFanOn) {
      const interval = setInterval(() => {
        setFanRotation((prevRotation) => (prevRotation + 10) % 360);
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isFanOn]);

  // Kết hợp ba loại dữ liệu thành một mảng dữ liệu chung
  const combinedData = temperatureData.map((item, index) => ({
    time: item.time,
    temperature: item.temperature,
    humidity: humidityData[index]?.humidity || null,
    light: lightData[index]?.light || null,
  }));

  return (
    <div>
      {/* Menu  */}
      <div className="menu max-w-[1536px] flex justify-center items-center mx-auto">
        <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
          <a href="/" className="text-2xl font-semibold boder border-b-2 ">
            DASHBOARD
          </a>
          <a href="/datasensors" className="text-2xl font-semibold ">
            DATA SENSOR
          </a>
          <a href="/actionhistory" className="text-2xl font-semibold ">
            ACTION HISTORY
          </a>
          <a href="/profile" className="text-2xl font-semibold ">
            PROFILE
          </a>
        </div>
      </div>

      <div className="main max-w-[1536px] mt-2 mx-auto">
        {/* Temp_Humi_Light  */}
        <div className="Temp_Humi_Light flex justify-between w-full">
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mx-2 rounded-xl bg-gradient-to-t from-red-100 to-red-600">
            <div className="flex items-center">
              <FaThermometerHalf className="text-red-500 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Nhiệt Độ :{" "}
                {temperatureData.length > 0
                  ? temperatureData[temperatureData.length - 1].temperature
                  : "Loading..."}
                °C
              </p>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-blue-100 to-blue-600">
            <div className="flex items-center">
              <FaTint className="text-blue-500 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Độ Ẩm :{" "}
                {humidityData.length > 0
                  ? humidityData[humidityData.length - 1].humidity
                  : "Loading..."}
                %
              </p>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-center border border-gray-400 p-10 mr-2 rounded-xl bg-gradient-to-t from-yellow-100 to-yellow-300">
            <div className="flex items-center">
              <FaSun className="text-yellow-400 text-4xl mr-2" />
              <p className="text-2xl font-medium">
                Ánh Sáng :{" "}
                {lightData.length > 0
                  ? lightData[lightData.length - 1].light
                  : "Loading..."}{" "}
                lux
              </p>
            </div>
          </div>
        </div>

        {/* Chart  + Fan/Led */}
        <div className="flex w-full h-[518px] mt-2 mx-2">
          {/* Chart  */}
          <div className="w-[67.2%] flex flex-col items-center justify-center border border-gray-400 rounded-xl mr-2 ">
            <LineChart
              width={850}
              height={450}
              data={combinedData} // sử dụng mảng dữ liệu kết hợp
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

          {/* Fan + Led  */}
          <div className="w-1/3 flex flex-col items-center justify-center  rounded-xl mr-4">
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
  );
};

export default Dashboard;
