const multer = require('multer');
const path = require('path');
const fs = require('fs');

const magicBytes = {
  '.pdf': [[0x25, 0x50, 0x44, 0x46]],
  '.jpg': [[0xFF, 0xD8, 0xFF]],
  '.jpeg': [[0xFF, 0xD8, 0xFF]],
  '.png': [[0x89, 0x50, 0x4E, 0x47]],
};

function validateMagicBytes(filePath, ext) {
  const signatures = magicBytes[ext];
  if (!signatures) return false;
  const buffer = Buffer.alloc(8);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PDF, JPG, JPEG, dan PNG yang diizinkan.'), false);
  }
};

const upload = multer({
  storage: {
    ...storage,
    _handleFile: (req, file, cb) => {
      storage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.pdf', '.jpg', '.jpeg', '.png'].includes(ext) && !validateMagicBytes(info.path, ext)) {
          fs.unlinkSync(info.path);
          return cb(new Error('File tidak valid: format tidak sesuai dengan ekstensi.'));
        }
        cb(null, info);
      });
    }
  },
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;

