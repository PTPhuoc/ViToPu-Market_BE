const uri = require("express").Router();
const ThongBaoModel = require("../Model/ThongBaoModel");
const CuaHangModel = require("../Model/CuaHangModel");

const CreateNontificate = async (maSanPham, noiDung, trangThai, Den) => {
  const newNontifi = new ThongBaoModel({
    maSanPham: maSanPham,
    noiDung: noiDung,
    trangThai: trangThai,
    Den: Den,
  });
  await newNontifi.save();
};

uri.post("/ChangeState", async (req, res) => {
  const { id, trangThai } = req.body;
  const currentNotifi = await ThongBaoModel.findById(id);
  currentNotifi.trangThai = trangThai;
  await currentNotifi.save();
  res.json({ Status: "Success" });
});

uri.post("/GetNotification", async (req, res) => {
  const { id } = req.body;
  const hasShop = await CuaHangModel.findOne({ maKhachHang: id });
  if (hasShop) {
    const notificationClient = await ThongBaoModel.find({ Den: id });
    const notificationShop = await ThongBaoModel.find({ Den: hasShop._id });
    if (notificationClient) {
      if (notificationShop) {
        const combinedNotifications = [
          ...notificationClient,
          ...notificationShop,
        ];
        return res.json({
          Status: "Success",
          notification: combinedNotifications,
        });
      }
      return res.json({ Status: "Success", notification: notificationClient });
    } else {
      return res.json({ Status: "Not Found" });
    }
  } else {
    const notificationClient = await ThongBaoModel.find({ Den: id });
    if (notificationClient) {
      return res.json({ Status: "Success", notification: notificationClient });
    } else {
      return res.json({ Status: "Not Found" });
    }
  }
});

module.exports = { uri, CreateNontificate };
