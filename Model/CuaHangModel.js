const mongoose = require("mongoose");

const cuaHangSchema = new mongoose.Schema({
  maKhachHang: {
    type: String,
    required: true,
  },
  tenCuaHang: {
    type: String,
    required: true,
  },
  diaChi: {
    type: String,
    required: true,
  },
  hinhAnh: {
    type: String,
    required: false,
  },
  loaiAnh: {
    type: String,
    required: false,
  },
});
module.exports = mongoose.model("CuaHangModel", cuaHangSchema, "CuaHangModel");
