const { admin } = require('../utils/firebase');

// Middleware para validar el token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o inválido.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Adjuntar información del usuario al request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.', error: error.message });
  }
};

module.exports = { verifyToken };
