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
    const {
      nombre,
      precio,
      cod_super,
      cod_tipo,
      codigo_barra,
      fecha_vencimiento,
      stock,
      imagen = '',
      porcentaje_descuento = 0,
      estado = true,
      fecha_aviso_vencimiento
    } = req.body;

    // Validaciones
    if (!nombre || !precio || !cod_super || !cod_tipo || !codigo_barra || !fecha_vencimiento || !stock || !fecha_aviso_vencimiento) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben estar completos.' });
    }

    // Validación de precio y stock
    if (typeof precio !== 'number' || precio <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0.' });
    }

    if (typeof stock !== 'number' || stock <= 0) {
      return res.status(400).json({ message: 'El stock debe ser un número mayor a 0.' });
    }

    const fechaVencimiento = new Date(fecha_vencimiento);
    if (isNaN(fechaVencimiento)) {
      return res.status(400).json({ message: 'La fecha de vencimiento debe ser válida.' });
    }
    const fechaActual = new Date();
    if (fechaVencimiento <= fechaActual) {
      return res.status(400).json({ message: 'La fecha de vencimiento debe ser una fecha futura.' });
    }

    // Calcular la fecha de aviso de vencimiento (restar los días de anticipación)
    const fechaAviso = new Date(fechaVencimiento);
    fechaAviso.setDate(fechaAviso.getDate() - fecha_aviso_vencimiento); // Restamos los días de anticipación

    // Calcular el precio con descuento
    const precio_descuento = (precio * (100 - porcentaje_descuento)) / 100;

    // Crear el producto
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
      fecha_aviso_vencimiento: parseInt(fecha_aviso_vencimiento), // Guardamos los días de anticipación
      fecha_avisado: fechaAviso.toISOString(), // Guardamos la fecha de aviso en formato ISO
      creadoEn: new Date().toISOString() // Fecha de creación
    };

    // Agregar el producto a la base de datos
    const docRef = await db.collection('producto').add(newProduct);

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
    // Validar formato de fecha si es necesario
    if (productData.fecha_vencimiento) {
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
      if (!regexFecha.test(productData.fecha_vencimiento)) {
        return res.status(400).json({ message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD.' });
      }

      // Calcular la nueva fecha de aviso si es necesario
      if (productData.fecha_aviso_vencimiento) {
        const fechaVencimiento = new Date(productData.fecha_vencimiento);
        const fechaAviso = new Date(fechaVencimiento);
        fechaAviso.setDate(fechaAviso.getDate() - productData.fecha_aviso_vencimiento); // Restamos los días de anticipación

        productData.fecha_avisado = fechaAviso.toISOString(); // Actualizamos la fecha de aviso
      }
    }

    // Actualizar el documento del producto
    await db.collection('producto').doc(id).update(productData);

    res.status(200).json({ message: 'Producto actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};



exports.getProductsByAlert = async (req, res) => {
  try {
    const currentDate = new Date().toISOString(); // Obtener la fecha actual

    // Buscar productos cuya fecha de aviso de vencimiento sea menor o igual a la fecha actual
    const productsSnapshot = await db.collection('producto')
      .where('fecha_avisado', '<=', currentDate) // Filtra productos cuyo aviso de vencimiento sea en el pasado o en el día actual
      .get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos para enviar alertas.' });
    }

    // Mapear los productos encontrados
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos para alertas: ' + error.message });
  }
};

// Función para eliminar producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params; // Obtener el id del producto desde los parámetros

  try {
    // Verificar si el producto existe
    const productRef = db.collection('producto').doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar el producto de la base de datos
    await productRef.delete();

    // Responder con éxito
    res.status(200).json({ message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ message: 'Error al eliminar el producto.' });
  }
};

