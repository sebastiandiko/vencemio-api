const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/ventasController'); // Importa el controlador actualizado

// Ruta para crear una nueva orden de compra
router.post('/', createOrder);

module.exports = router;
