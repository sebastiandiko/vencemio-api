const { db } = require('../utils/firebase'); // Asegúrate de importar tu configuración de Firebase

// Función para agregar un producto a los favoritos de un usuario
exports.addFavorite = async (req, res) => {
  const userId = req.body.userId; // Obtén el userId del cuerpo de la solicitud
  const product = req.body.product; // Obtén el producto a agregar a favoritos

  try {
    // Guardamos el producto en la subcolección "favoritos" dentro del documento del usuario
    await db.collection("users").doc(userId).collection("favoritos").doc(product.id).set({
      ...product,
      fecha_agregado: new Date() // Guardamos la fecha en que se agregó el producto a favoritos
    });

    res.status(200).json({ message: "Producto agregado a favoritos" });
  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
    res.status(500).json({ message: "Error al agregar producto a favoritos", error });
  }
};

// Función para eliminar un producto de los favoritos de un usuario
exports.removeFavorite = async (req, res) => {
  const userId = req.body.userId; // Obtén el userId del cuerpo de la solicitud
  const productId = req.body.productId; // Obtén el id del producto a eliminar de favoritos

  try {
    // Eliminar el producto de la subcolección "favoritos" del usuario
    await db.collection("users").doc(userId).collection("favoritos").doc(productId).delete();

    res.status(200).json({ message: "Producto eliminado de favoritos" });
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error);
    res.status(500).json({ message: "Error al eliminar producto de favoritos", error });
  }
};

// Función para obtener todos los favoritos de un usuario
exports.getFavorites = async (req, res) => {
  const userId = req.params.userId; // Obtener el userId desde los parámetros de la URL

  try {
    // Obtener todos los productos de la subcolección "favoritos" del usuario
    const favoritesSnapshot = await db.collection("users").doc(userId).collection("favoritos").get();
    
    if (favoritesSnapshot.empty) {
      return res.status(404).json({ message: "No se encontraron productos en favoritos" });
    }

    // Mapear los productos obtenidos
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: "Error al obtener productos favoritos", error });
  }
};
