const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

mongoose.connect("mongodb+srv://tanphuocphan370:12345@e-commerce.nsbpm.mongodb.net/?retryWrites=true&w=majority&appName=E-commerce");

app.use(express.json());
app.use(cors())

const db = mongoose.connection;
db.once('open', () => {
    console.log('Kết nối MongoDB thành công');
});

app.listen(9000, () => {
  console.log("Server is running!");
});