const uri = require("express").Router();
const DanhGiaModel = require("../Model/DanhGiaModel");
const PhanHoiModel = require("../Model/PhanHoiModel");
const ThongBaoModel = require("../Model/ThongBaoModel");

uri.get("/response", async (req, res) => {
    try {
        console.log("DanhGiaModel:", DanhGiaModel);
        const danhGiaList = await DanhGiaModel.find({});
        console.log("Dữ liệu đánh giá:", danhGiaList);
        res.json(danhGiaList);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.post("/new-response", async (req, res) => {
    try {
        const { maSanPham, maKhachHang, noiDung, mucDoDanhGia } = req.body;

        const newDanhGia = new DanhGiaModel({
            maSanPham,
            maKhachHang,
            noiDung,
            mucDoDanhGia
        });

        await newDanhGia.save();

        res.status(201).json({ msg: 'Đánh giá đã được thêm thành công', danhGia: newDanhGia });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.put("/update-response/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { noiDung, mucDoDanhGia } = req.body;

        const updatedDanhGia = await DanhGiaModel.findByIdAndUpdate(
            id,
            { noiDung, mucDoDanhGia },
            { new: true }
        );

        if (!updatedDanhGia) {
            return res.status(404).json({ msg: 'Không tìm thấy đánh giá' });
        }

        res.status(200).json({ msg: 'Đánh giá đã được cập nhật thành công', danhGia: updatedDanhGia });
    } catch (err) {
        console.error("Error updating review:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.delete("/delete-response/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDanhGia = await DanhGiaModel.findByIdAndDelete(id);

        if (!deletedDanhGia) {
            return res.status(404).json({ msg: 'Không tìm thấy đánh giá' });
        }

        res.status(200).json({ msg: 'Đánh giá đã được xóa thành công' });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ message: err.message });
    }
});

uri.post("/reply", async (req, res) => {
    try {
        const { maDanhGia, maCuaHang, noiDung } = req.body;

        const newPhanHoi = new PhanHoiModel({
            maDanhGia,
            maCuaHang,
            noiDung
        });

        await newPhanHoi.save();

        const danhGia = await DanhGiaModel.findById(maDanhGia);
        if (!danhGia) {
            return res.status(404).json({ msg: 'Không tìm thấy đánh giá' });
        }

        const newThongBao = new ThongBaoModel({
            maKhachHang: danhGia.maKhachHang,
            maCuaHang: maCuaHang,
            noiDung: `Cửa hàng đã phản hồi đánh giá của bạn: ${noiDung}`,
            trangThai: false
        });

        await newThongBao.save();

        res.status(201).json({ msg: 'Phản hồi đã được thêm thành công', phanHoi: newPhanHoi, thongBao: newThongBao });
    } catch (err) {
        console.error("Error adding response:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = uri;