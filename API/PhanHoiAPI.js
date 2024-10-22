const uri = require("express").Router();
const PhanHoiModel = require("../Model/PhanHoiModel");

uri.post("/GetFeedbackByComment", async (req, res) => {
    const feedback = await PhanHoiModel.find({maDanhGia: req.body.maDanhGia})
    if(feedback){
        res.send({Status: "Success", feedback: feedback})
    }else{
        res.json({Status: "Not Found"})
    }
})

uri.post("/Feedback", async (req, res) => {
    const { maDanhGia, maCuaHang, noiDung, ngayPhanHoi} = req.body;
    const newFeedback = new PhanHoiModel({
        maDanhGia: maDanhGia,
        maCuaHang: maCuaHang,
        noiDung: noiDung,
        ngayPhanHoi: ngayPhanHoi
    })
    await newFeedback.save();
    res.json({Status: "Success"})
})

uri.post("/UpdateFeedback", async (req, res) => {
    const { noiDung, maDanhGia, ngayPhanHoi } = req.body;
    const updateFeedback = await PhanHoiModel.findOne({ maDanhGia: maDanhGia})
    updateFeedback.noiDung = noiDung;
    updateFeedback.ngayPhanHoi = ngayPhanHoi;
    updateFeedback.save();
    res.json({Status: "Success"})
  })
  

module.exports = uri