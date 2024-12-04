const { db } = require('../utils/firebase'); // Asegúrate de importar tu configuración de Firebase

exports.addFavorite = async (req, res) => {
  const { userUid, productId } = req.body;  // Obtener userUid y productId

  try {
    // Buscar el documento del usuario
    const userRef = db.collection('users').where('uid', '==', userUid);  
    const userDocs = await userRef.get();

    if (userDocs.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userDoc = userDocs.docs[0]; // Usamos el primer documento encontrado
    const userId = userDoc.id; // ID del usuario

    // Buscar el producto en la colección de productos
    const productRef = db.collection('producto').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Obtener los datos del producto
    const productData = productDoc.data();
    
    // Verificar si ya está en favoritos
    const favoriteRef = db.collection('users').doc(userId).collection('favorites').doc(productId);
    const favoriteDoc = await favoriteRef.get();

    if (favoriteDoc.exists) {
      return res.status(400).json({ message: 'Este producto ya está en tus favoritos.' });
    }

    // Agregar el producto a favoritos con toda la información del producto
    await favoriteRef.set({
      ...productData,  // Guardamos los datos completos del producto
      fecha_agregado: new Date(),  // Fecha de cuando se agregó el producto
    });

    res.status(200).json({ message: 'Producto agregado a favoritos' });

  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
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
    // Obtener el documento del usuario
    const userRef = db.collection('users').where('uid', '==', userUid);
    const userDoc = await userRef.get();

    if (userDoc.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userId = userDoc.docs[0].id;  // Obtener el ID del usuario

    // Obtener los productos favoritos del usuario
    const favoritesSnapshot = await db.collection('users').doc(userId).collection('favorites').get();

    if (favoritesSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos en favoritos' });
    }

    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });  // Obtiene todos los datos del producto directamente
    });

    res.status(200).json(favorites);  // Responder con los productos favoritos completos
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: 'Error al obtener productos favoritos', error });
  }
};
