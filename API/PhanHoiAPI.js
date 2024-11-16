const uri = require("express").Router();
const PhanHoiModel = require("../Model/PhanHoiModel");
const SanPhamModel = require("../Model/SanPhamModel");
const DanhGiaModel = require("../Model/DanhGiaModel");
const CuaHangModel = require("../Model/CuaHangModel");
const ThongBao = require("./ThongBaoAPI");

uri.post("/GetFeedbackByComment", async (req, res) => {
  const feedback = await PhanHoiModel.find({ maDanhGia: req.body.maDanhGia });
  if (feedback) {
    return res.send({ Status: "Success", feedback: feedback });
  } else {
    return res.json({ Status: "Not Found" });
  }
});

uri.post("/Feedback", async (req, res) => {
  const { maDanhGia, maCuaHang, noiDung, ngayPhanHoi } = req.body;
  const newFeedback = new PhanHoiModel({
    maDanhGia: maDanhGia,
    maCuaHang: maCuaHang,
    noiDung: noiDung,
    ngayPhanHoi: ngayPhanHoi,
  });
  const currentComment = await DanhGiaModel.findById(maDanhGia);
  const currentProduct = await SanPhamModel.findById(currentComment.maSanPham);
  const currentShop = await CuaHangModel.findById(maCuaHang);
  await ThongBao.CreateNontificate(
    currentComment.maSanPham,
    "Cửa hàng " +
      currentShop.tenCuaHang +
      " đã phản hồi đánh giá của bạn với sản phẩm " +
      currentProduct.tenSanPham,
    true,
    currentComment.maKhachHang
  );
  await newFeedback.save();
  req.io.emit("Notification", {
    Status: true,
    maKhachHang: currentComment.maKhachHang,
  });
  return res.json({ Status: "Success" });
});

uri.post("/UpdateFeedback", async (req, res) => {
  const { noiDung, maDanhGia, ngayPhanHoi } = req.body;
  const updateFeedback = await PhanHoiModel.findOne({ maDanhGia: maDanhGia });
  updateFeedback.noiDung = noiDung;
  updateFeedback.ngayPhanHoi = ngayPhanHoi;
  const currentComment = await DanhGiaModel.findById(maDanhGia);
  const currentProduct = await SanPhamModel.findById(currentComment.maSanPham);
  const currentShop = await CuaHangModel.findById(currentProduct.maCuaHang);
  await ThongBao.CreateNontificate(
    currentComment.maSanPham,
    "Cửa hàng " +
      currentShop.tenCuaHang +
      " đã chỉnh sửa phản hồi trên đánh giá của bạn với sản phẩm " +
      currentProduct.tenSanPham + ". Nội dung: " + noiDung,
    true,
    currentComment.maKhachHang
  );
  updateFeedback.save();
  req.io.emit("Notification", {
    Status: true,
    maKhachHang: currentComment.maKhachHang,
  });
  return res.json({ Status: "Success" });
});

module.exports = uri;
