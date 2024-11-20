# **Vencemio API**

API para gestionar productos, superusuarios y categorías (tipo_producto) utilizando Firebase Firestore.

---

## **Descripción**

Este proyecto proporciona una API para interactuar con Firestore. Permite realizar operaciones como:
- Obtener productos por categoría (`tipo_producto`).
- Filtrar productos por superusuario (`superuser`).
- Gestión de productos, superusuarios y categorías.

---

## **Estructura del Proyecto**

```plaintext
├── controllers/      # Lógica de negocio para interactuar con Firestore
├── routes/           # Rutas de la API
├── services/         # (Opcional) Servicios auxiliares, como autenticación
├── models/           # (Opcional) Definición de esquemas (si los utilizas)
├── server.js         # Archivo principal del servidor
├── package.json      # Dependencias y configuración de Node.js
├── README.md         # Documentación del proyecto
└── serviceAccountKey.json  # Clave para conectar con Firebase (NO COMPARTIR)
```

## **Requisitos**
    *Node.js (v18 o superior)
    *Firebase Admin SDK
    *Dependencias:

npm install express firebase-admin

## **Endpoints Principales**
Productos
    Obtener productos por categoría:
        *Método: GET
        *URL: /api/productos/byCategory/:categoryName
        *Descripción: Devuelve todos los productos que pertenecen a la categoría especificada.
        *Ejemplo: http://localhost:3000/api/productos/byCategory/Lacteo

    Obtener productos por superusuario:
        *Método: GET
        *URL: /api/productos/byCodSuper/:codSuper
        *Descripción: Devuelve todos los productos asociados a un cod_super específico.
        *Ejemplo: http://localhost:3000/api/productos/byCodSuper/SupermaxMaipu359

Superusuarios
    Obtener superusuario por ID:
        *Método: GET
        *URL: /api/superusers/:id
        *Descripción: Devuelve la información de un superusuario específico.

## **Cómo Ejecutar el Proyecto**
    1-Clonar el repositorio:
        git clone <URL_DEL_REPOSITORIO>
        cd vencemio-api

    2-Instalar dependencias:
        npm install

    3-Configurar Firebase:
        Descarga tu archivo serviceAccountKey.json desde la consola de Firebase y colócalo en la raíz del proyecto.

    4-Ejecutar el servidor:

        node server.js

    5-Abrir el navegador o usar Postman para probar los endpoints.