const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Ruta para agregar una nueva notificación
router.post('/add', notificationController.addNotification);

// Ruta para obtener todas las notificaciones de un supermercado específico
router.get('/bySuper/:codSuper', notificationController.getNotificationsBySuper);

// Ruta para eliminar una notificación por ID
router.delete('/delete/:id', notificationController.deleteNotification); // Nueva ruta para eliminar

module.exports = router;
