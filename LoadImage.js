const ClientModel = require("./Model/ClientModel"); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Image');
    },
    filename: async function (req, file, cb) {
    const { hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau } = req.body
    const ClientCount = await ClientModel.countDocuments()+1 
    const NewClient = new ClientModel({
      hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau, maKhachHang: "KH" + (ClientCount < 10 ? "00" + ClientCount : ClientCount < 100 ? "0" + ClientCount : ClientCount)
    })
    const extentiponPath = path.extname(file.originalname).slice(1);
    NewClient.hinhAnh = NewClient.maKhachHang + NewClient._id
    NewClient.LoaiAnh = extentiponPath
    req.NewClient = NewClient
    await NewClient.save()  
    cb(null, NewClient.hinhAnh + "." + extentiponPath);
    }
});
  const Upload = multer({ storage: storage });

module.exports = Upload