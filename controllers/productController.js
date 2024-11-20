const admin = require('firebase-admin');
const db = admin.firestore();

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const productsSnapshot = await db.collection('producto').get();
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send('Error al obtener productos: ' + error.message);
  }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
  try {
    const doc = await db.collection('producto').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Producto no encontrado');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error al obtener el producto: ' + error.message);
  }
};
