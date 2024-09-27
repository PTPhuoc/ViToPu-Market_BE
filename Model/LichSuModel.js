const mongoose = require('mongoose');

const lichSuSchema = new mongoose.Schema({
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