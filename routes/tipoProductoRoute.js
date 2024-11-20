const express = require('express');
const router = express.Router();
const tipoProductoController = require('../controllers/tipoProductoController');

// Ruta para obtener todos los tipos de producto
router.get('/', tipoProductoController.getAllTipoProducto);

// Ruta para obtener un tipo de producto por ID
router.get('/:id', tipoProductoController.getTipoProductoById);

module.exports = router;
