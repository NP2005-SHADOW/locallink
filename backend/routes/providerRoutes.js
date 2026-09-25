const express = require('express');
const router = express.Router();
const { searchProviders } = require('../controllers/providerController');

// GET /api/providers/search?category=Household&service=Electrician
router.get('/search', searchProviders);

module.exports = router;
