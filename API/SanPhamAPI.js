const uri = require("express").Router();
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/Products", async (req, res) => {
  const Products = await SanPhamModel.find();
  res.send(Products);
});

uri.post("/Search", async (req, res) => {
  const ProductSearch = await SanPhamModel.find({
    tenSanPham: new RegExp(req.body.Search, "i"),
  });
  if (ProductSearch.length === 0) {
    res.status(404).json({ Error: "Empty Product" });
  } else {
    res.json(ProductSearch);
  }
});

uri.post("/AddProduct", async (req, res) => {
  const { tenSanPham, maCuaHang, giaTien, moTa, loaiAnh } = req.body;
  const file = req.files.DataImage;
  const newProduct = new SanPhamModel({
    maCuaHang: maCuaHang,
    tenSanPham: tenSanPham,
    giaTien: giaTien,
    moTa: moTa,
    loaiAnh: loaiAnh,
  });
  newProduct.hinhAnh = newProduct._id;
  try {
    await SaveImage(file, newProduct.hinhAnh + "." + loaiAnh);
    res.json({ Status: "Success", IDP: newProduct._id });
  } catch (err) {
    console.error("Error saving image:", err);
    res.status(500).json({ Status: "Error", message: "Failed to save image" });
  }
});

uri.post("/ProductOfShop", async (req, res) => {
  const shop = await CuaHangModel.findById(req.body.IDSP);
  const listProduct = await SanPhamModel.find({ maCuaHang: shop._id });
  if (listProduct) {
    return res.send(listProduct);
  } else {
    return res.json({ Status: "Not Found" });
  }
});

uri.post("/DeleteProduct", async (req, res) => {
  const IDP = req.body.IDP;
  const result = await SanPhamModel.findOneAndDelete({ _id: IDP });
  if (result) {
    return res.json({ Status: "Success" });
  } else {
    return res.json({ Status: "False" });
  }
});

uri.post("/InforProduct", async (req, res) => {
  const IDPP = req.body.IDPP;
  const product = await SanPhamModel.findById(IDPP)
  if(product){
    res.send({Status: "Success", product: product})
  }else{
    res.json({Status: "Not Found"})
  }
})

module.exports = uri;