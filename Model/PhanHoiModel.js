const mongoose = require('mongoose');

const phanHoiSchema = new mongoose.Schema({
    maDanhGia: {
        type: String,
        ref: 'DanhGiaModel',
        required: true,
    },
    maCuaHang: {
        type: String,
        ref: 'CuaHangModel',
        required: true,
    },
    noiDung: {
        type: String,
        required: true,
    },
});
module.exports = mongoose.model('PhanHoiModel', phanHoiSchema, 'PhanHoiModel');