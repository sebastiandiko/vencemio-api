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

exports.getProductsByCodSuper = async (req, res) => {
  try {
    const { codSuper } = req.params;

    // Verificar si el superuser con el cod_super dado existe
    const superUserSnapshot = await db.collection('superuser')
      .where('cod_super', '==', codSuper)
      .get();

    if (superUserSnapshot.empty) {
      return res.status(404).json({ message: 'Superusuario no encontrado' });
    }

    // Buscar productos cuyo cod_super coincida con el codSuper proporcionado
    const productsSnapshot = await db.collection('producto')
      .where('cod_super', '==', codSuper)
      .get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos para este superusuario' });
    }

    // Mapear los productos encontrados
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos: ' + error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // Buscar el documento de tipo_producto que coincide con el nombre proporcionado
    const categorySnapshot = await db.collection('tipo_producto')
      .where('nombre', '==', categoryName)
      .get();

    if (categorySnapshot.empty) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Obtener el nombre de la categoría
    const categoryData = categorySnapshot.docs[0].data().nombre;

    // Buscar productos cuyo cod_tipo coincide con el nombre de la categoría
    const productsSnapshot = await db.collection('producto')
      .where('cod_tipo', '==', categoryData)
      .get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos para esta categoría' });
    }

    // Mapear los productos encontrados
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos: ' + error.message });
  }
};
