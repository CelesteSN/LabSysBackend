// import multer from "multer";
// import path from "path";
// import { ENV } from "../config/env";

// // Para desarrollo local
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, ENV.UPLOADS_PATH);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // Validar tipo de archivo (ejemplo: imágenes y PDFs)
// const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
//   const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Tipo de archivo no permitido"));
//   }
// };

// export const upload = multer({ storage, fileFilter });
