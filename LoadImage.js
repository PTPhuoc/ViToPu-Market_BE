const ClientModel = require("./Model/ClientModel"); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Image');
    },
    filename: async function (req, file, cb) {
      const { maKhachHang, hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau } = req.body;
      const extentiponPath = path.extname(file.originalname);
      const NewClient = new ClientModel({
        maKhachHang, hoVaTen, gioiTinh, ngaySinh, diaChi, email, matKhau
      })

      NewClient.hinhAnh = NewClient.maKhachHang + NewClient._id
      NewClient.LoaiAnh = extentiponPath

      await NewClient.save()

      cb(null, NewClient.hinhAnh + "." + extentiponPath)
    }
  });
  
  const Upload = multer({ storage: storage });

module.exports = Upload