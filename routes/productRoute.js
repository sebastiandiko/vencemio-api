const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ruta para obtener todos los productos
router.get('/', productController.getAllProducts);

// Ruta para obtener un producto por ID
router.get('/:id', productController.getProductById);
router.get('/byCodSuper/:codSuper', productController.getProductsByCodSuper);
router.get('/byCategory/:categoryName', productController.getProductsByCategory);
router.post('/add', productController.addProduct);
router.get('/filter/:codSuper/:codTipo', productController.getProductsBySuperAndCategory);

module.exports = router;
