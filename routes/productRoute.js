const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas para obtener productos según el supermercado y la categoría
router.get('/byCodSuper/:codSuper', productController.getProductsByCodSuper);
router.get('/byCategory/:categoryName', productController.getProductsByCategory);
router.get('/filter/:codSuper/:codTipo', productController.getProductsBySuperAndCategory);
router.delete('/:id', productController.deleteProduct); // Ruta para eliminar un producto por ID

// Ruta para obtener un producto por ID
router.get('/:id', productController.getProductById);

// Ruta para obtener todos los productos
router.get('/', productController.getAllProducts);

// Ruta para agregar un nuevo producto (con el campo de fecha de aviso)
router.post('/add', productController.addProduct);

// Ruta para actualizar un producto (con la fecha de aviso)
router.put('/:id', productController.updateProduct);

// Ruta para obtener los productos cuya fecha de aviso de vencimiento ha llegado o está cerca
router.get('/alertas', productController.getProductsByAlert);

module.exports = router;
