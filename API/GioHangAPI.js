const uri = require("express").Router();
const GioHangModel = require("../Model/GioHangModel");
const SanPhamModel = require("../Model/SanPhamModel");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/AddToCart", async (req, res) => {
  const { maKhachHang, maSanPham } = req.body;
  const checkCart = await GioHangModel.findOne({
    maKhachHang: maKhachHang,
    maSanPham: maSanPham,
  });
  if (checkCart) {
    checkCart.soLuong += 1;
    await checkCart.save();
  } else {
    const NewCart = new GioHangModel({
      maKhachHang: maKhachHang,
      maSanPham: maSanPham,
      soLuong: 1,
    });
    await NewCart.save();
  }
  res.json({ Status: "Success" });
});

uri.post("/CartOfUser", async (req, res) => {
  const carts = await GioHangModel.find({ maKhachHang: req.body.ID });
  if (carts.length > 0) {
    const detailCart = await Promise.all(
      carts.map(async (e) => {
        const product = await SanPhamModel.findById(e.maSanPham);
        const shop = await CuaHangModel.findById(product.maCuaHang);
        return {
          maKhachHang: e.maKhachHang,
          maSanPham: e.maSanPham,
          soLuong: e.soLuong,
          giaTien: product.giaTien,
          tenSanPham: product.tenSanPham,
          hinhAnh: product.hinhAnh,
          loaiAnh: product.loaiAnh,
          tenCuaHang: shop.tenCuaHang,
        };
      })
    );
    res.send({ Status: "Success", detailCart: detailCart });
  } else {
    res.json({ Status: "Not Found" });
  }
});

uri.post("/DeleteCart", async (req, res) => {
  await GioHangModel.deleteOne({
    maKhachHang: req.body.maKhachHang,
    maSanPham: req.body.maSanPham,
  });
  res.json({ Status: "Success" });
});

module.exports = uri;
