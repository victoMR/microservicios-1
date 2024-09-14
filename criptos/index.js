const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(express.json());

// Configuración de MongoDB
const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'criptoDB';
let db, criptosCollection;

// Conexión a MongoDB
MongoClient.connect(url)
  .then(client => {
    console.log('Conectado a MongoDB');
    db = client.db(dbName);
    criptosCollection = db.collection('criptos');
  })
  .catch(error => {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1); // Finaliza la aplicación si no puede conectarse a la base de datos
  });

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log(`Request received in Criptos at ${req.url}`);
  next();
});

// Ruta para obtener todas las criptomonedas
app.get('/criptos', async (req, res) => {
  try {
    const criptos = await criptosCollection.find().toArray();
    res.json(criptos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener criptos', error });
  }
});

// Ruta para agregar una nueva criptomoneda
app.post('/criptos', async (req, res) => {
  try {
    const nuevaCripto = {
      nombre: req.body.nombre,
      precio: req.body.precio
    };
    const resultado = await criptosCollection.insertOne(nuevaCripto);
    
    // Cambia a la forma correcta de obtener el documento insertado
    if (resultado.acknowledged) {
      res.json( "Creado con el Id : "+{ insertedId: resultado.insertedId });
    } else {
      res.status(500).json({ message: 'Error al agregar cripto, no se insertó.' });
    }
  } catch (error) {
    console.error('Error al agregar cripto:', error.message);
    res.status(500).json({ message: 'Error al agregar cripto', error });
  }
});

app.put('/criptos/:id', async (req, res) => {
  try {
    const result = await criptosCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { nombre: req.body.nombre, precio: req.body.precio } },
      { returnOriginal: false }
    );
    if (!result.value) return res.status(404).send('La cripto con el ID especificado no fue encontrada');
    res.json(result.value);
  } catch (error) {
    res.status(500).send('Error al actualizar cripto');
  }
});

app.delete('/criptos/:id', async (req, res) => {
  try {
    const result = await criptosCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).send('La cripto con el ID especificado no fue encontrada');
    res.send('Eliminado');
  } catch (error) {
    res.status(500).send('Error al eliminar cripto');
  }
});

app.listen(3001, () => console.log('Server is running on port 3001'));
