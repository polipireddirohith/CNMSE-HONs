const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    service: 'Product Catalog Microservice',
    status: 'Healthy',
    endpoints: {
      getAllProducts: 'GET /products',
      getProductById: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PUT /products/:id',
      deleteProduct: 'DELETE /products/:id'
    }
  });
});

// Mount Routes
app.use('/products', productRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Product Catalog Microservice running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
