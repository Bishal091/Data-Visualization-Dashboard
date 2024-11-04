require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dataRouter = require('./routes/data');

const app = express();

// Environment variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

// CORS configuration
const corsOptions = {
  origin: REACT_APP_API_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
app.use('/api/data', dataRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});