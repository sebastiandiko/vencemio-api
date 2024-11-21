const express = require('express');
const { superuserLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/login', superuserLogin);

module.exports = router;
