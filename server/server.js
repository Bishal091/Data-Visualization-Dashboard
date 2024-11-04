const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const dataRouter = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 5000;

const reactAppApiUrl = process.env.REACT_APP_API_URL;

// CORS
const corsOptions = {
  // origin: 'https://graytm-wallet.netlify.app',
  origin: `${reactAppApiUrl}`,
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