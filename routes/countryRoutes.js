const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryController');

// Country endpoints
router.post('/countries/refresh', controller.refresh);
router.get('/countries', controller.getAll);

// Image endpoint must be before :name
router.get('/countries/image', controller.getImage);

router.get('/countries/:name', controller.getByName);
router.delete('/countries/:name', controller.deleteByName);

// Status
router.get('/status', controller.status);

module.exports = router;
