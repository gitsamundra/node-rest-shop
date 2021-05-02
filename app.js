const express = require('express');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const morgan = require('morgan');
require('./db');
const app = express();



// ===Middleware======
// app.use((req, res, next) => {
//   res.status(200).json({
//     message: 'It works!'
//   });
// });
app.use(morgan('dev'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin', '*',
    'Access-Control-Allow-Headers', 'Origin, X-Request-With, Accept, Authorization'
  );
  if(req.method === 'OPTIONS') {
    req.header(
      'Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'
    );
    return res.status(200).json({});
  }
  next();
});

// ====ROUTES=====
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// =====ERROR HANDLE=====
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;