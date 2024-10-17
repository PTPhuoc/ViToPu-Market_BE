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
  const file = req.files.DataImage;
  const newFilename = `${req.body.hinhAnh}.${req.body.loaiAnh}`;
  try {
    await SaveImage(file, newFilename);
    res.json({ Status: "Success", ID: req.body.ID });
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ Status: "Error", message: "Failed to save image" });
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


module.exports = uri;