const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const SanPhamAPI = require("./API/SanPhamAPI");
const DanhGiaAPI = require("./API/DanhGiaAPI");
const ClientAPI = require("./API/ClientAPI");
const app = express();

mongoose.connect("mongodb+srv://tanphuocphan370:12345@e-commerce.nsbpm.mongodb.net/ViToPu");

require("dotenv").config();

app.use(express.json());
app.use(cors())

const db = mongoose.connection;
db.once('open', () => {
    console.log('Kết nối MongoDB thành công');
});

app.use("/api", SanPhamAPI);
app.use("/api", DanhGiaAPI);
app.use("/api", ClientAPI); // để yên cái đuôi API cho t test nha m báo quá 

app.listen(9000, () => {
  console.log("Server is running!");
});
