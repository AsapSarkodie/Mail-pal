import multer from "multer";
import fs from 'fs';
import path from "path";


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'documents';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
        cb(null, dir)
    },
    filename: function(req, file, cb){
         cb(null, Date.now() + path.extname(file.originalname))
        }
});

const fileFilter = function(req, file, cb) {

    const allowed = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        // .xlsx
  "application/vnd.ms-excel",
  "image/png",
  'image/jpeg', "image/webp"                                                 // .xls
];
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else{
        console.log(`file type is not allowed`);
        
       cb(new Error("ile type is not allowed"));
    }
};


const upload = multer({storage, fileFilter});

export default upload;
