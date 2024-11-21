const { admin, db } = require('../utils/firebase');
const bcrypt = require('bcrypt');

// Login de superusuarios
const superuserLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection('superuser').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Superusuario no encontrado.' });
    }

    const superuserData = snapshot.docs[0].data();
    const isPasswordValid = await bcrypt.compare(password, superuserData.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = await admin.auth().createCustomToken(superuserData.uid, { isSuperuser: true });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
  }
};

module.exports = { superuserLogin };
