const uri = require("express").Router();
const LichSuModel = require("../Model/LichSuModel");
const GioHangModel = require("../Model/GioHangModel");
const SanPhamModel = require("../Model/SanPhamModel");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/AddToHistory", async (req, res) => {
  const { maKhachHang, maSanPham, ngayMua, soLuong, giaTien } = req.body;
  const NewHistory = new LichSuModel({
    maKhachHang: maKhachHang,
    maSanPham: maSanPham,
    ngayMua: ngayMua,
    soLuong: soLuong,
    giaTien: giaTien,
  });
  await NewHistory.save();
  await GioHangModel.deleteOne({
    maKhachHang: req.body.maKhachHang,
    maSanPham: req.body.maSanPham,
  });
  res.json({ Status: "Success" });
});

uri.post("/GetHistoryCart", async (req, res) => {
  const historyCart = await LichSuModel.find({ maKhachHang: req.body.ID });
  if (historyCart.length > 0) {
    const detailHistory = await Promise.all(
      historyCart.map(async (e) => {
        const product = await SanPhamModel.findById(e.maSanPham);
        const shop = await CuaHangModel.findById(product.maCuaHang);
        return {
          maSanPham: e.maSanPham,
          maKhachHang: e.maKhachHang,
          ngayMua: e.ngayMua,
          soLuong: e.soLuong,
          giaTien: e.giaTien,
          loaiAnh: product.loaiAnh,
          tenSanPham: product.tenSanPham,
          tenCuaHang: shop.tenCuaHang,
        };
      })
    );
    res.send({ Status: "Success", detailHistory: detailHistory });
  } else {
    res.json({ Status: "Not Found" });
  }
});

module.exports = uri;