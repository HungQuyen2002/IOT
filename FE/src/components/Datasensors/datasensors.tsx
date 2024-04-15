import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import axios from "axios"; // Import axios

// Định nghĩa kiểu dữ liệu cho đối tượng SensorData.
interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  createdAt: string;
}

const Datasensors = () => {
  //Khởi tạo các biến State cho component với giá trị mặc định.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [data, setData] = useState<SensorData[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("All");

  const [sortType, setSortType] = useState<string>("All");
  const [totalPages, setTotalPages] = useState<number>(0);
  const itemsPerPage: number = 10; // Số lượng bản ghi hiển thị trên mỗi trang.

  // Fetch Data từ Backend
  const fetchData = async (): Promise<void> => {
    try {
      // Xử lý sắp xếp
      let sortColumn = "createdAt";
      let sortOrder = "asc";

      if (sortType !== "All") {
        // Sử dụng phương thức split(" ") để tách sortType thành hai phần: column và order
        const [column, order] = sortType.split(" ");

        if (column && order) {
          //Chuyển đổi column và order thành chữ thường để đồng nhất
          sortColumn = column.toLowerCase();
          sortOrder = order.toLowerCase();
        }
      }

      // Xây dựng query URL cho API request dựa trên các thông tin đã xác định
      const query =
        `http://localhost:3000/sensor_data?page=${currentPage}&sortBy=${sortColumn}&sortOrder=${sortOrder}` +
        `${
          searchBy !== "All"
            ? `&searchBy=${searchBy}&searchValue=${searchTerm}`
            : ""
        }`;
      // Gọi API với phương thức GET và URL đã xây dựng
      const response = await axios.get<any>(query);
      console.log("Data from server:", response.data);
      // Cập nhật dữ liệu và tổng số trang bằng dữ liệu trả về từ Backend.
      setData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateTable = (): void => {
    let tableData: SensorData[] = [...data];
    // Lọc dữ liệu dựa trên tìm kiếm
    switch (searchBy) {
      case "temperature":
      case "humidity":
      case "light":
        // Sử dụng phương thức filter để lọc dữ liệu dựa trên searchBy và searchTerm
        tableData = tableData.filter((rowData) =>
          rowData[searchBy].toString().includes(searchTerm)
        );
        break;

      default:
        break;
    }

    // Sắp xếp dữ liệu
    switch (
      sortType.split(" ")[0] // sortType để xác định cách sắp xếp dữ liệu.
    ) {
      // Sử dụng phương thức sort để sắp xếp tableData dựa trên cột và thứ tự sắp xếp
      case "Temperature":
        tableData.sort((a, b) => {
          const order = sortType.split(" ")[1];
          return order === "Asc"
            ? a.temperature - b.temperature
            : b.temperature - a.temperature;
        });
        break;
      case "Humidity":
        tableData.sort((a, b) => {
          const order = sortType.split(" ")[1];
          return order === "Asc"
            ? a.humidity - b.humidity
            : b.humidity - a.humidity;
        });
        break;
      case "Light":
        tableData.sort((a, b) => {
          const order = sortType.split(" ")[1];
          return order === "Asc" ? a.light - b.light : b.light - a.light;
        });
        break;

      default:
        break;
    }
    // Tính chỉ số bắt đầu và kết thúc của dữ liệu cần hiển thị dựa trên currentPage và itemsPerPage.
    const startIndex: number = (currentPage - 1) * itemsPerPage;

    // Cập nhật dữ liệu của component với phần dữ liệu đã được lọc và sắp xếp
    const endIndex: number = startIndex + itemsPerPage;
    setData(tableData.slice(startIndex, endIndex));
  };

  // Hàm chuyển trang
  const goToPage = (page: number): void => {
    setCurrentPage(page);
    // fetchData();
  };
  // sử dụng useEffect để thực hiện các tác vụ có ảnh hưởng đến DOM sau khi render component
  useEffect(() => {
    fetchData(); // Gọi hàm fetchData để lấy dữ liệu từ Backend
  }, [currentPage, sortType, searchTerm, searchBy]);

  useEffect(() => {
    updateTable(); // Gọi hàm updateTable để cập nhật dữ liệu hiển thị trên bảng
  }, [searchTerm, sortType, currentPage, searchBy]);

  // Render Page
  const renderPagination = (): JSX.Element[] => {
    let pagesToShow: (number | string)[] = [];

    if (totalPages <= 10) {
      pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      pagesToShow = [...Array(3).keys()].map((i) => i + 1);
      pagesToShow.push("...");
      pagesToShow.push(totalPages - 2, totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pagesToShow = [1, 2, 3];
      pagesToShow.push("...");
      pagesToShow.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pagesToShow = [1, "..."];
      pagesToShow.push(currentPage - 1, currentPage, currentPage + 1);
      pagesToShow.push("...", totalPages);
    }

    return pagesToShow.map((page, index) => {
      if (page === "...") {
        return (
          <span key={index} className="mx-1 px-3 py-1">
            ...
          </span>
        );
      }

      return (
        <button
          key={index}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === page
              ? "bg-gray-600 text-white"
              : "bg-white text-black font-medium text-lg"
          }`}
          onClick={() => {
            if (typeof page === "number") {
              goToPage(page);
            }
          }}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div>
      {/* Menu  */}
      <div className="menu max-w-[1536px] flex justify-center items-center mx-auto">
        <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
          <a href="/" className="text-2xl font-semibold  ">
            DASHBOARD
          </a>
          <a
            href="/datasensors"
            className="text-2xl font-semibold boder border-b-2"
          >
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
      <h1 className="text-center text-black text-3xl font-bold my-4">
        SENSOR DATA
      </h1>
      {/* Search and Sort Bar */}
      <div className="flex justify-between items-center mx-auto w-5/6 my-4">
        <div className="flex items-center">
          <FaSearch className="mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-400 p-2 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-gray-400 p-2 rounded-md ml-2"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option value="">All</option> Default "All" option
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div className="flex items-center">
          <select
            className="border border-gray-400 p-2 rounded-md mr-2"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Temperature Asc">Temperature Asc</option>
            <option value="Temperature Desc">Temperature Desc</option>
            <option value="Humidity Asc">Humidity Asc</option>
            <option value="Humidity Desc">Humidity Desc</option>
            <option value="Light Asc">Light Asc</option>
            <option value="Light Desc">Light Desc</option>
          </select>
          <span>Sort By: {sortType}</span>
        </div>
      </div>
      {/* Table  */}
      <table className="tableData max-w-[1536px] w-5/6 border-collapse mt-10 mx-auto ">
        <thead className="bg-black text-white border">
          <tr>
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">TEMPERATURE</th>
            <th className="px-2 py-1">HUMIDITY</th>
            <th className="px-2 py-1">LIGHT</th>
            <th className="px-2 py-1">CREATED_AT</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {data.length > 0 ? (
            data.map((rowData, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="border px-2 py-2 border-r-gray-500">
                  {rowData.id}
                </td>
                <td className="border px-2 py-2 border-r-gray-500">{`${rowData.temperature} °C`}</td>
                <td className="border px-2 py-2 border-r-gray-500">{`${rowData.humidity} %`}</td>
                <td className="border px-2 py-2 border-r-gray-500">{`${rowData.light} lux`}</td>
                <td className="border px-2 py-2">{rowData.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="border px-4 py-2 text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination  */}
      <div className="mt-4 flex justify-center items-center">
        {currentPage > 1 && (
          <button
            className="mx-1 px-3 py-1 rounded bg-white text-black font-medium text-lg"
            onClick={() => goToPage(currentPage - 1)}
          >
            <FaCircleChevronLeft className="text-2xl" />
          </button>
        )}

        {renderPagination()}

        {currentPage < totalPages && (
          <button
            className="mx-1 px-3 py-1 rounded bg-white text-black font-medium text-lg"
            onClick={() => goToPage(currentPage + 1)}
          >
            <FaCircleChevronRight className="text-2xl" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Datasensors;
