const { admin, db } = require('../utils/firebase');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Para generar un UID si no lo manejas desde el frontend


// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error al obtener los usuarios: ' + error.message);
  }
};

// Obtener un usuario por su ID
exports.getUserById = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error al obtener el usuario: ' + error.message);
  }
};

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  try {
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben estar completos.' });
    }

    // Verificar si el correo ya está registrado
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear los datos del usuario
    const newUser = {
      uid: uuidv4(), // Generar un UID único
      nombre,
      apellido,
      email,
      password: hashedPassword, // Guardar la contraseña cifrada
      fecha_registro: new Date().toISOString(),
      preference: ["", "", ""]
    };

    // Guardar en Firestore
    await db.collection('users').add(newUser);

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Obtener preferencias de un usuario por ID
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.params.id;
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const data = doc.data();
    res.status(200).json({ preferences: data.preference || [] }); // Devolver preferencias o un arreglo vacío
  } catch (error) {
    console.error('Error al obtener las preferencias del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.updateUserPreferences = async (req, res) => {
  const userId = req.params.id; // ID del usuario
  const { preferences } = req.body; // Nuevas preferencias

  try {
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: 'Las preferencias deben ser un arreglo.' });
    }

    const userDoc = db.collection('users').doc(userId);

    const doc = await userDoc.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar las preferencias
    await userDoc.update({ preference: preferences });

    res.status(200).json({ message: 'Preferencias actualizadas exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar las preferencias del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// En el archivo userController.js
exports.getUserPreferencesByUid = async (req, res) => {
  try {
    const { uid } = req.params;  // Recibimos el uid en lugar del userId
    const doc = await db.collection('users').where('uid', '==', uid).get(); // Buscar por uid

    if (doc.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = doc.docs[0].data(); // Suponiendo que sólo hay un usuario con ese uid
    res.status(200).json({ preferences: userData.preference || [] });  // Devolver preferencias
  } catch (error) {
    console.error('Error al obtener las preferencias del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params; // Recibimos el UID como parámetro
    const snapshot = await db.collection('users').where('uid', '==', uid).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Supongamos que el UID es único, por lo que sólo habrá un documento
    const user = snapshot.docs[0].data();

    res.status(200).json({ id: snapshot.docs[0].id, ...user }); // Devolver los datos del usuario
  } catch (error) {
    console.error('Error al obtener el usuario por UID:', error);
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};
