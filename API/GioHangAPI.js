const express = require('express');
const uri = express.Router();
const GioHangModel = require('../Model/GioHangModel');
const LichSuModel = require('../Model/LichSuModel');
const SanPhamModel = require('../Model/SanPhamModel');


uri.post('/buy-product-in-cart', async (req, res) => {
    try {
        const { maKhachHang, danhSachMaSanPham } = req.body;

        const gioHangItems = await GioHangModel.find({
            maKhachHang,
            maSanPham: { $in: danhSachMaSanPham }
        });

        if (gioHangItems.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        const sanPhamIds = gioHangItems.map(item => item.maSanPham);
        const sanPhamItems = await SanPhamModel.find({ maSanPham: { $in: sanPhamIds } });

        const lichSuMuaHangItems = gioHangItems.map(item => {
            const sanPham = sanPhamItems.find(sp => sp.maSanPham === item.maSanPham);
            return {
                maKhachHang: item.maKhachHang,
                maSanPham: item.maSanPham,
                soLuong: item.soLuong,
                ngayMua: new Date(),
                giaTien: sanPham ? sanPham.giaTien : 0
            };
        });

        await LichSuModel.insertMany(lichSuMuaHangItems);

        await GioHangModel.deleteMany({
            maKhachHang,
            maSanPham: { $in: danhSachMaSanPham }
        });

        res.status(200).json({ msg: 'Đã mua sản phẩm thành công', lichSuMuaHangItems });
    } catch (err) {
        console.error("Lỗi khi mua hàng:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.delete('/delete-product-in-cart', async (req, res) => {
    try {
        const { maKhachHang, maSanPham } = req.body;

        const result = await GioHangModel.deleteMany({
            maKhachHang,
            maSanPham
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        res.status(200).json({ msg: 'Đã xóa sản phẩm thành công' });
    } catch (err) {
        console.error("Lỗi khi xóa sản phẩm trong giỏ hàng:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = uri;