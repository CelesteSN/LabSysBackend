import dotenv from 'dotenv';
dotenv.config(); // ¡Este es el paso clave!

import { v2 as cloudinary } from 'cloudinary';

console.log("🧪 Cloudinary ENV:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "❌ MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "❌ MISSING"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
