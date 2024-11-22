const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas específicas deben ir antes que las generales
router.get('/byCodSuper/:codSuper', productController.getProductsByCodSuper);
router.get('/byCategory/:categoryName', productController.getProductsByCategory);
router.get('/filter/:codSuper/:codTipo', productController.getProductsBySuperAndCategory);

// Ruta para obtener un producto por ID (más general)
router.get('/:id', productController.getProductById);

// Otras rutas
router.get('/', productController.getAllProducts);
router.post('/add', productController.addProduct);
router.put('/:id', productController.updateProduct);

module.exports = router;
