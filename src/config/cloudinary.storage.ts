import cloudinary from './cloudinary.config'; // ⬅️ usa tu archivo que tiene dotenv.config() + cloudinary.config()
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'labsys_uploads',
    resource_type: 'raw' // 👈 obligatorio para PDF, Word, Excel, etc.
  })
});

const cloudinaryUpload = multer({ storage });

export default cloudinaryUpload;
