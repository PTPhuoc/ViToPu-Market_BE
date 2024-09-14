const uri = require('express').Router();
const SanPhamModel = require('../Model/SanPhamModel');

uri.get('/sanphamlist', async (req, res) => {
    try {
        console.log('SanPhamModel:', SanPhamModel);
        const sanPhamList = await SanPhamModel.find({});
        console.log('Dữ liệu sản phẩm:', sanPhamList);
        res.json(sanPhamList);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: err.message });
    }
});
uri.get("/timkiemsanpham", async (req, res) => {
    try {
        const tenSanPham = req.query.tenSanPham;
        console.log(req.query);
        const sanPhamList = await SanPhamModel.find({ tenSanPham: new RegExp(tenSanPham, 'i') });
        res.json(sanPhamList);
    }
    catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = uri;