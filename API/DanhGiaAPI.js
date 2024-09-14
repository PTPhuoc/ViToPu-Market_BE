const uri = require("express").Router();
const DanhGiaModel = require("../Model/DanhGiaModel");

uri.get("/danhgialist", async (req, res) => {
    try {
        console.log("DanhGiaModel:", DanhGiaModel);
        const danhGiaList = await DanhGiaModel.find({});
        console.log("Dữ liệu đánh giá:", danhGiaList);
        res.json(danhGiaList);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = uri;