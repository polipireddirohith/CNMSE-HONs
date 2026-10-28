const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] MongoDB successfully connected to: ${uri}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection to '${uri}' failed (${err.message}).`);
    console.warn(`[Database] Operating in Standalone In-Memory Mode with full Mongoose Schema Validation.`);
    isConnected = false;
  }
};

const getIsConnected = () => isConnected;

module.exports = {
  connectDB,
  getIsConnected
};
