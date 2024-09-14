const express = require( 'express' );
const { createProxyMiddleware } = require( 'http-proxy-middleware' );
const morgan = require( 'morgan' );

const app = express();

// Configuración de morgan para logging
app.use( morgan( ':method :url :status :res[content-length] - :response-time ms' ) );

// Ruta de prueba
app.get( '/', ( req, res ) => {
  res.send( 'Gateway running. Use /criptos, /persons or /products' );
} );

// Middleware para criptos
app.use( '/criptos',
  createProxyMiddleware( {
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/': '/criptos' // Mantén la ruta /criptos en la solicitud redirigida
    },
  } )
);


// Middleware para persons
app.use( '/personas',
  createProxyMiddleware( {
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/': '/personas' // Mantén la ruta /persons
    },
  } )
);

// Middleware para products
app.use( '/productos',
  createProxyMiddleware( {
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/': '/productos' // Mantén la ruta /products
    },
  } )
);

// Inicia el servidor
app.listen( 3000, () => {
  console.log( 'Gateway running on http://localhost:3000' );
} );


// Comand to run the server
// npm run start