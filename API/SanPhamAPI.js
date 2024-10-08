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
// Cấu hình multer để lưu trữ hình ảnh sản phẩm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Image');
  },
  filename: async function (req, file, cb) {
    const { tenSanPham, giaSanPham, moTaSanPham, maCuaHang } = req.body;
    const ProductCount = await SanPhamModel.countDocuments() + 1;

    const NewProduct = new SanPhamModel({
      tenSanPham, giaSanPham, moTaSanPham, maCuaHang,
      maSanPham: "SP" + (ProductCount < 10 ? "00" + ProductCount : ProductCount < 100 ? "0" + ProductCount : ProductCount)
    });
    const extensionPath = path.extname(file.originalname).slice(1);
    NewProduct.hinhAnh = NewProduct.maSanPham + NewProduct._id;
    NewProduct.loaiAnh = extensionPath;
    req.NewProduct = NewProduct;
    await NewProduct.save();
    cb(null, NewProduct.hinhAnh + "." + extensionPath);
  }
});

const upload = multer({ storage: storage });


uri.post('/register-product', upload.single('hinhAnh'), async (req, res) => {
  try {
    res.status(201).send(req.NewProduct);
  } catch (error) {
    console.error('Lỗi khi đăng bán sản phẩm: ', error);
    res.status(500).send(error);
  }
});

uri.get('/products-by-store/:maCuaHang', async (req, res) => {
  try {
    const { maCuaHang } = req.params;
    const products = await SanPhamModel.find({ maCuaHang });
    res.status(200).send(products);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo mã cửa hàng: ', error);
    res.status(500).send(error);
  }
});

module.exports = uri;
