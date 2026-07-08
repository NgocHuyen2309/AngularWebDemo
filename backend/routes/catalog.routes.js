const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');

router.get('/', catalogController.getCatalog);

module.exports = router;
