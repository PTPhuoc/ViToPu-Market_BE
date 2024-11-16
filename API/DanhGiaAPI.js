const uri = require("express").Router();
const DanhGiaModel = require("../Model/DanhGiaModel");
const PhanHoiModel = require("../Model/PhanHoiModel");
const ClientModel = require("../Model/ClientModel");
const LichSuModel = require("../Model/LichSuModel");
const ThongBao = require("./ThongBaoAPI");
const SanPhamModel = require("../Model/SanPhamModel");

uri.post("/GetCommentByProduct", async (req, res) => {
  const comments = await DanhGiaModel.find({ maSanPham: req.body.maSanPham });
  if (comments.length > 0) {
    const userComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ClientModel.findById(comment.maKhachHang);
        const phanHoi = await PhanHoiModel.findOne({ maDanhGia: comment._id });
        return {
          maSanPham: comment.maSanPham,
          maDanhGia: comment._id,
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
                ngayPhanHoi: phanHoi.ngayPhanHoi,
              }
            : null, // Nếu không có phản hồi, trả về null
        };
      })
    );
    return res.json({ Status: "Success", userComment: userComments });
  } else {
    return res.json({ Status: "Not Found" });
  }
});

uri.post("/FilterComment", async (req, res) => {
  const { maSanPham, mucDoDanhGia } = req.body;
  const filterComment = await DanhGiaModel.find({
    maSanPham: maSanPham,
    mucDoDanhGia: mucDoDanhGia,
  });
  if (filterComment.length > 0) {
    const userComments = await Promise.all(
      filterComment.map(async (comment) => {
        const user = await ClientModel.findById(comment.maKhachHang);
        const phanHoi = await PhanHoiModel.findOne({ maDanhGia: comment._id });
        return {
          maSanPham: comment.maSanPham,
          maDanhGia: comment._id,
          mucDoDanhGia: comment.mucDoDanhGia,
          noiDung: comment.noiDung,
          hoVaTen: user.hoVaTen,
          _id: user._id,
          hinhAnh: user.hinhAnh,
          loaiAnh: user.loaiAnh,
          ngayDanhGia: comment.ngayDanhGia,
          phanHoi: phanHoi
            ? {
                noiDung: phanHoi.noiDung,
                maCuaHang: phanHoi.maCuaHang,
                ngayPhanHoi: phanHoi.ngayPhanHoi,
              }
            : null,
        };
      })
    );
    return res.send({ Status: "Success", filterComment: userComments });
  } else {
    return res.json({ Status: "Not Found" });
  }
});

uri.post("/CheckComment", async (req, res) => {
  const { maKhachHang, maSanPham } = req.body;
  const latestPurchase = await LichSuModel.findOne({
    maKhachHang: maKhachHang,
    maSanPham: maSanPham,
  }).sort({ ngayMua: -1 });
  const latestReview = await DanhGiaModel.findOne({
    maKhachHang: maKhachHang,
    maSanPham: maSanPham,
  }).sort({ ngayDanhGia: -1 });
  if (latestPurchase && latestReview) {
    const purchaseDate = new Date(latestPurchase.ngayMua);
    const reviewDate = new Date(latestReview.ngayDanhGia);
    if (purchaseDate > reviewDate) {
      res.send(true);
    } else {
      res.send(false);
    }
  } else if (latestPurchase && !latestReview) {
    return res.send(true);
  } else {
    return res.send(false);
  }
});

uri.post("/Comment", async (req, res) => {
  const {
    maKhachHang,
    maSanPham,
    ngayDanhGia,
    mucDoDanhGia,
    noiDung,
    maCuaHang,
    tenSanPham,
  } = req.body;
  const currentAccount = await ClientModel.findById(maKhachHang);
  await ThongBao.CreateNontificate(
    maSanPham,
    "Khách hàng " +
      currentAccount.hoVaTen +
      " đã đánh giá " +
      mucDoDanhGia +
      " sao cho sản phẩm " +
      tenSanPham,
    true,
    maCuaHang
  );
  const NewComment = new DanhGiaModel({
    maKhachHang: maKhachHang,
    maSanPham: maSanPham,
    ngayDanhGia: ngayDanhGia,
    mucDoDanhGia: mucDoDanhGia,
    noiDung: noiDung,
  });
  await NewComment.save();
  req.io.emit("Notification", { Status: true, maKhachHang: maKhachHang });
  return res.json({ Status: "Success" });
});

uri.post("/UpdateComment", async (req, res) => {
  const { noiDung, maDanhGia, ngayDanhGia, mucDoDanhGia } = req.body;
  const updateComment = await DanhGiaModel.findById(maDanhGia);
  updateComment.noiDung = noiDung;
  updateComment.ngayDanhGia = ngayDanhGia;
  updateComment.mucDoDanhGia = mucDoDanhGia;
  const currentAccount = await ClientModel.findById(updateComment.maKhachHang);
  const currentProduct = await SanPhamModel.findById(updateComment.maSanPham);
  await ThongBao.CreateNontificate(
    updateComment.maSanPham,
    "Khách hàng " +
      currentAccount.hoVaTen +
      " đã sửa đánh giá " +
      mucDoDanhGia +
      " sao cho sản phẩm " +
      currentProduct.tenSanPham +
      " với nội dung: " +
      noiDung,
    true,
    currentProduct.maCuaHang
  );
  await updateComment.save();
  req.io.emit("Notification", {
    Status: true,
    maKhachHang: updateComment.maKhachHang,
  });
  return res.json({ Status: "Success" });
});

module.exports = uri;
