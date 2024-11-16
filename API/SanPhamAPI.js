const uri = require("express").Router();
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");
const DanhGiaModel = require("../Model/DanhGiaModel");
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
    return res.status(404).json({ Error: "Empty Product" });
  } else {
    return res.json(ProductSearch);
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
    return res.json({ Status: "Success", IDP: newProduct._id });
  } catch (err) {
    console.error("Error saving image:", err);
    return res
      .status(500)
      .json({ Status: "Error", message: "Failed to save image" });
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
  const product = await SanPhamModel.findById(IDPP);
  if (product) {
    return res.send({ Status: "Success", product: product });
  } else {
    return res.json({ Status: "Not Found" });
  }
});

uri.post("/GetProductRank", async (req, res) => {
  const topRated = await DanhGiaModel.aggregate([
    {
      $group: {
        _id: "$maSanPham",
        totalRatings: { $sum: 1 },
        averageRating: { $avg: "$mucDoDanhGia" },
      },
    },
    {
      $addFields: {
        _id: { $toObjectId: "$_id" }, // Chuyển sang ObjectId nếu cần
      },
    },
    {
      $lookup: {
        from: "SanPhamModel", // Tên chính xác của collection
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
        preserveNullAndEmptyArrays: false, // Chỉ giữ sản phẩm khớp
      },
    },
    {
      // Chuyển maCuaHang từ string thành ObjectId trước khi $lookup
      $addFields: {
        "productInfo.maCuaHang": { $toObjectId: "$productInfo.maCuaHang" }, // Chuyển maCuaHang thành ObjectId
      },
    },
    {
      // Thêm lookup để lấy tên cửa hàng từ CuaHangModel
      $lookup: {
        from: "CuaHangModel", // Tên chính xác của collection cửa hàng
        localField: "productInfo.maCuaHang", // Sử dụng maCuaHang sau khi chuyển sang ObjectId
        foreignField: "_id", // Tìm kiếm dựa trên _id trong CuaHangModel
        as: "storeInfo",
      },
    },
    {
      // Chỉ lấy trường tenCuaHang từ cửa hàng
      $unwind: {
        path: "$storeInfo",
        preserveNullAndEmptyArrays: true, // Giữ lại nếu không tìm thấy cửa hàng
      },
    },
    {
      $addFields: {
        "productInfo.tenCuaHang": "$storeInfo.tenCuaHang", // Thêm tên cửa hàng vào productInfo
      },
    },
  ]);

  // Kiểm tra nếu số lượng sản phẩm < 3
  if (topRated.length < 3) {
    const missingCount = 3 - topRated.length;

    // Lấy ngẫu nhiên sản phẩm từ SanPhamModel
    let randomProducts = await SanPhamModel.aggregate([
      { $sample: { size: missingCount * 2 } }, // Lấy nhiều sản phẩm hơn để đảm bảo không trùng
      {
        $project: {
          _id: 1,
          tenSanPham: 1,
          giaTien: 1,
          hinhAnh: 1,
          loaiAnh: 1,
          maCuaHang: 1, // Đảm bảo bạn lấy maCuaHang để thêm tên cửa hàng sau này
        },
      },
    ]);

    // Chuyển sang mảng các _id sản phẩm đã có trong topRated
    const existingProductIds = topRated.map((product) =>
      product._id.toString()
    );

    // Lọc ra các sản phẩm không bị trùng
    randomProducts = randomProducts.filter(
      (product) => !existingProductIds.includes(product._id.toString())
    );

    // Lấy tên cửa hàng từ CuaHangModel cho các sản phẩm ngẫu nhiên
    const storeInfoForRandomProducts = await CuaHangModel.find({
      _id: { $in: randomProducts.map((product) => product.maCuaHang) }, // Tìm cửa hàng theo _id
    });

    // Tạo đối tượng storeInfo cho từng sản phẩm
    randomProducts = randomProducts.map((product) => {
      const store = storeInfoForRandomProducts.find(
        (store) => store._id.toString() === product.maCuaHang
      );
      return {
        _id: product._id,
        totalRatings: 0,
        averageRating: 0,
        productInfo: {
          ...product,
          // Thêm tên cửa hàng
        },
        storeInfo: {
          tenCuaHang: store ? store.tenCuaHang : "Cửa hàng không xác định",
        },
      };
    });

    // Gộp kết quả và trả về
    return res.status(200).json([...topRated, ...randomProducts]);
  }

  // Trả về kết quả nếu đủ 3 sản phẩm
  return res.status(200).json(topRated);
});

module.exports = uri;
