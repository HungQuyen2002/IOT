const sql = require("mssql");

const dbConfig = {
  user: "sa",
  password: "123",
  server: "localhost",
  database: "IOT",
  encrypt: false,
};

const connectDB = () => {
  return new Promise((resolve, reject) => {
    sql.connect(dbConfig, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Connected to SQL Server");
        resolve();
      }
    });
  });
};

module.exports = connectDB;
