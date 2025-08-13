"use client"
import {Upload} from "lucide-react";

export default function FileUploadComp(){

    const handlefileUploadButton=()=>{
        const el = document.createElement("input");
        el.setAttribute("type", "file");
        el.setAttribute("accept", "application/pdf");
        el.addEventListener("change",(ev)=>{
            if(el.files && el.files.length>0){
                const file = el.files.item(0);
            }
        });
        el.click();
    }
    return(
        <div className="bg-slate-900 text-white shadow-2xl flex justify-center content-center items-center p-4 rounded-lg">
            <div onClick={handlefileUploadButton} className=" flex justify-center h-[20vw] items-center flex-col " >
            <h3>Upload Your PDF file </h3>
            </div>
            
            <Upload />
        </div>
    )

}