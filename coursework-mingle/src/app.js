const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// init middlewares
app.use(cors());
app.use(express.json());

// health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'mingle api skeleton running' });
});

// mount auth routes
app.use('/api/auth', authRoutes);

// mount post routes
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mingle_db';

// connect mongodb
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('connected to mongodb');
    // start http server
    app.listen(PORT, () => {
      console.log(`mingle api listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('mongodb connection error', err);
  });

module.exports = app;

