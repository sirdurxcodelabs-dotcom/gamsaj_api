const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, uploadAvatar } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle: multerSingle, uploadMultiple: multerMultiple } = require('../config/cloudinary');

router.use(protect);

router.post('/single', multerSingle.single('file'), uploadSingle);
router.post('/multiple', multerMultiple.array('files', 10), uploadMultiple);
router.post('/avatar', multerSingle.single('avatar'), uploadAvatar);

module.exports = router;
