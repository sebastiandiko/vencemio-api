const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importar el controlador

// Ruta para manejar el inicio de sesión
router.post('/login', authController.login);
// Ruta para login de supers
router.post('/login-super', authController.loginSuper);

module.exports = router;
