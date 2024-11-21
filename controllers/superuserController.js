const { admin, db } = require('../utils/firebase');
const bcrypt = require('bcrypt');


// Obtener todos los superusuarios
exports.getAllSuperusers = async (req, res) => {
  try {
    const superusersSnapshot = await db.collection('superuser').get();
    const superusers = [];
    superusersSnapshot.forEach(doc => {
      superusers.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(superusers);
  } catch (error) {
    res.status(500).send('Error al obtener los superusuarios: ' + error.message);
  }
};

// Obtener un superusuario por su ID
exports.getSuperuserById = async (req, res) => {
  try {
    const doc = await db.collection('superuser').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Superusuario no encontrado');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error al obtener el superusuario: ' + error.message);
  }
};

// Registrar un nuevo superusuario
exports.registerSuperuser = async (req, res) => {
  try {
    // Obtener los datos del superusuario desde el body de la solicitud
    const {
      cadena,
      ciudad,
      provincia,
      direccion,
      cod_super,
      password,
      telefono = '', // Campo opcional
      email = '', // Campo opcional
      ubicacion // Este debe ser un objeto con latitud y longitud
    } = req.body;

    // Validar los campos requeridos
    if (!cadena || !ciudad || !provincia || !direccion || !cod_super || !password || !ubicacion) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben estar completos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (!ubicacion.latitud || !ubicacion.longitud) {
      return res.status(400).json({ message: 'Debe proporcionar la latitud y longitud en el campo ubicacion.' });
    }

    // Verificar si el superusuario ya existe en la base de datos
    const existingSuperuser = await db.collection('superuser').where('cod_super', '==', cod_super).get();
    if (!existingSuperuser.empty) {
      return res.status(400).json({ message: 'El código del superusuario ya está registrado.' });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear los datos del superusuario
    const superuserData = {
      cadena,
      ciudad,
      provincia,
      direccion,
      cod_super,
      password: hashedPassword,
      telefono,
      email,
      estado: true,
      fecha_registro: new Date().toISOString(),
      ubicacion
    };

    // Agregar el nuevo superusuario a Firestore
    const docRef = await db.collection('superuser').add(superuserData);

    // Responder con éxito
    res.status(201).json({ message: 'Superusuario registrado exitosamente.', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el superusuario: ' + error.message });
  }
};
