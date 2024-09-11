const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const SanPhamAPI = require("./API/SanPhamAPI");
const CuaHangAPI = require("./API/CuaHangAPI");
const DanhGiaAPI = require("./API/DanhGiaAPI");
const app = express();

mongoose.connect("mongodb+srv://tanphuocphan370:12345@e-commerce.nsbpm.mongodb.net/ViToPu");

app.use(express.json());
app.use(cors())

const db = mongoose.connection;
db.once('open', () => {
    console.log('Kết nối MongoDB thành công');
});

app.use("/SanPhamAPI", SanPhamAPI);
app.use("/DanhGiaAPI", DanhGiaAPI);

app.listen(9000, () => {
  console.log("Server is running !");
});
