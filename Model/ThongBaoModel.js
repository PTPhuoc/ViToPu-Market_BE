const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
    maKhachHang: {
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
    trangThai: {
        type: Boolean,
        required: true,
    },
});
module.exports = mongoose.model('ThongBaoModel', thongBaoSchema, 'ThongBaoModel');