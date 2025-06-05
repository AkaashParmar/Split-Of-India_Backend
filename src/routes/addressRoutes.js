const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');

const { protect } = require('../middlewares/authMiddleware.js');


router.use(protect);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);
router.patch('/:addressId/set-default', setDefaultAddress);

module.exports = router;
