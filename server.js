const express = require('express');
const cors = require('cors');
const { admin } = require('./utils/firebase');
const googleRoute = require('./routes/googleRoute');

require('dotenv').config();

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Importar rutas
const productRoute = require('./routes/productRoute');
const superuserRoute = require('./routes/superuserRoute');
const userRoute = require('./routes/userRoute');
const tipoProductoRoute = require('./routes/tipoProductoRoute');
const authRoute = require('./routes/authRoute');
const favoriteRoutes = require('./routes/favoritesRoute');
const notificationRoutes = require('./routes/notificationRoute');
const ventasRoute = require('./routes/ventasRoute');

// Configurar rutas
app.use('/api/productos', productRoute);
app.use('/api/superusers', superuserRoute);
app.use('/api/users', userRoute);
app.use('/api/tipos_product', tipoProductoRoute);
app.use('/api/auth', authRoute);
app.use('/api/google', googleRoute);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notificaciones', notificationRoutes);
app.use('/api/ventas', ventasRoute);

// Exportar como handler para Vercel
module.exports = app;
