const express = require( 'express' );
const { MongoClient, ObjectId } = require( 'mongodb' );
const app = express();

app.use( express.json() );

// Configuración de MongoDB
const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'productosDB';
let db, productosCollection;

// Conexión a MongoDB
MongoClient.connect( url, { useUnifiedTopology: true } )
  .then( client => {
    console.log( 'Conectado a MongoDB para productos' );
    db = client.db( dbName );
    productosCollection = db.collection( 'productos' );
  } )
  .catch( error => console.error( error ) );

// Middleware de registro de solicitudes
app.use( ( req, res, next ) => {
  console.log( `Request received in Products at ${ req.url }` );
  next();
} );

// Obtener todos los productos
app.get( '/productos', async ( req, res ) => {
  try {
    const productos = await productosCollection.find().toArray();
    res.json( productos );
  } catch ( error ) {
    res.status( 500 ).send( 'Error al obtener productos' );
  }
} );

// Obtener un producto por ID
app.get( '/productos/:id', async ( req, res ) => {
  try {
    const producto = await productosCollection.findOne( { _id: new ObjectId( req.params.id ) } );
    if ( !producto ) return res.status( 404 ).send( 'El producto con el ID especificado no fue encontrado' );
    res.json( producto );
  } catch ( error ) {
    res.status( 500 ).send( 'Error al obtener producto' );
  }
} );

// Crear un nuevo producto
app.post( '/productos', async ( req, res ) => {
  try {
    const producto = {
      nombre: req.body.nombre,
      precio: req.body.precio
    };
    const result = await productosCollection.insertOne( producto );
    res.json( result.ops[ 0 ] );
  } catch ( error ) {
    res.status( 500 ).send( 'Error al agregar producto' );
  }
} );

// Actualizar un producto por ID
app.put( '/productos/:id', async ( req, res ) => {
  try {
    const result = await productosCollection.findOneAndUpdate(
      { _id: new ObjectId( req.params.id ) },
      { $set: { nombre: req.body.nombre, precio: req.body.precio } },
      { returnOriginal: false }
    );
    if ( !result.value ) return res.status( 404 ).send( 'El producto con el ID especificado no fue encontrado' );
    res.json( result.value );
  } catch ( error ) {
    res.status( 500 ).send( 'Error al actualizar producto' );
  }
} );

// Eliminar un producto por ID
app.delete( '/productos/:id', async ( req, res ) => {
  try {
    const result = await productosCollection.deleteOne( { _id: new ObjectId( req.params.id ) } );
    if ( result.deletedCount === 0 ) return res.status( 404 ).send( 'El producto con el ID especificado no fue encontrado' );
    res.send( 'Producto eliminado' );
  } catch ( error ) {
    res.status( 500 ).send( 'Error al eliminar producto' );
  }
} );

// Inicia el servidor
app.listen( 3003, () => console.log( 'Server is running on port 3003' ) );
