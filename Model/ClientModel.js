const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    hoVaTen: {
        type: String,
        required: true,
    },
    gioiTinh: {
        type: String,
        required: true,
    },
    ngaySinh: {
        type: Date,
        required: true,
    },
    diaChi: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true, 
    },
    matKhau: {
        type: String,
        required: true,
    },
    hinhAnh: {
        type: String,
        required: false,
    },
    loaiAnh: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('ClientModel', clientSchema, 'ClientModel');