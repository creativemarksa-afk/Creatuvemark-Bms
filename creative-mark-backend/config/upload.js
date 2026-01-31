import multer from 'multer';
import cloudinary from './cloudinary.js'; // Import the configured instance
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Log Cloudinary configuration for debugging
console.log('Cloudinary config in upload.js:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'creative-mark-applications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    resource_type: 'auto',
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Uploading file to Cloudinary:', file.fieldname, file.originalname, file.mimetype);
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error('Invalid file type rejected:', file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  console.error('Upload error details:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    http_code: error.http_code,
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
      });
    }
  }

  // Handle Cloudinary errors
  if (error.message && error.message.includes('Must supply api_key')) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. Please contact support.',
    });
  }
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error.http_code) {
    return res.status(400).json({
      success: false,
      message: `File upload failed: ${error.message}`,
    });
  }

  next(error);
};

export default upload;