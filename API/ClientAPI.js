const uri = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ClientModel = require('../Model/ClientModel');
const TaskOnceImage = require("../TakeImage");
const fs = require("fs");
const LoadImage = require("../LoadImage");
const path = require('path');

uri.post('/register', LoadImage.single('hinhAnh'), async (req, res) => {
  try {
    const { maKhachHang, hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    let client = await ClientModel.findOne({ email });
    if (client) {
      return res.status(400).json({ msg: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(maKhachHang, salt);

    // Xử lý tải lên hình ảnh
    let hinhAnh = '';
    let LoaiAnh = '';
    if (req.file) {
      hinhAnh = req.file.filename;
      LoaiAnh = req.file.mimetype.split('/')[1]; // Lấy phần mở rộng của file
    } else {
      return res.status(400).json({ msg: 'Chưa tải lên hình ảnh' });
    }

    // Tạo client mới
    client = new ClientModel({
      maKhachHang,
      hoVaTen,
      gioiTinh,
      ngaySinh,
      diaChi,
      email,
      matKhau: hashedPassword,
      hinhAnh,
      LoaiAnh
    });

    await client.save();

    // Đổi tên file
    const fileName = req.file.originalname;
    const fileExt = fileName.split('.').pop().toLowerCase();
    const newFileName = `${client.maKhachHang}${client._id}`;
    const oldPath = req.file.path;
    const newPath = path.join(__dirname, '..', 'Image', `${newFileName}.${fileExt}`);
    
    console.log(`Old Path: ${oldPath}`);
    console.log(`New Path: ${newPath}`);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      
      // Cập nhật tên file vào cơ sở dữ liệu (không có phần mở rộng)
      client.hinhAnh = newFileName; // Chỉ lưu tên file
      await client.save(); // Lưu cập nhật
    } else {
      return res.status(400).json({ msg: 'Lỗi tải lên hình ảnh' });
    }

    // Đọc hình ảnh đã lưu
    const imagePath = path.join(__dirname, '..', 'Image', `${client.hinhAnh}.${fileExt}`); // Đường dẫn đúng
    console.log(`Image Path: ${imagePath}`);
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Tạo JWT token
    const payload = {
      client: {
        id: client.id
      }
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: 'Thiếu khóa bí mật JWT' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          client: { 
            id: client.id, 
            email: client.email, 
            hoVaTen: client.hoVaTen,
            hinhAnh: base64Image
          } 
        });
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

    // Đọc hình ảnh của client
    const imagePath = TaskOnceImage(client.hinhAnh);
    const base64Image = await LoadImage(imagePath);

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
        res.json({ 
          token, 
          client: {
            id: client.id,
            email: client.email,
            hoVaTen: client.hoVaTen,
            hinhAnh: base64Image
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
});

module.exports = uri;