const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, uploadAvatar, uploadSignature } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle: multerSingle, uploadMultiple: multerMultiple } = require('../config/cloudinary');

router.use(protect);

router.post('/single', multerSingle.single('file'), uploadSingle);
router.post('/multiple', multerMultiple.array('files', 10), uploadMultiple);
router.post('/avatar', multerSingle.single('avatar'), uploadAvatar);
router.post('/signature', multerSingle.single('signature'), uploadSignature);

module.exports = router;
