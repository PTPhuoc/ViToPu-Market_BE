const multer = require("multer");
const path = require('path');

const SaveImage = (req) => {
  const file = req.files.DataImage;
  const newFilename = `${req.body.hinhAnh}.${req.body.loaiAnh}`;
  const newPath = path.join(__dirname, 'Image', newFilename);
  file.mv(newPath, (err) => {
    if (err) {
      return false
    }
    return true
  });
}

module.exports = SaveImage;

