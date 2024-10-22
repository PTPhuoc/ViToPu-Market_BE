const mongoose = require('mongoose');

const phanHoiSchema = new mongoose.Schema({
    maDanhGia: {
        type: String,
        required: true,
    },
    maCuaHang: {
        type: String,
        required: true,
    },
    noiDung: {
        type: String,
        required: true,
    },
    ngayPhanHoi: {
        type: Date,
        required: true,
    }
});
module.exports = mongoose.model('PhanHoiModel', phanHoiSchema, 'PhanHoiModel');