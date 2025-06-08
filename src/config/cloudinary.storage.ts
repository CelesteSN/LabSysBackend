// import cloudinary from './cloudinary.config'; // ⬅️ usa tu archivo que tiene dotenv.config() + cloudinary.config()
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import multer from 'multer';

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async () => ({
//     folder: 'labsys_uploads',
//     resource_type: 'raw' // 👈 obligatorio para PDF, Word, Excel, etc.
//   })
// });

// const cloudinaryUpload = multer({ storage });

// export default cloudinaryUpload;

// cloudinary.storage.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';
import multer from 'multer';
import path from 'path';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const parsed = path.parse(file.originalname);

    // 🔍 Log para debug
    console.log('Upload params:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      name: parsed.name,
      ext: parsed.ext,
      format: parsed.ext.replace('.', '')
    });

    return {
      folder: 'labsys_uploads',
      resource_type: 'raw',
      public_id: parsed.name,
      format: parsed.ext.replace('.', ''),
      use_filename: true,
      overwrite: true
    };
  }
});

const cloudinaryUpload = multer({ storage });
export default cloudinaryUpload;
