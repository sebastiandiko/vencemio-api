const { db } = require('../utils/firebase'); // Importa la configuración de Firebase

// Función para crear una orden de compra
exports.createOrder = async (req, res) => {
  const { cantidad, producto_id, user_id, forma_pago } = req.body;

  try {
    // Validar los datos recibidos
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }
    if (!producto_id) {
      return res.status(400).json({ message: 'El ID del producto es obligatorio' });
    }
    if (!user_id) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }
    if (!forma_pago) {
      return res.status(400).json({ message: 'La forma de pago es obligatoria' });
    }

    // Obtener los detalles del producto desde Firestore
    const productRef = db.collection('producto').doc(producto_id);
    const productSnapshot = await productRef.get();

    if (!productSnapshot.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const productData = productSnapshot.data();

    // Verificar el stock disponible
    if (productData.stock < cantidad) {
      return res.status(400).json({
        message: `Stock insuficiente para el producto ${productData.nombre}`,
      });
    }

    // Calcular los precios y el total
    const precio_unitario = productData.precio;
    const precio_descuento =
      productData.precio_descuento || precio_unitario; // Si no hay descuento, usar el precio original
    const total = precio_descuento * cantidad;

    // Crear los datos de la orden
    const orderData = {
      cantidad,
      producto_id,
      cod_super: productData.cod_super, // Guardar cod_super
      cod_tipo: productData.cod_tipo, // Guardar cod_tipo
      user_id,
      forma_pago,
      descuento_aplicado: productData.porcentaje_descuento || 'No aplica', // Guardar el porcentaje de descuento
      fecha: new Date().toISOString(), // Fecha actual
      precio_unitario,
      precio_descuento,
      total,
    };

    // Iniciar una transacción para guardar la orden y actualizar el stock
    await db.runTransaction(async (transaction) => {
      // Crear la orden de compra en la colección "ventas"
      const orderRef = db.collection('ventas').doc(); // Generar un ID único para la orden
      transaction.set(orderRef, orderData);

      // Actualizar el stock del producto
      transaction.update(productRef, {
        stock: productData.stock - cantidad,
      });
    });

    res.status(201).json({
      message: 'Orden de compra creada exitosamente',
      order: orderData,
    });
  } catch (error) {
    console.error('Error al crear la orden de compra:', error);
    res
      .status(500)
      .json({ message: 'Error al crear la orden de compra', error: error.message });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
    const { uid } = req.params; // Obtener el UID del usuario de los parámetros
    const snapshot = await db
      .collection("ventas")
      .where("user_id", "==", uid) // Filtrar por UID
      .orderBy("fecha", "desc") // Ordenar por fecha descendente
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No se encontraron compras para este usuario." });
    }

    const purchases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error al obtener el historial de compras:", error);
    res.status(500).json({ message: "Error al obtener el historial de compras.", error: error.message });
  }
};

exports.getRecentPurchases = async (req, res) => {
  try {
    const { uid } = req.params; // Obtener el UID del usuario
    const snapshot = await db
      .collection("ventas")
      .where("user_id", "==", uid) // Filtrar por UID
      .orderBy("fecha", "desc") // Ordenar por fecha descendente
      .limit(3) // Limitar a las últimas 3 compras
      .get();

    const purchases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error al obtener las compras recientes:", error);
    res.status(500).json({ message: "Error al obtener las compras recientes.", error: error.message });
  }
};
