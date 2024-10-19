const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
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
    ngayDanhGia: {
        type: Date,
        required: true
    }
});
const DanhGiaModel = mongoose.model('DanhGiaModel', danhGiaSchema, 'DanhGiaModel');

module.exports = DanhGiaModel;