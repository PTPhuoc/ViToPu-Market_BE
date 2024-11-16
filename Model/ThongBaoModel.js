const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
    maSanPham: {
        type: String,
        required: true
    },
    noiDung: {
        type: String,
        required: true,
    },
    Den: {
        type: String,
        required: true
    },
    trangThai: {
        type: Boolean,
        required: true,
    },
});
module.exports = mongoose.model('ThongBaoModel', thongBaoSchema, 'ThongBaoModel');