// ==================== INITIALIZE EXPRESS APP ====================
const express = require("express");
const app = express();

// ====================  GLOBAL MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // TO ACCESS URL FORM ENCODED
app.use(express.static("ProductsImages"));
const cors = require("cors");
app.use(cors()); // ALLOW HTTP REQUESTS LOCAL HOSTS

// ====================  Required Module ====================
const register = require("./routes/RegisterPage");
const login = require("./routes/LoginPage");
const productAdmin = require("./routes/ProductAdmin");
const categoryAdmin = require("./routes/CategoryAdmin");
const userFunctionsByAdmin = require("./routes/UserFunctionsByAdmin");
const adminFunctionsByAdmin = require("./routes/AdminFunctionsByAdmin");


// ====================  RUN THE APP  ====================
app.listen(4000, "localhost", () => {
  console.log("SERVER IS RUNNING ");
});

// API routes [Endpoints]
app.use("/auth", register);
app.use("/auth", login);
app.use("/admin",productAdmin);
app.use("/admin",categoryAdmin);
app.use("/admin",userFunctionsByAdmin);
app.use("/admin",adminFunctionsByAdmin);




