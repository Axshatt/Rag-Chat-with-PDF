import express from "express";
import multer from "multer";
import cors from "cors"



const app = express();
app.use(cors())
const PORT = 8000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (res, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.round() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    },
})
const upload = multer({storage:storage})
app.post("/upload/pdf", upload.single("pdf"), (req, res) => {
    return res.json({ message: "uploaded" })

})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);

    }
    console.log(`Server Started on PORT :${PORT}`);

})