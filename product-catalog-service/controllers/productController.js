const Product = require('../models/Product');
const { getIsConnected } = require('../config/db');

// In-Memory store for standalone demonstration / offline execution
let inMemoryProducts = [
  {
    _id: '67200a1b2c3d4e5f6a7b8c91',
    name: 'Logitech MX Master 3S Wireless Mouse',
    price: 99.99,
    category: 'Electronics',
    stock: 45,
    description: 'Ergonomic high-precision performance wireless mouse with quiet clicks.',
    createdAt: new Date('2026-10-28T10:00:00.000Z'),
    updatedAt: new Date('2026-10-28T10:00:00.000Z')
  },
  {
    _id: '67200a1b2c3d4e5f6a7b8c92',
    name: 'Designing Data-Intensive Applications',
    price: 44.95,
    category: 'Books',
    stock: 80,
    description: 'The definitive guide to the architecture of modern data-intensive systems.',
    createdAt: new Date('2026-10-28T10:15:00.000Z'),
    updatedAt: new Date('2026-10-28T10:15:00.000Z')
  },
  {
    _id: '67200a1b2c3d4e5f6a7b8c93',
    name: 'Noise-Cancelling Over-Ear Headphones',
    price: 249.99,
    category: 'Electronics',
    stock: 25,
    description: 'Active noise cancellation with 30-hour battery life and fast charging.',
    createdAt: new Date('2026-10-28T10:30:00.000Z'),
    updatedAt: new Date('2026-10-28T10:30:00.000Z')
  }
];

function generateObjectId() {
  const hex = Math.floor(Date.now() / 1000).toString(16);
  return hex + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
}

// 1. GET /products (List all products, with optional query filters)
const getAllProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    if (getIsConnected()) {
      const query = {};
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    }

    // Fallback in-memory query
    let filtered = [...inMemoryProducts];
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /products/:id (Get single product by ID)
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Product with ID '${id}' was not found.`
        });
      }
      return res.status(200).json({
        success: true,
        data: product
      });
    }

    // In-memory lookup
    const product = inMemoryProducts.find(p => p._id.toString() === id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID '${id}' was not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// 3. POST /products (Create a new product with Mongoose validation)
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, stock, description } = req.body;

    // Run Mongoose Schema Validation
    const candidateDoc = new Product({
      name,
      price,
      category,
      stock,
      description
    });

    const validationError = candidateDoc.validateSync();
    if (validationError) {
      return next(validationError);
    }

    if (getIsConnected()) {
      const savedProduct = await candidateDoc.save();
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: savedProduct
      });
    }

    // In-memory creation
    const newProduct = {
      _id: generateObjectId(),
      name: candidateDoc.name,
      price: candidateDoc.price,
      category: candidateDoc.category,
      stock: candidateDoc.stock,
      description: candidateDoc.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryProducts.push(newProduct);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (err) {
    next(err);
  }
};

// 4. PUT /products/:id (Update product with validation)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (getIsConnected()) {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Product with ID '${id}' was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    }

    // In-memory update
    const index = inMemoryProducts.findIndex(p => p._id.toString() === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID '${id}' was not found.`
      });
    }

    const merged = { ...inMemoryProducts[index], ...updateData };
    const validateDoc = new Product(merged);
    const validationError = validateDoc.validateSync();
    if (validationError) {
      return next(validationError);
    }

    inMemoryProducts[index] = {
      ...merged,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: inMemoryProducts[index]
    });
  } catch (err) {
    next(err);
  }
};

// 5. DELETE /products/:id (Remove product)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Product with ID '${id}' was not found.`
        });
      }
      return res.status(200).json({
        success: true,
        message: `Product with ID '${id}' was successfully deleted.`,
        data: deleted
      });
    }

    // In-memory delete
    const index = inMemoryProducts.findIndex(p => p._id.toString() === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID '${id}' was not found.`
      });
    }

    const [deletedItem] = inMemoryProducts.splice(index, 1);
    res.status(200).json({
      success: true,
      message: `Product with ID '${id}' was successfully deleted.`,
      data: deletedItem
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
