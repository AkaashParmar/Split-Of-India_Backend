const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary-config');

// import path from "path";
// import fs from "fs";

const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Saving file to:', tempDir);  
    cb(null, tempDir);
  },    
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    console.log('Generated file name:', sanitizedName);  
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'products', // Optional: name of the folder in Cloudinary
//     allowed_formats: ['jpg', 'jpeg', 'png'], // Optional: file types
//   },
// });

const upload = multer({ storage: storage })

// const upload = multer({ storage });

module.exports = upload;