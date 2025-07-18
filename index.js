const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();

exports.realizarAccion = functions.https.onRequest((req, res) => {
    // Usamos CORS para permitir peticiones desde cualquier origen.
    cors(req, res, async () => {
        const action = req.query.action;
        const id = req.query.id;
        const status = req.query.status;
        const callback = req.query.callback; // Capturamos el nombre de la función callback

        const responseData = { success: false, error: null, id: id };

        try {
            if (!id) {
                throw new Error('ID del documento no proporcionado.');
            }

            const docRef = db.collection('/artifacts/pet-tags-split-app/public/data/pedidos').doc(id);

            if (action === 'update' && status) {
                await docRef.update({ status: status });
                responseData.success = true;
            } else if (action === 'delete') {
                await docRef.delete();
                responseData.success = true;
            } else {
                throw new Error('Acción no válida o parámetros incompletos.');
            }
        } catch (error) {
            console.error('Error en la operación para el ID ' + id + ':', error);
            responseData.error = error.message;
        }

        // Si se proveyó un callback, envolvemos la respuesta en él (JSONP).
        if (callback) {
            res.set('Content-Type', 'text/javascript');
            res.status(200).send(`${callback}(${JSON.stringify(responseData)})`);
        } else {
            // Si no, devolvemos JSON normal.
            res.status(200).json(responseData);
        }
    });
});
