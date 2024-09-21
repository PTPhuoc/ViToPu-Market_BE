const uri = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ClientModel = require('../Model/ClientModel'); 
const upload = require('../Config/multerConfig'); 

uri.post('/register', upload.single('hinhAnh'), async (req, res) => {
  try {
    console.log(req.file);
    const { maKhachHang, hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    let client = await ClientModel.findOne({ email });
    if (client) {
      return res.status(400).json({ msg: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhau, salt);

    // Tạo client mới
    client = new ClientModel({
      maKhachHang,
      hoVaTen,
      gioiTinh,
      ngaySinh,
      diaChi,
      email,
      matKhau: hashedPassword,
      hinhAnh: req.file ? req.file.path : undefined,
      LoaiAnh: req.file ? req.file.mimetype : undefined
    });

    await client.save();

    // Tạo JWT token
    const payload = {
      client: {
        id: client.id
      }
    };

    console.log("JWT_SECRET: ", process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: 'JWT secret key is missing' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
});

// Đăng nhập
uri.post('/login', async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    // Kiểm tra xem email có tồn tại không
    let client = await ClientModel.findOne({ email });
    if (!client) {
      return res.status(400).json({ msg: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhau, client.matKhau);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Tạo JWT token
    const payload = {
      client: {
        id: client.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
});

module.exports = uri;