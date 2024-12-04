const { db } = require('../utils/firebase'); // Asegúrate de importar tu configuración de Firebase

exports.addFavorite = async (req, res) => {
  const { userUid, productId } = req.body;

  try {
    // 1. Verificar si el usuario existe
    console.log(`Buscando al usuario con UID: ${userUid}`);
    const userRef = db.collection('users').where('uid', '==', userUid);  // Buscamos por el campo 'uid'
    const userDocs = await userRef.get();

    if (userDocs.empty) {
      console.log('Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userDoc = userDocs.docs[0]; // Usamos el primer documento encontrado
    const userId = userDoc.id; // El ID del documento del usuario
    console.log(`Usuario encontrado. ID del documento: ${userId}`);

    // 2. Verificar si el producto ya está en favoritos
    const favoriteRef = db.collection('users').doc(userId).collection('favorites').doc(productId);
    const favoriteDoc = await favoriteRef.get();

    if (favoriteDoc.exists) {
      console.log('Este producto ya está en los favoritos.');
      return res.status(400).json({ message: 'Este producto ya está en tus favoritos.' });
    }

    // 3. Si el producto no está en favoritos, lo agregamos
    console.log('Producto no encontrado en favoritos. Agregando...');
    await favoriteRef.set({
      productId,
      fecha_agregado: new Date(),
    });

    console.log('Producto agregado a favoritos.');
    res.status(200).json({ message: 'Producto agregado a favoritos' });

  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
    res.status(500).json({ message: 'Error al agregar producto a favoritos', error });
  }
};

exports.removeFavorite = async (req, res) => {
  const { userUid, productId } = req.body; // Recibimos el `userUid` y `productId` desde el cuerpo de la solicitud

  try {
    console.log(`Buscando al usuario con UID: ${userUid}`);

    // Buscar al usuario usando el UID
    const userRef = db.collection('users').where('uid', '==', userUid); // Usamos el campo 'uid'
    const userDocs = await userRef.get();

    if (userDocs.empty) {
      console.log('Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userDoc = userDocs.docs[0]; // Usamos el primer documento encontrado
    const userId = userDoc.id; // El ID del documento del usuario
    console.log(`Usuario encontrado. ID del documento: ${userId}`);

    // Accedemos al producto en la subcolección "favorites"
    const favoriteRef = db.collection('users').doc(userId).collection('favorites').doc(productId);
    const favoriteDoc = await favoriteRef.get();

    if (!favoriteDoc.exists) {
      console.log('Producto no encontrado en favoritos.');
      return res.status(404).json({ message: 'Producto no encontrado en favoritos.' });
    }

    // Si el producto existe, lo eliminamos
    console.log(`Eliminando el producto con ID: ${productId} de favoritos.`);
    await favoriteRef.delete();

    res.status(200).json({ message: 'Producto eliminado de favoritos.' });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    res.status(500).json({ message: 'Error al eliminar producto de favoritos', error });
  }
};


exports.getFavorites = async (req, res) => {
  const userUid = req.params.userUid;  // Obtener el userUid desde los parámetros de la URL

  try {
    // Obtener el documento del usuario usando el uid
    const userRef = db.collection('users').where('uid', '==', userUid);  // Usamos uid para obtener el documento del usuario
    const userDoc = await userRef.get();

    if (userDoc.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userId = userDoc.docs[0].id; // Aquí obtenemos el `id` del documento del usuario

    // Ahora buscamos la subcolección "favoritos" de ese usuario
    const favoritesSnapshot = await db.collection('users').doc(userId).collection('favorites').get();

    if (favoritesSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos en favoritos' });
    }

    // Mapear los productos obtenidos
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(favorites);  // Respondemos con los productos favoritos
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: 'Error al obtener productos favoritos', error });
  }
};
