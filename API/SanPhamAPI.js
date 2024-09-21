const uri = require("express").Router();
const TaskOnceImage = require("../TakeImage");
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");

uri.post("/ListID", async (req, res) => {
  const ListID = await SanPhamModel.find({}, "maSanPham");
  res.send(ListID);
});

uri.post("/Detail", async (req, res) => {
  const Product = await SanPhamModel.findOne({ maSanPham: req.body.maSanPham });
  const ImageProduct = fs
    .readFileSync(
      TaskOnceImage(Product.maSanPham + Product._id + "." + Product.LoaiAnh)
    )
    .toString("base64");
  const DetailProduct = {
    ...Product.toObject(),
    ImageValue: ImageProduct,
  };
  res.json(DetailProduct);
});

uri.get("/timkiemsanpham", async (req, res) => {
  try {
    const tenSanPham = req.query.tenSanPham;
    const sanPhamList = await SanPhamModel.find({
      tenSanPham: new RegExp(tenSanPham, "i"),
    });
    res.json(sanPhamList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = uri;
