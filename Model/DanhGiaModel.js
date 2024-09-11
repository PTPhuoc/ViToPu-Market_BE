const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
    maDanhgia: {
        type: String,
        required: true,
        unique: true,
    },
    maKhachHang: {
        type: String,
        required: true,
    },
    maSanPham: {
        type: String,
        required: true,
    },
    mucDoDanhGia: {
        type: Number,
        required: true,
        min : 1,
        max : 5,
    },
    noiDung: {
        type: String,
        required: true,
    },
});
const DanhGiaModel = mongoose.model('DanhGiaModel', danhGiaSchema, 'DanhGiaModel');

module.exports = DanhGiaModel;