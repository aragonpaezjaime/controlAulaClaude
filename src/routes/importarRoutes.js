const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const importarController = require('../controllers/importarController');

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guardar temporalmente en la carpeta uploads
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generar nombre único con timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'plickers-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo archivos CSV
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos CSV'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});

/**
 * POST /api/importar/plickers
 * Importar puntos XP desde archivo CSV de Plickers
 */
router.post('/plickers', upload.single('archivo'), importarController.importarPlickers);

module.exports = router;
