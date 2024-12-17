const express = require('express');
const router = express.Router();
const {
  createOrder,
  getPurchaseHistory,
  getRecentPurchases,
  getAllSales, // Importa la nueva función
} = require("../controllers/ventasController");

// Ruta para crear una nueva orden de compra
router.post('/', createOrder);
router.get("/history/:uid", getPurchaseHistory);
router.get("/recent/:uid", getRecentPurchases);

// Nueva ruta para obtener todas las ventas
router.get("/all", getAllSales);

module.exports = router;
