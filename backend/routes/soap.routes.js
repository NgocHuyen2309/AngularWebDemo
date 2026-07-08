const express = require('express');
const router = express.Router();
const soapController = require('../controllers/soap.controller');

router.post('/info', soapController.handleSoapRequest);

module.exports = router;
