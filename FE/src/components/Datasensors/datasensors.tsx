import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Pagination, Table } from "antd";
import axios from "axios"; // Import axios
import Column from "antd/es/table/Column";

const Datasensors = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("");
  const [sortType, setSortType] = useState<string>("");

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
        `http://localhost:3000/sensor_data?page=${currentPage}&sortBy=${sortColumn}&sortOrder=${sortOrder}` +
        `${
          searchBy !== "All" && searchTerm !== "All"
            ? `&searchBy=${searchBy}&searchValue=${searchTerm}`
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
  }, [currentPage, sortType, searchTerm, searchBy]);

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
            <option value="">All</option>
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
            <option value="">All</option>
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
      <Table
        dataSource={data}
        pagination={{
          total: totalPages,
          current: currentPage,
          // pageSize: itemsPerPage,
          onChange: (page) => goToPage(page),
          // total: 500,
        }}
        className="tableData max-w-[1536px] w-5/6 mt-10 mx-auto"
        scroll={{ y: "calc(100vh - 350px)" }}
        rowClassName={(record, index) => (index % 2 === 1 ? "bg-gray-200" : "")}
      >
        <Column title="ID" dataIndex="id" key="id" />
        <Column title="TEMPERATURE" dataIndex="temperature" key="temperature" />
        <Column title="HUMIDITY" dataIndex="humidity" key="humidity" />
        <Column title="LIGHT" dataIndex="light" key="light" />
        <Column title="CREATED_AT" dataIndex="createdAt" key="createdAt" />
      </Table>
      {/* <Pagination defaultCurrent={1} total={500} /> */}
    </div>
  );
};

export default Datasensors;
