const mongoose = require('mongoose');

const lichSuSchema = new mongoose.Schema({
    maKhachHang: {
        type: String,
        ref: 'ClientModel',
        required: true,
    },
    maSanPham: {
        type: String,
        ref: 'SanPhamModel',
        required: true,
    },
    soLuong: {
        type: Integer,
        required: true,
    },
    ngayMua: {
        type: Date,
        required: true,
    },
    giaTien: {
        type: Number,
        required: true,
    },
});
module.exports = mongoose.model('LichSuModel', lichSuSchema, 'LichSuModel');