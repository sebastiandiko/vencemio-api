const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/geocode', async (req, res) => {
  const { address } = req.query; // Dirección enviada desde el frontend
  const apiKey = process.env.GOOGLE_API_KEY; // Asegúrate de tener esta clave configurada correctamente en tu .env

  // Validar si la dirección fue proporcionada
  if (!address) {
    return res.status(400).json({ message: 'La dirección es obligatoria.' });
  }

  try {
    // Llamada a la API de Google para geocodificación
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: apiKey,
        },
      }
    );

    // Manejar la respuesta de la API de Google
    if (response.data.status === 'OK') {
      console.log('Coordenadas obtenidas:', response.data.results[0].geometry.location);
      return res.status(200).json(response.data.results[0].geometry.location);
    } else {
      console.error('Error de Google API:', response.data);
      return res.status(400).json({
        message: `Google API Error: ${response.data.status}`,
        error: response.data,
      });
    }
  } catch (error) {
    console.error('Error al llamar a la API de Google:', error.message);
    return res.status(500).json({
      message: 'Error interno del servidor al realizar la solicitud de geocodificación.',
      error: error.message,
    });
  }
});

module.exports = router;
