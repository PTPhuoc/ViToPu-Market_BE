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

module.exports = uri