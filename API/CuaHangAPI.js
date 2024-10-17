const uri = require("express").Router();
const SaveImage = require("../LoadImage");
const CuaHangModel = require("../Model/CuaHangModel");

uri.post("/CheckShop", async (req, res) => {
  const shop = await CuaHangModel.findOne({maKhachHang: req.body.IDU})
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

// Cấu hình multer để lưu trữ hình ảnh
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './Image');
//     },
//     filename: async function (req, file, cb) {
//         const { tenCuaHang, diaChi, soDienThoai, email, matKhau } = req.body;
//         const StoreCount = await CuaHangModel.countDocuments() + 1;

//         const hashedPassword = await bcrypt.hash(matKhau, saltRounds);

//         const NewStore = new CuaHangModel({
//             tenCuaHang, diaChi, soDienThoai, email, matKhau: hashedPassword,
//             maCuaHang: "CH" + (StoreCount < 10 ? "00" + StoreCount : StoreCount < 100 ? "0" + StoreCount : StoreCount)
//         });
//         const extensionPath = path.extname(file.originalname).slice(1);
//         NewStore.hinhAnh = NewStore.maCuaHang + NewStore._id;
//         NewStore.LoaiAnh = extensionPath;
//         req.NewStore = NewStore;
//         await NewStore.save();
//         cb(null, NewStore.hinhAnh + "." + extensionPath);
//     }
// });

// const upload = multer({ storage: storage });

uri.post("/CreateShop", async (req, res) => {
  const { tenCuaHang, diaChi, loaiAnh, maKhachHang } = req.body;
  const file = req.files.DataImage;
  const countShop = (await CuaHangModel.countDocuments()) + 1;
  const NewShop = new CuaHangModel({
    maCuaHang:
      "CH" +
      (countShop < 10
        ? "00" + countShop
        : countShop < 100
        ? "0" + countShop
        : countShop),
    tenCuaHang: tenCuaHang,
    diaChi: diaChi,
    loaiAnh: loaiAnh,
    maKhachHang: maKhachHang
  });
  NewShop.hinhAnh = NewShop.maCuaHang + NewShop._id;
  await NewShop.save();
  try {
    await SaveImage(file, NewShop.hinhAnh + "." + loaiAnh);
    res.json({ Status: "Success", IDS: NewShop._id });
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ Status: "Error", message: "Failed to save image" });
  }
});

uri.delete("/delete-product/:maSanPham", async (req, res) => {
  try {
    const { maSanPham } = req.params;
    const product = await SanPhamModel.findOneAndDelete({ maSanPham });

    if (!product) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }

    const imagePath = path.join(
      __dirname,
      "../Image",
      `${product.hinhAnh}.${product.loaiAnh}`
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({ msg: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm: ", error);
    res.status(500).json({ msg: "Đã xảy ra lỗi khi xử lý yêu cầu" });
  }
});

module.exports = uri;
