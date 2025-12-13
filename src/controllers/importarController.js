const Alumno = require('../models/Alumno');
const Ajuste = require('../models/Ajuste');
const fs = require('fs');
const csv = require('csv-parser');

/**
 * Importar puntos XP desde archivo CSV de Plickers
 * POST /api/importar/plickers
 */
exports.importarPlickers = async (req, res) => {
    try {
        // Verificar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                mensaje: 'No se proporcionó ningún archivo CSV'
            });
        }

        // Verificar que se hayan proporcionado los puntos totales
        const puntosTotales = parseInt(req.body.puntosTotales, 10);
        if (!puntosTotales || isNaN(puntosTotales) || puntosTotales <= 0) {
            return res.status(400).json({
                success: false,
                mensaje: 'Debes especificar cuántos puntos vale la actividad'
            });
        }

        // Capturar comentario opcional para los alumnos
        const comentario = req.body.comentario ? req.body.comentario.trim() : null;

        console.log(`📊 Importando Plickers - Actividad vale: ${puntosTotales} puntos`);
        if (comentario) {
            console.log(`💬 Comentario: "${comentario}"`);
        }

        const filePath = req.file.path;
        const resultados = {
            procesados: 0,
            actualizados: 0,
            errores: 0,
            noEncontrados: [],
            detalles: [],
            puntosTotales: puntosTotales
        };

        const rows = [];

        // Leer el archivo CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(csv({
                    skipLines: 6, // Saltar las primeras 6 líneas de metadatos
                    headers: false, // No usar la primera línea como encabezados (ya la saltamos)
                    mapHeaders: ({ index }) => index.toString() // Usar índices numéricos como claves
                }))
                .on('data', (row) => {
                    rows.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📊 Total de filas leídas: ${rows.length}`);

        // Procesar cada fila
        for (const row of rows) {
            try {
                resultados.procesados++;

                // Extraer datos (índices como strings: '0', '1', '2', '3')
                const firstName = (row['1'] || '').trim();
                const lastName = (row['2'] || '').trim();
                const scoreRaw = (row['3'] || '').trim();

                // Validar que tengamos nombre y apellido
                if (!firstName || !lastName) {
                    resultados.errores++;
                    resultados.detalles.push({
                        fila: resultados.procesados,
                        error: 'Nombre o apellido vacío',
                        datos: row
                    });
                    continue;
                }

                // Limpiar el score (porcentaje)
                let scorePorcentaje = 0;
                if (scoreRaw === '-' || scoreRaw === '') {
                    scorePorcentaje = 0;
                } else {
                    // Eliminar el símbolo % y convertir a número
                    const scoreStr = scoreRaw.replace('%', '');
                    scorePorcentaje = parseInt(scoreStr, 10);

                    if (isNaN(scorePorcentaje)) {
                        scorePorcentaje = 0;
                    }
                }

                // 🎯 CALCULAR PUNTOS XP CON MULTIPLICADOR
                // Fórmula: puntosTotales × (porcentaje / 100)
                // Ejemplo: 20 puntos × (80% / 100) = 16 puntos XP
                const puntosXP = Math.round(puntosTotales * (scorePorcentaje / 100));

                // Construir nombre completo para búsqueda
                const nombreCompleto = `${firstName} ${lastName}`;

                console.log(`🔍 Buscando alumno: "${nombreCompleto}" | Score: ${scorePorcentaje}% | XP a sumar: ${puntosXP}`);

                // Normalizar texto para búsqueda (quitar acentos y convertir a minúsculas)
                const normalizarTexto = (texto) => {
                    return texto
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '');
                };

                const nombreNormalizado = normalizarTexto(nombreCompleto);

                // Buscar alumno en la BD
                const todosAlumnos = await Alumno.find({});
                let alumnoEncontrado = null;

                // Buscar coincidencia exacta normalizada
                for (const alumno of todosAlumnos) {
                    const nombreAlumnoBD = normalizarTexto(alumno.nombreCompleto);
                    if (nombreAlumnoBD === nombreNormalizado) {
                        alumnoEncontrado = alumno;
                        break;
                    }
                }

                if (!alumnoEncontrado) {
                    resultados.noEncontrados.push({
                        nombre: nombreCompleto,
                        score: scorePorcentaje,
                        puntosXP: puntosXP
                    });
                    console.log(`❌ No encontrado: ${nombreCompleto}`);
                    continue;
                }

                // Actualizar XP del alumno
                const xpAnterior = alumnoEncontrado.xp;
                alumnoEncontrado.xp += puntosXP;

                // Asegurar que no exceda 10,000
                if (alumnoEncontrado.xp > 10000) {
                    alumnoEncontrado.xp = 10000;
                }

                await alumnoEncontrado.save();

                // Crear registro en ajustes (historial)
                await Ajuste.create({
                    alumno: alumnoEncontrado._id,
                    tipo: 'xp',
                    cantidad: puntosXP,
                    motivo: 'Plickers',
                    observaciones: `Importación automática desde Plickers. Score: ${scoreRaw} de actividad de ${puntosTotales} puntos`,
                    comentarioAlumno: comentario || `Actividad Plickers: ${scoreRaw}`,
                    visibleParaAlumno: true,
                    valorAnterior: xpAnterior,
                    valorDespues: alumnoEncontrado.xp,
                    fecha: new Date()
                });

                resultados.actualizados++;
                console.log(`✅ Actualizado: ${nombreCompleto} | ${xpAnterior} → ${alumnoEncontrado.xp} XP (+${puntosXP})`);

            } catch (error) {
                resultados.errores++;
                resultados.detalles.push({
                    fila: resultados.procesados,
                    error: error.message,
                    datos: row
                });
                console.error(`❌ Error procesando fila ${resultados.procesados}:`, error.message);
            }
        }

        // Eliminar el archivo temporal
        fs.unlinkSync(filePath);

        // Responder con resumen
        res.json({
            success: true,
            mensaje: `Importación completada: ${resultados.actualizados} alumnos actualizados`,
            datos: resultados
        });

    } catch (error) {
        console.error('Error en importarPlickers:', error);

        // Intentar eliminar el archivo temporal si existe
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                // Ignorar error al eliminar
            }
        }

        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar el archivo CSV',
            error: error.message
        });
    }
};
