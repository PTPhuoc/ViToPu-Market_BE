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
const ThongBao = require("./API/ThongBaoAPI")
const path = require("path")
const app = express();
const fileUpload = require('express-fileupload');
require('dotenv').config();

mongoose.connect("mongodb+srv://tanphuocphan370:12345@e-commerce.nsbpm.mongodb.net/ViToPu");

const http = require("http");
const { Server } = require("socket.io");
app.use(express.json());
app.use(cors())
app.use(fileUpload());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Địa chỉ client
    methods: ["GET", "POST"]
  }
});

// Lắng nghe sự kiện kết nối
io.on("connection", (socket) => {
  // Ví dụ: lắng nghe sự kiện từ client
  socket.on("client-event", (data) => {
    console.log("Received from client:", data);
  });
});

// Middleware chia sẻ io giữa các route
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use("/ThongBao", ThongBao.uri)

server.listen(9000, () => {
  console.log("Server is running!");
});