'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { initRedis } = require('./services/redis.service');


const postRoutes = require('./routes/router.post');
const userRoutes = require('./routes/router.user');
const commentRoutes = require('./routes/router.comment');

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anti_social_net';
const allowStartupWithoutDb = process.env.NODE_ENV !== 'production' || process.env.ALLOW_STARTUP_WITHOUT_DB === 'true';

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(commentRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const startServer = async () => {
    try {
        await initRedis();
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 3000,
        });
        console.log('Conexión exitosa a MongoDB con Mongoose.');
    } catch (error) {
        if (allowStartupWithoutDb) {
            console.warn(`MongoDB no disponible: ${error.message}`);
            console.warn('Continuando sin base de datos para desarrollo.');
        } else {
            console.error('Error crítico: No se pudo conectar a MongoDB:', error.message);
            process.exit(1);
        }
    }

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();

module.exports = app;