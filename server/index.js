import express from "express";

const app = express();
const PORT = 8000

app.get("/",(req,res)=>{


})

app.listen(PORT, (err)=>{
    console.log(`Server Started on PORT :${PORT}`);
    
})