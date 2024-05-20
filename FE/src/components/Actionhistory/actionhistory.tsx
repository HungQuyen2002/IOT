import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Table } from "antd";
import axios from "axios"; // Import axios
import { Link } from "react-router-dom";

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
  // const itemsPerPage: number = 10;

  const fetchData = async (): Promise<void> => {
    try {
      let sortColumn = "createdAt";
      let sortOrder = "desc";

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

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, sortType, searchByDevice, searchByStatus]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "DEVICE",
      dataIndex: "device",
      key: "device",
    },
    {
      title: "ACTION",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "CREATED_AT",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <div>
      {/* Menu  */}
      <div className="menu max-w-[1536px] flex justify-center items-center mx-auto">
        <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
          <Link to="/" className="text-2xl font-semibold ">
            DASHBOARD
          </Link>
          <Link to="/datasensors" className="text-2xl font-semibold">
            DATA SENSOR
          </Link>
          <Link
            to="/actionhistory"
            className="text-2xl font-semibold  border-b-2"
          >
            ACTION HISTORY
          </Link>
          <Link to="/profile" className="text-2xl font-semibold">
            PROFILE
          </Link>
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
            <option value="All">All</option>
            <option value="FAN">FAN</option>
            <option value="LED">LED</option>
          </select>
        </div>
      </div>

      {/* Table  */}
      <Table
        dataSource={data}
        columns={columns}
        pagination={{
          total: totalPages,
          current: currentPage,

          onChange: (page) => goToPage(page),
          // total: 500,
        }}
        rowClassName={(record, index) => (index % 2 === 1 ? "bg-gray-200" : "")}
        className="tableData max-w-[1536px] w-5/6  border-collapse mt-10 mx-auto "
        scroll={{ y: "calc(100vh - 350px)" }}
      />
    </div>
  );
};

export default Actionhistory;
