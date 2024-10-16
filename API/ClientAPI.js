const uri = require("express").Router();
const bcrypt = require("bcryptjs");
const verifier = require("email-verify");
const ClientModel = require("../Model/ClientModel");
const path = require("path");
const SaveImage = require("../LoadImage");
const nodemailer = require("nodemailer");

uri.post("/SignUp", async (req, res) => {
  const { hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau, loaiAnh } =
    req.body;
  verifier.verify(email, async (err, info) => {
    if (err || !info.success) {
      return res.json({ Status: "Not Found" });
    }
    const ExistsAccount = await ClientModel.findOne({ email: email });
    if (ExistsAccount) {
      return res.json({ Status: "False" });
    }
    const ClientCount = (await ClientModel.countDocuments()) + 1;
    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const NewClient = new ClientModel({
      hoVaTen,
      gioiTinh,
      ngaySinh,
      diaChi,
      email,
      matKhau: hashedPassword,
      maKhachHang:
        "KH" +
        (ClientCount < 10
          ? "00" + ClientCount
          : ClientCount < 100
          ? "0" + ClientCount
          : ClientCount),
      loaiAnh,
    });
    NewClient.hinhAnh = NewClient.maKhachHang + NewClient._id;
    await NewClient.save();
    res.json({
      ID: NewClient._id,
      hinhAnh: NewClient.hinhAnh,
      loaiAnh: NewClient.loaiAnh,
    });
  });
});

uri.post("/SaveImage", async (req, res) => {
  if(SaveImage(req)){
    return res.json({Status: "Success", ID: req.body.ID})
  }
});

uri.post("/GetInfor", async (req, res) => {
  const user = await ClientModel.findById(req.body.ID);
  if (!user) {
    return res.json({ Status: "False" });
  }
  res.json({
    user,
    hinhAnh: "/Image/" + user.hinhAnh + "." + user.loaiAnh,
  });
});

// Đăng nhập
uri.post("/SignIn", async (req, res) => {
  const { email, matKhau } = req.body;
  const user = await ClientModel.findOne({ email: email });
  if (!user) {
    return res.json({ Status: "Not Found" });
  } else {
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) {
      return res.json({ Status: "False" });
    } else {
      return res.json({ ID: user._id });
    }
  }
});

uri.post("/SendCode", async (req, res) => {
  const user = await ClientModel.findOne({ email: req.body.Email });
  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });

    const mailOptions = {
      to: user.email,
      from: "1050080070@sv.hcmunre.edu.vn",
      subject: "Đặt lại mật khẩu",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f7f7f7;">
        <h3 style="color: #4CAF50;">Xin chào,</h3>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã xác nhận của bạn là:</p>
        <h2 style="color: #4CAF50; font-size: 24px; margin: 20px 0;">${code}</h2>
        <p>Vui lòng nhập mã này để hoàn tất quá trình đặt lại mật khẩu. Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.</p>
        <p style="margin-top: 30px;">Trân trọng,<br>ViToPu - Luôn sẵn sàng hỗ trợ bạn!</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ Status: "Success", Code: code });
  } else {
    res.json({ Status: "Not Found" });
  }
});

uri.post("/ChangePass", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.NewPass, 10);
  const user = await ClientModel.findOne({ email: req.body.Email });
  await ClientModel.findByIdAndUpdate(user._id, {
    $set: { matKhau: hashedPassword },
  });
  res.json({
    ID: user._id,
  });
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
        user: "1050080070@sv.hcmunre.edu.vn",
        pass: "cgzj dcgv wvry qjwf",
      }
    });

    const mailOptions = {
      to: client.email,
      from: '1050080070@sv.hcmunre.edu.vn',
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
