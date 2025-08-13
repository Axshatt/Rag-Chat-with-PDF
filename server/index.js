import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" })
const app = express();
const PORT = 8000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename:function (res,file,cb){
        const uniqueSuffix = Date.now()+"-"+Math.round(Math.round()*1e9);
        cb(null,`${uniqueSuffix}-${file.originalname}`)
    },
})

app.post("/upload/pdf", upload.single("pdf"), (req, res) => {
    return res.json({ message: "uploaded" })

})

app.listen(PORT, (err) => {
    console.log(`Server Started on PORT :${PORT}`);

})