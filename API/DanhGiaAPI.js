const uri = require("express").Router();
const DanhGiaModel = require("../Model/DanhGiaModel");
const PhanHoiModel = require("../Model/PhanHoiModel");
const ThongBaoModel = require("../Model/ThongBaoModel");
const ClientModel = require("../Model/ClientModel");

uri.post("/GetCommentByProduct", async (req, res) => {
  const comments = await DanhGiaModel.find({ maSanPham: req.body.maSanPham });
  if (comments.length > 0) {
    const userComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ClientModel.findById(comment.maKhachHang);
        const phanHoi = await PhanHoiModel.findOne({ maDanhGia: comment._id });
        return {
          maSanPham: comment.maSanPham,
          mucDoDanhGia: comment.mucDoDanhGia,
          noiDung: comment.noiDung,
          hoVaTen: user.hoVaTen, // Thêm thông tin người dùng
          _id: user._id, // Thông tin email
          hinhAnh: user.hinhAnh, // Hình ảnh của người dùng (nếu có)
          loaiAnh: user.loaiAnh, // Thông tin khác
          ngayDanhGia: comment.ngayDanhGia,
          phanHoi: phanHoi
            ? {
                noiDung: phanHoi.noiDung,
                maCuaHang: phanHoi.maCuaHang,
              }
            : null, // Nếu không có phản hồi, trả về null
        };
      })
    );
    res.json({ Status: "Success", userComment: userComments });
  } else {
    res.json({ Status: "Not Found" });
  }
});

module.exports = uri;
