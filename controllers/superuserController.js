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

// Registrar un nuevo supermercado
exports.registerSuper = async (req, res) => {
  const {
    cadena,
    direccion,
    ciudad,
    provincia,
    email,
    telefono,
    ubicacion,
    estado = true,
    fecha_registro,
    password,
  } = req.body;

  try {
    // Validar campos obligatorios
    if (!cadena || !direccion || !ciudad || !provincia || !email || !ubicacion || !password) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar `cod_super`
    const cod_super = `${cadena.replace(/\s+/g, '')}${direccion.replace(/\s+/g, '')}`;

    // Crear el objeto del supermercado
    const newSuper = {
      cadena,
      direccion,
      ciudad,
      provincia,
      email,
      telefono,
      ubicacion,
      estado,
      fecha_registro: fecha_registro || new Date().toISOString(),
      cod_super,
      password: hashedPassword, // Guardar la contraseña cifrada
    };

    // Guardar en Firestore
    const docRef = await db.collection('superuser').add(newSuper);

    res.status(201).json({ message: 'Supermercado registrado exitosamente.', id: docRef.id });
  } catch (error) {
    console.error('Error al registrar supermercado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
