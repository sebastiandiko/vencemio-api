const { admin, db } = require('../utils/firebase');


// Obtener todos los superusuarios
exports.getAllSuperusers = async (req, res) => {
  try {
    const superusersSnapshot = await db.collection('superuser').get();
    const superusers = [];
    superusersSnapshot.forEach(doc => {
      superusers.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(superusers);
  } catch (error) {
    res.status(500).send('Error al obtener los superusuarios: ' + error.message);
  }
};

// Obtener un superusuario por su ID
exports.getSuperuserById = async (req, res) => {
  try {
    const doc = await db.collection('superuser').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Superusuario no encontrado');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error al obtener el superusuario: ' + error.message);
  }
};
