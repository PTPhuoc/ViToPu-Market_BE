const mongoose = require('mongoose');

const gioHangSchema = new mongoose.Schema({
    maKhachHang: {
        type: String,
        required: true,
    },
    maSanPham: {
        type: String,
        required: true,
    },
    soLuong: {
        type: Number,
        required: true,
    },
});
module.exports = mongoose.model('GioHangModel', gioHangSchema, 'GioHangModel');