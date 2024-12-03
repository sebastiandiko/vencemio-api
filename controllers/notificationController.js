const { db } = require('../utils/firebase'); // Utilizamos la base de datos de Firebase

// Crear una notificación
exports.addNotification = async (req, res) => {
  try {
    const {
      nombre_producto,
      id_producto,
      titulo,
      descripcion,
      dias,
      hora,
      cod_super,
    } = req.body;

    // Validar los datos
    if (!nombre_producto || !titulo || !descripcion || !dias || !hora || !cod_super || !id_producto) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Crear la notificación
    const newNotification = {
      nombre_producto,
      id_producto,
      titulo,
      descripcion,
      dias,
      hora,
      cod_super,
      creadoEn: new Date().toISOString(), // Fecha y hora de creación
    };

    // Agregar la notificación a la colección "notificaciones" en Firebase
    const docRef = await db.collection('notificaciones').add(newNotification);

    res.status(201).json({ message: 'Notificación creada exitosamente.', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la notificación: ' + error.message });
  }
};

// Obtener todas las notificaciones para un supermercado específico
exports.getNotificationsBySuper = async (req, res) => {
  try {
    const { codSuper } = req.params;

    // Verificar si el supermercado con cod_super dado existe
    const superUserSnapshot = await db.collection('superuser')
      .where('cod_super', '==', codSuper)
      .get();

    if (superUserSnapshot.empty) {
      return res.status(404).json({ message: 'Superusuario no encontrado' });
    }

    // Obtener todas las notificaciones para el supermercado especificado
    const notificationsSnapshot = await db.collection('notificaciones')
      .where('cod_super', '==', codSuper)
      .get();

    if (notificationsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron notificaciones para este supermercado' });
    }

    // Mapear las notificaciones encontradas
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notificaciones: ' + error.message });
  }
};

// Eliminar una notificación por su ID
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el id de la notificación desde la URL

    // Verificar si la notificación existe
    const notificationRef = db.collection('notificaciones').doc(id);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Eliminar la notificación de la base de datos
    await notificationRef.delete();

    res.status(200).json({ message: 'Notificación eliminada exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la notificación: ' + error.message });
  }
};
