import multer from "multer";
import fs from 'fs';
import path from 'path';
//check if profile folder exists. (storage logic)

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const dir = 'profiles';
     if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
     }
     cb(null, dir)
    },
    filename: function(req, file, cb){
     cb(null, Date.now() + path.extname(file.originalname))
    }
});

//check which type of file you want to accept
const fileFilter = function(req, file, cb) {

    const allowed = ["image/png",  'image/jpeg', "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else{
      cb(new Error("Only png, jpeg or webp images are allowed"));
    }
};

const upload = multer({storage, fileFilter});

export default upload;