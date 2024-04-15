// Profile.tsx
import React from "react";

const Profile: React.FC = () => {
  return (
    <div
      className="bg-cover bg-no-repeat max-w-[1536px] h-[737px]"
      style={{ backgroundImage: "url(./src/assets/bg.jpg)" }}
    >
      {/* Menu  */}
      <div className="menu max-w-[1536px] flex justify-center items-center mx-auto">
        <div className="container bg-gradient-to-r from-blue-400 to-red-600 text-white h-16 flex items-center justify-around border-b border-gray-400 mx-2 rounded-md">
          <a href="/" className="text-2xl font-semibold  ">
            DASHBOARD
          </a>
          <a href="/datasensors" className="text-2xl font-semibold ">
            DATA SENSOR
          </a>
          <a href="/actionhistory" className="text-2xl font-semibold ">
            ACTION HISTORY
          </a>
          <a
            href="/profile"
            className="text-2xl font-semibold boder border-b-2"
          >
            PROFILE
          </a>
        </div>
      </div>

      <h1 className="text-center bg-gradient-to-br from-blue-400 to-red-800 text-transparent bg-clip-text text-6xl font-bold my-6 mx-auto">
        PROFILE
      </h1>
      <div className="flex flex-col justify-center items-center mx-auto">
        <div className="flex w-[800px] h-auto bg-pink-100 p-5 rounded-lg">
          <div className="p-8 w-1/2">
            <img
              className="w-full h-auto rounded-lg"
              src="./src/assets/anh1.jpg"
              alt="Ảnh cá nhân của bạn"
            />
          </div>
          <div className="flex flex-col justify-center py-16 w-[500px] text-2xl font-medium">
            <p className="mb-2">Name: VŨ ĐÌNH HÙNG</p>
            <p className="mb-2">Dob: 18/02/2002</p>
            <p className="mb-2">ID: B20DCPT093</p>
            <p className="mb-2">Phone: 0866788248</p>
            <p className="mb-2">Email: vuhung200222@gmail.com</p>
            <p className="mb-2">Address: Nam Định</p>
            <p className="mb-2">Git: github.com/HungQuyen2002</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
