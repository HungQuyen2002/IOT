import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import axios from "axios"; // Import axios

interface ActionData {
  id: number;
  device: string;
  action: string;
  createdAt: string;
}

const Actionhistory = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [data, setData] = useState<ActionData[]>([]);
  const [searchByStatus, setSearchByStatus] = useState<string>("");
  const [searchByDevice, setSearchByDevice] = useState<string>("All");
  const [sortType, setSortType] = useState<string>("All");
  const [totalPages, setTotalPages] = useState<number>(0);
  const itemsPerPage: number = 10;

  const fetchData = async (): Promise<void> => {
    try {
      let sortColumn = "createdAt";
      let sortOrder = "asc";

      if (sortType !== "All") {
        const [column, order] = sortType.split(" ");

        if (column && order) {
          sortColumn = column.toLowerCase();
          sortOrder = order.toLowerCase();
        }
      }

      const query =
        `http://localhost:3000/action_history?page=${currentPage}&sortBy=${sortColumn}&sortOrder=${sortOrder}` +
        `${
          searchByDevice !== "All"
            ? `&searchByDevice=${searchByDevice}&searchByStatus=${searchByStatus}`
            : ""
        }`;

      const response = await axios.get<any>(query);
      console.log("Data from server:", response.data);
      setData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateTable = (): void => {
    let tableData: ActionData[] = [...data];

    if (searchByDevice !== "All") {
      tableData = tableData.filter(
        (rowData) =>
          rowData.device.toLowerCase() === searchByDevice.toLowerCase()
      );
    }

    if (searchByStatus !== "All") {
      tableData = tableData.filter(
        (rowData) =>
          rowData.action.toLowerCase() === searchByStatus.toLowerCase()
      );
    }

    // switch (sortType.split(" ")[0]) {
    //   case "Device":
    //   case "Action":
    //     tableData.sort((a, b) => {
    //       const order = sortType.split(" ")[1];
    //       const field = sortType
    //         .split(" ")[0]
    //         .toLowerCase() as keyof ActionData;
    //       return order === "Asc"
    //         ? a[field].localeCompare(b[field])
    //         : b[field].localeCompare(a[field]);
    //     });
    //     break;

    //   default:
    //     break;
    // }

    const startIndex: number = (currentPage - 1) * itemsPerPage;
    const endIndex: number = startIndex + itemsPerPage;
    setData(tableData.slice(startIndex, endIndex));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // updateTable(page);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, sortType, searchByDevice, searchByStatus]);

  useEffect(() => {
    updateTable();
  }, [searchByDevice, searchByStatus, sortType, currentPage]);

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
          <a href="/datasensors" className="text-2xl font-semibold ">
            DATA SENSOR
          </a>
          <a
            href="/actionhistory"
            className="text-2xl font-semibold boder border-b-2"
          >
            ACTION HISTORY
          </a>
          <a href="/profile" className="text-2xl font-semibold ">
            PROFILE
          </a>
        </div>
      </div>
      <h1 className="text-center text-black text-3xl font-bold my-4">
        ACTION HISTORY
      </h1>

      {/* Search and Sort Bar */}
      <div className="flex justify-between items-center mx-auto w-5/6 my-4">
        <div className="flex items-center">
          <FaSearch className="mr-2" />
          <input
            type="text"
            placeholder="Search by Status"
            className="border border-gray-400 p-2 rounded-md ml-2"
            value={searchByStatus}
            onChange={(e) => setSearchByStatus(e.target.value)}
          />

          <select
            className="border border-gray-400 p-2 rounded-md ml-2"
            value={searchByDevice}
            onChange={(e) => setSearchByDevice(e.target.value)}
          >
            <option value="All">All Devices</option>
            <option value="FAN">FAN</option>
            <option value="LED">LED</option>
          </select>
        </div>
        <div className="flex items-center">
          <select
            className="border border-gray-400 p-2 rounded-md mr-2"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Device Asc">Device Asc</option>
            <option value="Device Desc">Device Desc</option>
            <option value="Action Asc">Action Asc</option>
            <option value="Action Desc">Action Desc</option>
          </select>
          <span>Sort By: {sortType}</span>
        </div>
      </div>

      {/* Table  */}
      <table className="tableData max-w-[1536px] w-5/6 border-collapse mt-10 mx-auto ">
        <thead className="bg-black text-white border">
          <tr>
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">DEVICE</th>
            <th className="px-2 py-1">ACTION</th>
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
                <td className="border px-2 py-2 border-r-gray-500">
                  {rowData.device}
                </td>
                <td className="border px-2 py-2 border-r-gray-500">
                  {rowData.action}
                </td>
                <td className="border px-2 py-2">{rowData.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="border px-4 py-2 text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ... (Pagination) */}
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

export default Actionhistory;
