const uri = require("express").Router();
const TaskOnceImage = require("../TakeImage");
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");

uri.post("/sanphamlist", async (req, res) => {
  try {
    const sanPhamList = await SanPhamModel.find({});
    res.json(sanPhamList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

uri.post("/timkiemsanpham", async (req, res) => {
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

uri.post("/LayAnh", (req, res) => {
  res.send(
    fs.readFileSync(TaskOnceImage(req.body.NameImage)).toString("base64")
  );
});

module.exports = uri;
