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

uri.post("/Search", async (req, res) => {
  const ListIDOfSearch = await SanPhamModel.find(
    {
      tenSanPham: new RegExp(req.body.Search, "i"),
    },
    "maSanPham"
  );
  if (ListIDOfSearch.length === 0) {
    res.status(404).json({ Error: "Empty Product" });
  } else {
    res.json(ListIDOfSearch);
  }
});

module.exports = uri;
