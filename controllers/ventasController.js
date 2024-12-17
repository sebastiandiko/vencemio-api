const { db } = require('../utils/firebase'); // Importa la configuración de Firebase
// Función para generar un número de orden único
const generarNumeroOrden = async () => {
  let numeroOrden;
  let existeOrden = true;

  while (existeOrden) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    numeroOrden = `ORD-${randomNum}`;

    const snapshot = await db
      .collection("ventas")
      .where("numero_orden", "==", numeroOrden)
      .get();

    if (snapshot.empty) {
      existeOrden = false;
    }
  }
  return numeroOrden;
};

// Función para crear una orden de compra
exports.createOrder = async (req, res) => {
  const { cantidad, producto_id, user_id, forma_pago } = req.body;

  try {
    // Validaciones básicas
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }
    if (!producto_id || !user_id || !forma_pago) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // Obtener producto
    const productRef = db.collection("producto").doc(producto_id);
    const productSnapshot = await productRef.get();

    if (!productSnapshot.exists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const productData = productSnapshot.data();

    // Verificar stock
    if (productData.stock < cantidad) {
      return res.status(400).json({
        message: `Stock insuficiente para ${productData.nombre}`,
      });
    }

    // Generar número de orden único
    const numero_orden = await generarNumeroOrden();

    // Calcular precios
    const precio_unitario = productData.precio;
    const precio_descuento = productData.precio_descuento || precio_unitario;
    const total = precio_descuento * cantidad;

    // Crear datos de la orden
    const orderData = {
      numero_orden,
      cantidad,
      producto_id,
      cod_super: productData.cod_super,
      cod_tipo: productData.cod_tipo,
      user_id,
      forma_pago,
      fecha: new Date().toISOString(),
      precio_unitario,
      precio_descuento,
      total,
    };

    // Transacción para guardar la orden y actualizar stock
    await db.runTransaction(async (transaction) => {
      const orderRef = db.collection("ventas").doc();
      transaction.set(orderRef, orderData);
      transaction.update(productRef, { stock: productData.stock - cantidad });
    });

    res.status(201).json({
      message: "Orden creada exitosamente",
      numero_orden,
      order: orderData,
    });
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ message: "Error al crear la orden", error: error.message });
  }
};


exports.getPurchaseHistory = async (req, res) => {
  try {
    const { uid } = req.params; // Obtener el UID del usuario de los parámetros
    const snapshot = await db
      .collection("ventas")
      .where("user_id", "==", uid)
      .orderBy("fecha", "desc")
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
    const { uid } = req.params; // Cambiar user_id por uid
    const snapshot = await db
      .collection("ventas")
      .where("user_id", "==", uid) // Asegúrate de que esta consulta coincide con los documentos de Firestore
      .orderBy("fecha", "desc")
      .limit(3)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No se encontraron compras recientes para este usuario." });
    }

    const purchases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error al obtener las compras recientes:", error);
    res.status(500).json({ message: "Error al obtener las compras recientes.", error: error.message });
  }
};

// Función para obtener todas las ventas
exports.getAllSales = async (req, res) => {
  try {
    const snapshot = await db.collection("ventas").orderBy("fecha", "desc").get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No se encontraron ventas." });
    }

    const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ message: "Error al obtener todas las ventas.", error: error.message });
  }
};
