const { admin, db } = require('../utils/firebase');


// Obtener todos los tipos de producto
exports.getAllTipoProducto = async (req, res) => {
  try {
    const tipoProductoSnapshot = await db.collection('tipo_producto').get();
    const tipoProductos = [];
    tipoProductoSnapshot.forEach(doc => {
      tipoProductos.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(tipoProductos);
  } catch (error) {
    res.status(500).send('Error al obtener los tipos de producto: ' + error.message);
  }
};

// Obtener un tipo de producto por ID
exports.getTipoProductoById = async (req, res) => {
  try {
    const doc = await db.collection('tipo_producto').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Tipo de producto no encontrado');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error al obtener el tipo de producto: ' + error.message);
  }
};
