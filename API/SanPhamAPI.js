const uri = require("express").Router();
const TaskOnceImage = require("../TakeImage");
const fs = require("fs");
const SanPhamModel = require("../Model/SanPhamModel");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/Products", async (req, res) => {
  const Products = await SanPhamModel.find();
  res.send(Products);
});

uri.post("/Search", async (req, res) => {
  const ProductSearch = await SanPhamModel.find(
    {
      tenSanPham: new RegExp(req.body.Search, "i"),
    },
  );
  if (ProductSearch.length === 0) {
    res.status(404).json({ Error: "Empty Product" });
  } else {
    res.json(ProductSearch);
  }
});

uri.post("/AddProduct", async (req, res) => {
  const { tenSanPham, maCuaHang, giaTien, moTa, loaiAnh } = req.body;
  const file = req.files.DataImage;
  const countProduct = (await SanPhamModel.countDocuments()) + 1;
  const newProduct = new SanPhamModel({
    maSanPham: "SP" +
      (countProduct < 10
        ? "00" + countProduct
        : countProduct < 100
        ? "0" + countProduct
        : countProduct),
      maCuaHang: maCuaHang,
      tenSanPham: tenSanPham,
      giaTien: giaTien, moTa: moTa,
      loaiAnh: loaiAnh
  })
  newProduct.hinhAnh = newProduct.maSanPham + newProduct._id;
  try {
    await SaveImage(file, newProduct.hinhAnh + "." + loaiAnh);
    res.json({ Status: "Success", IDP: newProduct._id });
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ Status: "Error", message: "Failed to save image" });
  }
})

uri.post("/ProductOfShop", async (req, res) => {
  const shop = await CuaHangModel.findById(req.body.IDS)
  const listProduct = await SanPhamModel.find({maCuaHang: shop.maCuaHang})
  if(listProduct){
    return res.send(listProduct)
  }else{
    return res.json({Status: "Not Found"})
  }
})


// Cấu hình multer để lưu trữ hình ảnh sản phẩm
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './Image');
//   },
//   filename: async function (req, file, cb) {
//     const { tenSanPham, giaSanPham, moTaSanPham, maCuaHang } = req.body;
//     const ProductCount = await SanPhamModel.countDocuments() + 1;

//     const NewProduct = new SanPhamModel({
//       tenSanPham, giaSanPham, moTaSanPham, maCuaHang,
//       maSanPham: "SP" + (ProductCount < 10 ? "00" + ProductCount : ProductCount < 100 ? "0" + ProductCount : ProductCount)
//     });
//     const extensionPath = path.extname(file.originalname).slice(1);
//     NewProduct.hinhAnh = NewProduct.maSanPham + NewProduct._id;
//     NewProduct.loaiAnh = extensionPath;
//     req.NewProduct = NewProduct;
//     await NewProduct.save();
//     cb(null, NewProduct.hinhAnh + "." + extensionPath);
//   }
// });

// const upload = multer({ storage: storage });


// uri.post('/register-product', upload.single('hinhAnh'), async (req, res) => {
//   try {
//     res.status(201).send(req.NewProduct);
//   } catch (error) {
//     console.error('Lỗi khi đăng bán sản phẩm: ', error);
//     res.status(500).send(error);
//   }
// });

// uri.get('/products-by-store/:maCuaHang', async (req, res) => {
//   try {
//     const { maCuaHang } = req.params;
//     const products = await SanPhamModel.find({ maCuaHang });
//     res.status(200).send(products);
//   } catch (error) {
//     console.error('Lỗi khi lấy sản phẩm theo mã cửa hàng: ', error);
//     res.status(500).send(error);
//   }
// });

// uri.get('/product/:maSanPham', async (req, res) => {
//   try {
//     const { maSanPham } = req.params;
//     const product = await SanPhamModel.findOne({ maSanPham });

//     if (!product) {
//       return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
//     }

//     res.status(200).send(product);
//   } catch (error) {
//     console.error('Lỗi khi lấy thông tin sản phẩm: ', error);
//     res.status(500).send(error);
//   }
// });

// uri.get('/store/:maCuaHang', async (req, res) => {
//   try {
//     const { maCuaHang } = req.params;
//     const store = await CuaHangModel.findOne({ maCuaHang });

//     if (!store) {
//       return res.status(404).json({ msg: 'Không tìm thấy cửa hàng' });
//     }

//     res.status(200).send(store);
//   } catch (error) {
//     console.error('Lỗi khi lấy thông tin cửa hàng: ', error);
//     res.status(500).send(error);
//   }
// });

// uri.post('/buy-product', async (req, res) => {
//   try {
//     const { maSanPham, maKhachHang } = req.body;
    
//     const product = await SanPhamModel.findOne({ maSanPham });
//     if (!product) {
//       return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
//     }

//     product.maKhachHang = maKhachHang;
//     await product.save();

//     res.status(201).json({ msg: 'Giao dịch thành công', product });
//   } catch (error) {
//     console.error('Lỗi khi mua sản phẩm: ', error);
//     res.status(500).send(error);
//   }
// });

module.exports = uri;
