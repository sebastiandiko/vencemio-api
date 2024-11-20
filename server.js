const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializa Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

// Importa las rutas
const productRoute = require('./routes/productRoute');
const superuserRoute = require('./routes/superuserRoute'); // Importa la nueva ruta
app.use('/api/productos', productRoute);
app.use('/api/superusers', superuserRoute); // Nueva ruta para superuser

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
