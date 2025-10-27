const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryController');

router.post('/countries/refresh', controller.refresh);
router.get('/countries', controller.getAll);
router.get('/countries/image', controller.getImage);
router.get('/countries/:name', controller.getByName);
router.delete('/countries/:name', controller.deleteByName);
router.get('/status', controller.status);

module.exports = router;
