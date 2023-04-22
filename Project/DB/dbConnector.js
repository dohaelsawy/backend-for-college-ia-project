const mysql = require("mysql");

const conn = mysql.createConnection({
    host : "localhost",
    user : "root",
    password :"",
    database :"demo",
    port : "3306",
});

conn.connect((error) => {
    if (error) throw error ;
    console.log("DB connected ");
});

module.exports = conn ;