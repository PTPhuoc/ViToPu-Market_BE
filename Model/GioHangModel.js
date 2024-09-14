const mongoose = require('mongoose');

const gioHangSchema = new mongoose.Schema({
    maKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientModel',
        required: true,
    },
    maSanPham: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SanPhamModel',
        required: true,
    },
    soLuong: {
        type: Integer,
        required: true,
    },
});
module.exports = mongoose.model('GioHangModel', gioHangSchema, 'GioHangModel');