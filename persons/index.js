const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(express.json());

// Configuración de MongoDB
const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'personasDB';
let db, personasCollection;

// Conexión a MongoDB
MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    console.log('Conectado a MongoDB para personas');
    db = client.db(dbName);
    personasCollection = db.collection('personas');
  })
  .catch(error => console.error(error));

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log(`Request received in Persons at ${req.url}`);
  next();
});

// Rutas CRUD para personas

// Obtener todas las personas
app.get('/personas', async (req, res) => {
  try {
    const personas = await personasCollection.find().toArray();
    res.json(personas);
  } catch (error) {
    res.status(500).send('Error al obtener personas');
  }
});

// Obtener una persona por ID
app.get('/personas/:id', async (req, res) => {
  try {
    const persona = await personasCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!persona) return res.status(404).send('La persona con el ID especificado no fue encontrada');
    res.json(persona);
  } catch (error) {
    res.status(500).send('Error al obtener persona');
  }
});

// Crear una nueva persona
app.post('/personas', async (req, res) => {
  try {
    const persona = {
      nombre: req.body.nombre
    };
    const result = await personasCollection.insertOne(persona);
    res.json(result.ops[0]);
  } catch (error) {
    res.status(500).send('Error al agregar persona');
  }
});

// Actualizar una persona por ID
app.put('/personas/:id', async (req, res) => {
  try {
    const result = await personasCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { nombre: req.body.nombre } },
      { returnOriginal: false }
    );
    if (!result.value) return res.status(404).send('La persona con el ID especificado no fue encontrada');
    res.json(result.value);
  } catch (error) {
    res.status(500).send('Error al actualizar persona');
  }
});

// Eliminar una persona por ID
app.delete('/personas/:id', async (req, res) => {
  try {
    const result = await personasCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send('La persona con el ID especificado no fue encontrada');
    res.send('Eliminado');
  } catch (error) {
    res.status(500).send('Error al eliminar persona');
  }
});

// Inicia el servidor
app.listen(3002, () => console.log('Server is running on port 3002'));
