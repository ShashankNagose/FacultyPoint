import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]);

export const uploadSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image, PDF, Word, PowerPoint, and ZIP files up to 5 MB are allowed.'));
  }
}).single('file');

export const buildAttachment = (file) => {
  if (!file) return null;

  return {
    filename: file.originalname,
    content_type: file.mimetype,
    size: file.size,
    data: file.buffer
  };
};

export const sendAttachment = (res, attachment) => {
  if (!attachment?.data) {
    res.status(404).json({ message: 'File not found.' });
    return;
  }

  res.setHeader('Content-Type', attachment.content_type || 'application/octet-stream');
  res.setHeader('Content-Length', attachment.size);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.filename)}"`);
  res.send(attachment.data);
};
