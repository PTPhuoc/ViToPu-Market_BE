const uri = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ClientModel = require('../Model/ClientModel');
const TaskOnceImage = require("../TakeImage");
const fs = require("fs");
const LoadImage = require("../LoadImage");
const path = require('path');
const nodemailer = require('nodemailer');

uri.post('/register', LoadImage.single('hinhAnh'), async (req, res) => {
  try {
    // Kiểm tra xem có file ảnh được tải lên không
    if (!req.file) {
      return res.status(400).json({ msg: 'Chưa tải lên hình ảnh' });
    }

    // Lấy thông tin người dùng đã được tạo bởi LoadImage middleware
    const NewClient = req.NewClient;

    // Mã hóa mật khẩu (nếu chưa được mã hóa trong LoadImage middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NewClient.matKhau, salt);
    NewClient.matKhau = hashedPassword;

    // Lưu NewClient vào cơ sở dữ liệu
    await NewClient.save();

    // Đọc hình ảnh đã lưu
    const imagePath = path.join(__dirname,'..', 'Image', `${NewClient.hinhAnh}.${NewClient.LoaiAnh}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Tạo JWT token
    const payload = {
      client: {
        id: NewClient.id
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
            id: NewClient.id,
            maKhachHang: NewClient.maKhachHang,
            email: NewClient.email,
            hoVaTen: NewClient.hoVaTen,
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
    // Lấy email và mật khẩu từ req.body
    const { email, matKhau } = req.body;

    // Log ra email và mật khẩu đã nhập
    console.log("Email được nhập:", email);
    console.log("Mật khẩu được nhập:", matKhau);

    // Kiểm tra xem email và mật khẩu có được cung cấp không
    if (!email || !matKhau) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp cả email và mật khẩu' });
    }

    // Tìm client trong cơ sở dữ liệu
    let client;
    try {
      client = await ClientModel.findOne({ email });
      console.log("Kết quả tìm kiếm client:", client);
    } catch (dbError) {
      console.error("Lỗi khi truy vấn cơ sở dữ liệu:", dbError);
      return res.status(500).json({ msg: 'Lỗi khi truy cập cơ sở dữ liệu' });
    }

    // Kiểm tra nếu không tìm thấy client
    if (!client) {
      console.log("Không tìm thấy client với email này");
      return res.status(400).json({ msg: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Kiểm tra mật khẩu
    let isMatch;
    try {
      isMatch = await bcrypt.compare(matKhau, client.matKhau);
    } catch (bcryptError) {
      console.error("Lỗi khi so sánh mật khẩu:", bcryptError);
      return res.status(500).json({ msg: 'Lỗi xác thực' });
    }

    // Nếu mật khẩu không khớp
    if (!isMatch) {
      return res.status(400).json({ msg: 'Thông tin đăng nhập không hợp lệ' });
    }
    // Tạo JWT token
    const payload = {
      client: {
        id: client.id
      }
    };

    // Tạo và trả về JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error("Lỗi khi tạo token:", err);
          return res.status(500).json({ msg: 'Lỗi khi tạo token' });
        }
        res.json({
          token,
          client: {
            id: client.id,
            email: client.email,
            hoVaTen: client.hoVaTen
          }
        });
      }
    );
  } catch (err) {
    console.error("Lỗi server:", err.message);
    res.status(500).send('Lỗi server');
  }
});

uri.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp email' });
    }

    const client = await ClientModel.findOne({ email });

    if (!client) {
      return res.status(400).json({ msg: 'Không tìm thấy người dùng với email này' });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = crypto.randomBytes(20).toString('hex');
    client.resetPasswordToken = resetToken;
    client.resetPasswordExpires = Date.now() + 300000; // Token hết hạn sau 1 giờ

    await client.save();

    // Gửi email chứa liên kết đặt lại mật khẩu
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      to: client.email,
      from: 'your-email@gmail.com',
      subject: 'Đặt lại mật khẩu',
      text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n
      Vui lòng nhấp vào liên kết sau hoặc dán nó vào trình duyệt của bạn để hoàn tất quá trình:\n\n
      http://${req.headers.host}/reset-password/${resetToken}\n\n
      Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: 'Email đặt lại mật khẩu đã được gửi' });
  } catch (err) {
    console.error("Error in forgot-password endpoint:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Endpoint để đặt lại mật khẩu
uri.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { matKhauMoi } = req.body;

    const client = await ClientModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!client) {
      return res.status(400).json({ msg: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    client.matKhau = matKhauMoi;
    client.resetPasswordToken = undefined;
    client.resetPasswordExpires = undefined;

    await client.save();

    res.status(200).json({ msg: 'Mật khẩu đã được đặt lại thành công' });
  } catch (err) {
    console.error("Error in reset-password endpoint:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = uri;