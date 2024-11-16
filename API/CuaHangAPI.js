const uri = require("express").Router();
const SaveImage = require("../LoadImage");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/CheckShop", async (req, res) => {
  const shop = await CuaHangModel.findOne({maKhachHang: req.body.ID})
  if(shop){
    return res.json({Status: "Success", shop: shop})
  }else{
    return res.json({ Status: "False"})
  }
});

uri.post("/InforShop", async (req, res) => {
  const shop = await CuaHangModel.findById(req.body.IDSP)
  if(shop){
    return res.json({Status: "Success", shop: shop})
  }else{
    return res.json({ Status: "False"})
  }
});

uri.post("/CreateShop", async (req, res) => {
  const { tenCuaHang, diaChi, loaiAnh, maKhachHang } = req.body;
  const file = req.files.DataImage;
  const NewShop = new CuaHangModel({
    tenCuaHang: tenCuaHang,
    diaChi: diaChi,
    loaiAnh: loaiAnh,
    maKhachHang: maKhachHang,
    loaiAnh: loaiAnh
  });
  NewShop.hinhAnh = NewShop._id;
  await NewShop.save();
  try {
    await SaveImage(file, NewShop.hinhAnh + "." + loaiAnh);
    return res.json({ Status: "Success", IDS: NewShop._id });
  } catch (err) {
    console.error('Error saving image:', err);
    return res.status(500).json({ Status: "Error", message: "Failed to save image" });
  }
});

module.exports = uri;