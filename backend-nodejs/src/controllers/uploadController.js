import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurabeauty/uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// @desc    Upload ảnh lên Cloudinary
// @route   POST /api/upload/image
export const uploadImage = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Vui lòng chọn ảnh để upload.');
  }

  res.json({
    success: true,
    message: 'Tải ảnh thành công.',
    data: {
      url: req.file.path,
    },
  });
};

export { upload };
