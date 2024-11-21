const { db } = require('../utils/firebase'); // O tu inicialización de Firebase
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Manejar el inicio de sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario en Firestore
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

    // Generar token
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      'SECRET_KEY', // Cambiar por una clave segura
      { expiresIn: '1h' }
    );

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

exports.loginSuper = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar que los campos no estén vacíos
    if (!email || !password) {
      return res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
    }

    // Buscar el supermercado por correo
    const superQuery = await db.collection('superuser').where('email', '==', email).get();

    if (superQuery.empty) {
      return res.status(404).json({ message: 'Supermercado no encontrado.' });
    }

    // Obtener el documento del superusuario
    const superDoc = superQuery.docs[0];
    const superData = superDoc.data();

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, superData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Opcional: Generar un token JWT
    const token = jwt.sign(
      { id: superDoc.id, email: superData.email, cod_super: superData.cod_super },
      process.env.JWT_SECRET || 'secret', // Define una clave secreta en .env
      { expiresIn: '1h' }
    );

    // Responder con éxito
    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token, // Enviar el token si lo necesitas para sesiones
      super: {
        id: superDoc.id,
        email: superData.email,
        cod_super: superData.cod_super,
        cadena: superData.cadena,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión del super:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
