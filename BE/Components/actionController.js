const sql = require("mssql");
const { convertToVietnameseTime } = require("./dateConverter");

//Hàm xử lý route của Express.js để lưu dữ liệu hành động vào cơ sở dữ liệu.
exports.saveAction = (req, res) => {
  const { device, action } = req.body; // Trích xuất device và action
  const request = new sql.Request();// Tạo yêu cầu SQL mới

  //  Thực hiện truy vấn SQL để chèn dữ liệu vào bảng ActionHistory
  request.query(
    `INSERT INTO ActionHistory (device, action) VALUES ('${device}', '${action}')`,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving action" });
      }
      res.json({ message: "Action saved successfully" });
    }
  );
};

// Hàm để lấy dữ liệu hành động từ cơ sở dữ liệu SQL
exports.getActionHistory = async (req, res) => {
  try {
    const request = new sql.Request(); // Tạo yêu cầu SQL mới

    // Đặt các tham số sắp xếp mặc định nếu chúng không được cung cấp
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "asc";

    // Định nghĩa các cột và thứ tự sắp xếp
    const validSortColumns = ["createdAt", "device", "action"];
    const validSortOrders = ["asc", "desc"];

    // Kiểm tra các tham số sắp xếp
    if (
      !validSortColumns.includes(sortBy) ||
      !validSortOrders.includes(sortOrder)
    ) {
      return res.status(400).json({ message: "Invalid sort parameters" });
    }

    let searchByDevice = req.query.searchByDevice; // Trích xuất tham số searchByDevice
    let searchByStatus = req.query.searchByStatus; // Trích xuất tham số searchByStatus
    let searchCondition = ""; // Khởi tạo searchCondition đầu tiên rỗng

    if (searchByDevice && searchByStatus) {
      // Tạo mảng validDevices và validStatus
      const validDevices = ["FAN", "LED"];
      const validStatus = ["ON", "OFF"];
      // Kiểm tra cột tìm kiếm
      if (
        !validDevices.includes(searchByDevice) ||
        !validStatus.includes(searchByStatus)
      ) {
        return res.status(400).json({ message: "Invalid search parameters" });
      }
      // Xây dựng điều kiện tìm kiếm
      searchCondition = `WHERE device = '${searchByDevice}' AND action LIKE '%${searchByStatus}%'`;
    }

    // Thực hiện truy vấn SQL để lấy dữ liệu trạng thái của thiết bị với điều kiện tìm kiếm và sắp xếp
    const allActionHistory = await request.query(`
      SELECT 
        *,
        CONVERT(VARCHAR, createdAt, 126) as createdAtUTC
      FROM 
        ActionHistory 
      ${searchCondition}
      ORDER BY 
        ${sortBy} ${sortOrder}
    `);

    // Tính tổng số bản ghi đã lấy
    const totalCount = allActionHistory.recordset.length;

    // Trích xuất các tham số phân trang
    const { page = 1, limit = 10 } = req.query;
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;

    // Phân trang và định dạng dữ liệu đã lấy
    const actionHistoryForPage = allActionHistory.recordset
      .slice(startIdx, endIdx)
      .map((data) => ({
        id: data.id,
        device: data.device,
        action: data.action,
        createdAt: convertToVietnameseTime(data.createdAtUTC),
      }));

    // Gửi dữ liệu đã phân trang, tổng số và chi tiết phân trang dưới dạng phản hồi JSON
    res.json({
      total: totalCount,
      data: actionHistoryForPage,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get action history" });
  }
};

