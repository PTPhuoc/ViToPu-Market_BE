const uri = require("express").Router();
const ThongBaoModel = require('../Model/ThongBaoModel');

uri.get('/thongbao/:maKhachHang', async (req, res) => {
    try {
        const { maKhachHang } = req.params;
        const thongBaos = await ThongBaoModel.find({ maKhachHang });
        res.status(200).json(thongBaos);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.put('/thongbao/:maKhachHang/:id', async (req, res) => {
    try {
        const { maKhachHang, id } = req.params;
        const thongBao = await ThongBaoModel.findOneAndUpdate(
            { _id: id, maKhachHang },
            { trangThai: true },
            { new: true }
        );

        if (!thongBao) {
            return res.status(404).json({ msg: 'Không tìm thấy thông báo' });
        }

        res.status(200).json({ msg: 'Trạng thái thông báo đã được cập nhật', thongBao });
    } catch (err) {
        console.error("Error updating notification status:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = uri;