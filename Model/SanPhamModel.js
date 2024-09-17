const mongoose = require('mongoose');

const sanPhamSchema = new mongoose.Schema({
    maSanPham: {
        type: String,
        required: true,
        unique: true,
    },
    maCuaHang: {
        type: String,
        required: true,
    },
    tenSanPham: {
        type: String,
        required: true,
    },
    moTa: {
        type: String,
        required: true,
    },
    giaTien: {
        type: Number,
        required: true,
    },
    hinhAnh: {
        type: String,
        required: false,
    },
    LoaiAnh: {
        type: String,
        required: false,
    },
});
const SanPhamModel = mongoose.model('SanPhamModel', sanPhamSchema, 'SanPhamModel');

module.exports = SanPhamModel;
