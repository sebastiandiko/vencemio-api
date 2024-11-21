const express = require('express');
const cors = require('cors'); // Importa CORS para manejo de solicitudes entre dominios
const { admin } = require('./utils/firebase'); // Importar Firebase desde utils/firebase.js

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Permitir envío de cookies y headers de autenticación
}));

app.use(express.json()); // Middleware para parsear JSON

// Importa las rutas
const productRoute = require('./routes/productRoute');
const superuserRoute = require('./routes/superuserRoute');
const userRoute = require('./routes/userRoute');
const tipoProductoRoute = require('./routes/tipoProductoRoute');
const authRoute = require('./routes/authRoute'); // Asegúrate de incluir la ruta para autenticación

// Configura las rutas
app.use('/api/productos', productRoute);
app.use('/api/superusers', superuserRoute);
app.use('/api/users', userRoute);
app.use('/api/tipo_producto', tipoProductoRoute);
app.use('/api/auth', authRoute); // Ruta para autenticación

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
