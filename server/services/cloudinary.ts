import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
export const hasCloudinary = () => {
  return !!(
    process.env.VITE_CLOUDINARY_CLOUD_NAME && 
    process.env.VITE_CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
};
