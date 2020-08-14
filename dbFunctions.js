const mongoose = require('mongoose');

// Schema/Model

// Create

// Read

// Update

// Delete

// Connect to Mongo
const connect = (dbURI) => {
  mongoose.connect(dbURI,
      {useNewUrlParser: true, useUnifiedTopology: true});
};

exports.connect = connect;