const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
    maKhachHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientModel',
        required: true,
    },
    maCuaHang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CuaHangModel',
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