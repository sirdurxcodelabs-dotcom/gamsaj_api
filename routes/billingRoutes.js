const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAll, getOne, create, update, remove, convert, markPaid, sendEmail, addPayment,
} = require('../controllers/billingController');

router.use(protect);

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/convert', convert);
router.post('/:id/mark-paid', markPaid);
router.post('/:id/send-email', sendEmail);
router.post('/:id/add-payment', addPayment);

module.exports = router;
