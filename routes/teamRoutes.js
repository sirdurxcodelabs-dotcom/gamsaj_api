const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAll, getOne, create, update, remove } = require('../controllers/teamController');

// Public
router.get('/', getAll);
router.get('/:id', getOne);

// Protected
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
