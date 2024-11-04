const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const dataRouter = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 5000;

const reactAppApiUrl = process.env.REACT_APP_API_URL || 'https://dataviztop.netlify.app';

// Set allowed origins dynamically
const allowedOrigins = [
  reactAppApiUrl,
  'http://localhost:5174' // Example for local development
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// const dataRouter = require('./routes/data');
app.use('/api/data', dataRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});