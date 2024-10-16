const uri = require("express").Router();
const CuaHangModel = require('../Model/CuaHangModel');

uri.post('/check-store', async (req, res) => {
    try {
        const { maKhachHang } = req.body;
        console.log('Mã khách hàng:', maKhachHang);

        if (!maKhachHang) {
            return res.status(400).json({ msg: 'Thiếu mã khách hàng' });
        }

        const cuaHang = await CuaHangModel.findOne({ maKhachHang }).exec();

        if (!cuaHang) {
            return res.status(404).json({ msg: 'Khách hàng chưa đăng ký cửa hàng' });
        }
        else {
            res.json({message: 'Đã tìm thấy cửa hàng', cuaHang});
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra cửa hàng: ', error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    }
});
// Cấu hình multer để lưu trữ hình ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Image');
    },
    filename: async function (req, file, cb) {
        const { tenCuaHang, diaChi, soDienThoai, email, matKhau } = req.body;
        const StoreCount = await CuaHangModel.countDocuments() + 1;

        const hashedPassword = await bcrypt.hash(matKhau, saltRounds);

        const NewStore = new CuaHangModel({
            tenCuaHang, diaChi, soDienThoai, email, matKhau: hashedPassword,
            maCuaHang: "CH" + (StoreCount < 10 ? "00" + StoreCount : StoreCount < 100 ? "0" + StoreCount : StoreCount)
        });
        const extensionPath = path.extname(file.originalname).slice(1);
        NewStore.hinhAnh = NewStore.maCuaHang + NewStore._id;
        NewStore.LoaiAnh = extensionPath;
        req.NewStore = NewStore;
        await NewStore.save();
        cb(null, NewStore.hinhAnh + "." + extensionPath);
    }
});

const upload = multer({ storage: storage });

uri.post('/register-store', upload.single('hinhAnh'), async (req, res) => {
    try {
        res.status(201).send(req.NewStore);
    } catch (error) {
        console.error('Lỗi khi đăng ký cửa hàng: ', error);
        res.status(500).send(error);
    }
});

uri.delete('/delete-product/:maSanPham', async (req, res) => {
    try {
      const { maSanPham } = req.params;
      const product = await SanPhamModel.findOneAndDelete({ maSanPham });
  
      if (!product) {
        return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
      }
  
      const imagePath = path.join(__dirname, '../Image', `${product.hinhAnh}.${product.loaiAnh}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
  
      res.status(200).json({ msg: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm: ', error);
      res.status(500).json({ msg: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    }
  });


module.exports = uri;