const path = require('path');

const SaveImage = (file, name) => {
  const newPath = path.join(__dirname, 'Image', name);
  return new Promise((resolve, reject) => {
    file.mv(newPath, (err) => {
      if (err) {
        reject(err);  // Báo lỗi nếu có lỗi
      } else {
        resolve(true);  // Trả về true nếu thành công
      }
    });
  });
}

module.exports = SaveImage;

