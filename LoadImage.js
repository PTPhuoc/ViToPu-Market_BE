const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Image'); // Thư mục lưu file
    },
    filename: function (req, file, cb) {
      const NameFile = req.body.NameFile; // Tùy chỉnh tên file nếu cần
      const ext = path.extname(file.originalname); // Lấy phần mở rộng của file
      cb(null, NameFile + ext); // Truyền tên file mới vào callback
    }
  });
  
  const Upload = multer({ storage: storage });

module.exports = Upload