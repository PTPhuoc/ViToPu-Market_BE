const uri = require("express").Router();
const CuaHangModel = require('../Model/CuaHangModel');

uri.post('/check-store', async (req, res) => {
    try {
        const { maKhachHang } = req.body;
        console.log('Mã khách hàng:', maKhachHang);

        if (!maKhachHang) {
            return res.status(400).json({ msg: 'Thiếu mã khách hàng' });
        }

        const cuaHang = await CuaHangModel.findOne({ maKhachHang }).exec();

        if (!cuaHang) {
            return res.status(404).json({ msg: 'Khách hàng chưa đăng ký cửa hàng' });
        }
        else {
            res.json({message: 'Đã tìm thấy cửa hàng', cuaHang});
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra cửa hàng: ', error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    }
});

module.exports = uri;