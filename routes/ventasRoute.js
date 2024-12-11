const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/ventasController'); // Importa el controlador actualizado
const { getPurchaseHistory, getRecentPurchases } = require("../controllers/ventasController");

// Ruta para crear una nueva orden de compra
router.post('/', createOrder);
router.get("/history/:uid", getPurchaseHistory);
router.get("/recent/:uid", getRecentPurchases);

module.exports = router;
