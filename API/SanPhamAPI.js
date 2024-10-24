const uri = require("express").Router();
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");
const CuaHangModel = require("../Model/CuaHangModel");
const DanhGiaModel = require("../Model/DanhGiaModel");

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
});

const tinhToanVaXepHangSanPham = (danhSachSanPham, danhSachDanhGia, danhSachCuaHang) => {
  try {
    if (!danhSachSanPham?.length || !danhSachDanhGia || !danhSachCuaHang) {
      throw new Error('Thiếu thông tin cần thiết');
    }

    const ketQuaTinhToan = danhSachSanPham.map(sanPham => {
      const danhGiaSanPham = danhSachDanhGia.filter(dg => dg.maSanPham === sanPham._id.toString());
      const cuaHang = danhSachCuaHang.find(ch => ch._id.toString() === sanPham.maCuaHang);
      return tinhToanChiTietSanPham(sanPham, danhGiaSanPham, cuaHang);
    });

    const ketQuaDaXepHang = xepHangSanPham(ketQuaTinhToan);

    return ketQuaDaXepHang;
  } catch (error) {
    console.error('Lỗi khi tính toán:', error);
    throw error;
  }
};

const tinhToanChiTietSanPham = (sanPham, danhGias, cuaHang) => {
  const { _id, tenSanPham } = sanPham;

  const soLuongDanhGia = danhGias.length;
  const tongSoSao = danhGias.reduce((tong, dg) => tong + dg.soSao, 0);
  const danhGiaTrungBinh = soLuongDanhGia > 0 ? tongSoSao / soLuongDanhGia : 0;

  const phanBoDanhGia = Array(5).fill(0);
  danhGias.forEach(dg => {
    if (dg.soSao >= 1 && dg.soSao <= 5) {
      phanBoDanhGia[dg.soSao - 1]++;
    }
  });

  const bayesianAverage = tinhToanBayesianAverage({
    danhGiaTrungBinh,
    soLuongDanhGia,
    C: 3.5,
    m: 10
  });

  const diemXepHang = tinhDiemXepHang({
    danhGiaTrungBinh,
    soLuongDanhGia,
    bayesianAverage
  });

  return {
    maSanPham: _id,
    tenSanPham,
    thongTinDanhGia: {
      soLuongDanhGia,
      danhGiaTrungBinh: Number(danhGiaTrungBinh.toFixed(1)),
      phanBoDanhGia,
      diemXepHang: Number(diemXepHang.toFixed(1))
    }
  };
};

const tinhToanBayesianAverage = ({ danhGiaTrungBinh, soLuongDanhGia, C = 3.5, m = 10 }) => {
  return (C * m + soLuongDanhGia * danhGiaTrungBinh) / (C + soLuongDanhGia);
};

const tinhDiemXepHang = ({ danhGiaTrungBinh, soLuongDanhGia, bayesianAverage }) => {
  const MAX_RATINGS = 1000;
  const normalizedRatings = Math.min(soLuongDanhGia / MAX_RATINGS, 1);
  const normalizedRating = danhGiaTrungBinh / 5;
  const normalizedBayesian = bayesianAverage / 5;

  const weights = {
    danhGia: 0.4,
    soLuong: 0.3,
    bayesian: 0.3
  };

  return (
    normalizedRating * weights.danhGia +
    normalizedRatings * weights.soLuong +
    normalizedBayesian * weights.bayesian
  ) * 5;
};

const xepHangSanPham = (danhSachSanPham) => {
  return danhSachSanPham
    .sort((a, b) => b.thongTinDanhGia.diemXepHang - a.thongTinDanhGia.diemXepHang)
    .map((sanPham, index) => ({
      ...sanPham,
      xepHang: index + 1
    }));
};

// Endpoint để lấy toàn bộ sản phẩm và xếp hạng
uri.get('/Ranking', async (req, res) => {
  try {
    const danhSachSanPham = await SanPhamModel.find({});
    const danhSachDanhGia = await DanhGiaModel.find({});
    const danhSachCuaHang = await CuaHangModel.find({});

    const ketQua = tinhToanVaXepHangSanPham(danhSachSanPham, danhSachDanhGia, danhSachCuaHang);

    res.status(200).json(ketQua);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xếp hạng' });
  }
});

module.exports = uri;