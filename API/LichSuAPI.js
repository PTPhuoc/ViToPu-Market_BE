const uri = require("express").Router();
const LichSuModel = require('../Model/LichSuModel');

uri.post('/purchase-history', async (req, res) => {
    try {
        const maKhachHang = req.body.maKhachHang;
        console.log('Mã khách hàng:', maKhachHang);

        if (!maKhachHang) {
            return res.status(400).json({ msg: 'Thiếu mã khách hàng' });
        }
       
        const purchaseHistory = await LichSuModel.find({ maKhachHang }).sort({ ngayMua: -1 }).exec();

        if (purchaseHistory.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy lịch sử mua hàng' });
        }

        res.json(purchaseHistory);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử mua hàng: ', error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    }
});

module.exports = uri;   