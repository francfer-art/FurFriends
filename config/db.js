const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "furfriends"
});

connection.connect((err) => {
  if(err) {
    console.log(err);
    return;
  }
  console.log("Connected");
});

module.exports = connection;