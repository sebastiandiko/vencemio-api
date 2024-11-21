const express = require('express');
const { admin } = require('./utils/firebase'); // Importar Firebase desde utils/firebase.js

const app = express();
app.use(express.json());

// Importa las rutas
const productRoute = require('./routes/productRoute');
const superuserRoute = require('./routes/superuserRoute');
const userRoute = require('./routes/userRoute');
const tipoProductoRoute = require('./routes/tipoProductoRoute');

// Configura las rutas
app.use('/api/productos', productRoute);
app.use('/api/superusers', superuserRoute);
app.use('/api/users', userRoute);
app.use('/api/tipo_producto', tipoProductoRoute);

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
