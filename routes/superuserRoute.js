const express = require('express');
const router = express.Router();
const superuserController = require('../controllers/superuserController');

// Ruta para obtener todos los superusuarios
router.get('/', superuserController.getAllSuperusers);

// Ruta para obtener un superusuario por ID
router.get('/:id', superuserController.getSuperuserById);
router.get('/locations', superuserController.getSuperuserLocations);

router.post('/register', superuserController.registerSuper);

module.exports = router;
