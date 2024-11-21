const { admin, db } = require('../utils/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Manejar el inicio de sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar que los campos estén completos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar el usuario en Firestore
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Comparar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { uid: user.uid, email: user.email, nombre: user.nombre },
      'SECRET_KEY', // Cambia esto por una clave secreta segura en tu entorno
      { expiresIn: '1h' } // El token expirará en 1 hora
    );

    // Responder con el token y la información del usuario
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
      },
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
