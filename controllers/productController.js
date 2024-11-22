const { admin, db } = require('../utils/firebase');

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

// Agregar un nuevo producto
exports.addProduct = async (req, res) => {
  try {
    // Obtener los datos del producto desde el body de la solicitud
    const {
      nombre,
      precio,
      cod_super,
      cod_tipo,
      codigo_barra,
      fecha_vencimiento,
      stock,
      imagen = '', // Campo opcional (por defecto vacío)
      porcentaje_descuento = 0, // Campo opcional (por defecto 0)
      estado = true // Por defecto, el producto está activo
    } = req.body;

    // Validaciones
    if (!nombre || !precio || !cod_super || !cod_tipo || !codigo_barra || !fecha_vencimiento || !stock) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben estar completos.' });
    }

    if (typeof precio !== 'number' || precio <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0.' });
    }

    if (typeof stock !== 'number' || stock <= 0) {
      return res.status(400).json({ message: 'El stock debe ser un número mayor a 0.' });
    }

    if (typeof porcentaje_descuento !== 'number' || porcentaje_descuento < 0 || porcentaje_descuento > 100) {
      return res.status(400).json({ message: 'El porcentaje de descuento debe ser un número entre 0 y 100.' });
    }

    const fechaActual = new Date();
    const fechaVencimiento = new Date(fecha_vencimiento);
    if (isNaN(fechaVencimiento)) {
      return res.status(400).json({ message: 'La fecha de vencimiento debe ser válida.' });
    }
    if (fechaVencimiento <= fechaActual) {
      return res.status(400).json({ message: 'La fecha de vencimiento debe ser una fecha futura.' });
    }

    // Calcular el precio con descuento
    const precio_descuento = (precio * (100 - porcentaje_descuento)) / 100;

    // Crear el producto en Firestore
    const newProduct = {
      nombre,
      precio,
      cod_super,
      cod_tipo,
      codigo_barra,
      fecha_vencimiento,
      stock,
      imagen,
      porcentaje_descuento,
      precio_descuento,
      estado,
      creadoEn: new Date().toISOString() // Fecha de creación
    };

    // Agregar a la colección 'producto'
    const docRef = await db.collection('producto').add(newProduct);

    // Responder con éxito
    res.status(201).json({ message: 'Producto agregado exitosamente.', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto: ' + error.message });
  }
};

exports.getProductsBySuperAndCategory = async (req, res) => {
  try {
    const { codSuper, codTipo } = req.params;

    // Validar parámetros
    if (!codSuper || !codTipo) {
      return res.status(400).json({ message: 'Los parámetros codSuper y codTipo son requeridos.' });
    }

    // Verificar si el supermercado existe
    const superUserSnapshot = await db.collection('superuser')
      .where('cod_super', '==', codSuper)
      .get();

    if (superUserSnapshot.empty) {
      return res.status(404).json({ message: 'Superusuario no encontrado.' });
    }

    // Verificar si la categoría existe
    const categorySnapshot = await db.collection('tipo_producto')
      .where('nombre', '==', codTipo)
      .get();

    if (categorySnapshot.empty) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    // Buscar productos que coincidan con el supermercado y la categoría
    const productsSnapshot = await db.collection('producto')
      .where('cod_super', '==', codSuper)
      .where('cod_tipo', '==', codTipo)
      .get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos para este supermercado y categoría.' });
    }

    // Mapear los productos encontrados
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar productos: ' + error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  try {
    // Validar el formato de fecha
    if (productData.fecha_vencimiento) {
      productData.fecha_vencimiento = new Date(productData.fecha_vencimiento);
      if (isNaN(productData.fecha_vencimiento)) {
        return res.status(400).json({ message: 'Fecha de vencimiento inválida.' });
      }
    }

    await db.collection('producto').doc(id).update(productData);

    res.status(200).json({ message: 'Producto actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

