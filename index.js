const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const SanPhamAPI = require("./API/SanPhamAPI");
const DanhGiaAPI = require("./API/DanhGiaAPI");
const ClientAPI = require("./API/ClientAPI");
const CuaHang = require("./API/CuaHangAPI")
const PhanHoi = require("./API/PhanHoiAPI")
const GioHang = require("./API/GioHangAPI")
const LichSu = require("./API/LichSuAPI")
const path = require("path")
const app = express();
const fileUpload = require('express-fileupload');
require('dotenv').config();

mongoose.connect("mongodb+srv://tanphuocphan370:12345@e-commerce.nsbpm.mongodb.net/ViToPu");

app.use(express.json());
app.use(cors())
app.use(fileUpload());

const db = mongoose.connection;
db.once('open', () => {
    console.log('Kết nối MongoDB thành công');
});
app.use('/Image', express.static(path.join(__dirname, 'Image')));
app.use("/SanPham", SanPhamAPI);
app.use("/DanhGia", DanhGiaAPI);
app.use("/Client", ClientAPI);
app.use("/CuaHang", CuaHang);
app.use("/PhanHoi", PhanHoi);
app.use("/GioHang", GioHang);
app.use("/LichSu", LichSu);

app.listen(9000, () => {
  console.log("Server is running!");
});