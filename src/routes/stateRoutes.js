const express = require('express');
const {
  createState,
  getStatesByRegion,
  getStateBySlug,
} = require('../controllers/stateController');

const router = express.Router();

router.post('/', createState);
router.get('/region/:regionId', getStatesByRegion);
router.get('/slug/:slug', getStateBySlug); // ✅ New route to get by slug

module.exports = router;
