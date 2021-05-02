const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mernauth', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', () => console.log('Error on connection'));
mongoose.connection.on('connected', () => console.log('Database connected'));