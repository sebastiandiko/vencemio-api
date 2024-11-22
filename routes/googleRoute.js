const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/geocode', async (req, res) => {
  const { address } = req.query; // Dirección enviada desde el frontend
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!address) {
    return res.status(400).json({ message: 'La dirección es obligatoria.' });
  }

  try {
    // Llamada a la API de Google
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: apiKey,
        },
      }
    );

    if (response.data.status === 'OK') {
      return res.status(200).json(response.data.results[0].geometry.location);
    } else {
      return res.status(400).json({ message: 'Error al obtener coordenadas.' });
    }
  } catch (error) {
    console.error('Error al llamar a la API de Google:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
