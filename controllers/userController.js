const { admin, db } = require('../utils/firebase');


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
  try {
    // Obtener los datos del usuario desde el body de la solicitud
    const { nombre, apellido, email, password } = req.body;

    // Validar los datos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben estar completos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Crear el usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${nombre} ${apellido}`,
    });

    // Almacenar información adicional en Firestore
    const userData = {
      uid: userRecord.uid,
      nombre,
      apellido,
      email,
      fecha_registro: new Date().toISOString(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Responder con éxito
    res.status(201).json({ message: 'Usuario registrado exitosamente.', uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario: ' + error.message });
  }
};