const express = require('express');
const cors = require('cors'); // Importa CORS para manejo de solicitudes entre dominios
const { admin } = require('./utils/firebase'); // Importar Firebase desde utils/firebase.js
const googleRoute = require('./routes/googleRoute');


require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

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
const authRoute = require('./routes/authRoute');
const favoriteRoutes = require('./routes/favoritesRoute'); // Importar las rutas de favoritos

// Configura las rutas
app.use('/api/productos', productRoute);
app.use('/api/superusers', superuserRoute);
app.use('/api/users', userRoute);
app.use('/api/tipos_product', tipoProductoRoute);
app.use('/api/auth', authRoute);
app.use('/api/google', googleRoute);
app.use('/api/favorites', favoriteRoutes); // Rutas de favoritos

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
