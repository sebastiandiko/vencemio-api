const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas existentes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/register', userController.registerUser);

// Nuevas rutas para manejar preferencias
router.get('/:id/preferences', userController.getUserPreferences); // Obtener preferencias
router.put('/:id/preferences', userController.updateUserPreferences); // Actualizar preferencias
router.get('/preferences/:uid', userController.getUserPreferencesByUid); // Obtener preferencias por uid

module.exports = router;
