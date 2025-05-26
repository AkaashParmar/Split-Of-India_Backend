const express = require('express');
const { createState, getStatesByRegion } = require('../controllers/stateController');
const router = express.Router();

router.post('/', createState);
router.get('/region/:regionId', getStatesByRegion);

module.exports = router;
