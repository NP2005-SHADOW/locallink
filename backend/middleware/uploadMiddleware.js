const multer = require('multer');
const path = require('path');

// Configure how and where files are stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to the uploads folder
  },
  filename: function (req, file, cb) {
    // Add a timestamp to the original name to ensure uniqueness
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

// Initialize multer with the storage config
const upload = multer({ storage: storage });

module.exports = upload;