// Import module mssql để tương tác với SQL Server.
const sql = require("mssql");
// Gọi hàm convertToVietnameseTime từ module dateConverter.js
const { convertToVietnameseTime } = require("./dateConverter");

// Hàm xử lý route của Express.js để lưu dữ liệu cảm biến vào cơ sở dữ liệu.
exports.saveSensorData = (req, res) => {
  const { temp, hum, light, windspeed} = req.body; // Trích xuất temp, hum, và light từ body của request
  const request = new sql.Request(); // Tạo yêu cầu SQL mới

  // Thực hiện truy vấn SQL để chèn dữ liệu cảm biến vào bảng SensorData
  request.query(
    `INSERT INTO SensorData (temperature, humidity, light, windspeed) VALUES (${temp}, ${hum}, ${light},${windspeed} )`,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving data" });
      }
      res.json({ message: "Data saved successfully" });
    }
  );
};

// Hàm để lấy dữ liệu cảm biến từ cơ sở dữ liệu SQL
exports.getSensorData = async (req, res) => {
  try {
    const request = new sql.Request(); // Tạo yêu cầu SQL mới

    // Đặt các tham số sắp xếp mặc định nếu chúng không được cung cấp
    let sortBy = req.query.sortBy || "createdAt";
    let sortOrder = req.query.sortOrder || "desc";

    // Định nghĩa các cột và thứ tự sắp xếp hợp lệ
    const validSortColumns = ["temperature", "humidity", "light", "createdAt","windspeed"];
    const validSortOrders = ["asc", "desc"];

    // Kiểm tra các tham số sắp xếp --> nếu khác các tham số sắp xếp thì trả về lỗi
    if (
      !validSortColumns.includes(sortBy) ||
      !validSortOrders.includes(sortOrder)
    ) {
      return res.status(400).json({ message: "Invalid sort parameters" }); // Gửi phản hồi status 400 cho các tham số sắp xếp không hợp lệ
    }

    let searchBy = req.query.searchBy; // Trích xuất tham số searchBy
    let searchValue = req.query.searchValue; // Trích xuất tham số searchValue
    let searchCondition = ""; // Khởi tạo searchCondition đầu tiên rỗng

    // Kiểm tra cột tìm kiếm
    if (searchBy && searchValue) {
      // Tạo một mảng validSearchColumns
      const validSearchColumns = ["temperature", "humidity", "light","windspeed"];
      // Kiểm tra cột tìm kiếm
      if (!validSearchColumns.includes(searchBy)) {
        return res.status(400).json({ message: "Invalid search column" });
      }
      // Xây dựng điều kiện tìm kiếm . Nếu cả searchBy và searchValue hợp lệ, mã sẽ xây dựng một chuỗi searchCondition để sử dụng trong truy vấn SQL
      searchCondition = `WHERE ${searchBy} = '${searchValue}'`;
    }

    // Thực hiện truy vấn SQL để lấy dữ liệu cảm biến với điều kiện tìm kiếm và sắp xếp
    const allSensorData = await request.query(`
      SELECT 
        *,
        CONVERT(VARCHAR, createdAt, 126) as createdAtUTC
      FROM 
        SensorData 
      ${searchCondition}
      ORDER BY 
        ${sortBy} ${sortOrder}
    `);

    // Trả về toàn bộ dữ liệu, không cần phân trang
    res.json({
      data: allSensorData.recordset.map((data) => ({
        id: data.id,
        temperature: data.temperature,
        humidity: data.humidity,
        light: data.light,
        windspeed:data.windspeed,
        createdAt: convertToVietnameseTime(data.createdAtUTC),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get sensor data" });
  }
};
