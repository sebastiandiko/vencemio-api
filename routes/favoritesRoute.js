const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoritesController');

// Ruta para agregar un producto a favoritos
router.post('/add', addFavorite);

// Ruta para eliminar un producto de favoritos
router.post('/remove', removeFavorite);

// Ruta para obtener todos los productos favoritos de un usuario
router.get('/:userUid', getFavorites);

module.exports = router;
