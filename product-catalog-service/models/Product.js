const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number or zero']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: ['Electronics', 'Books', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'],
        message: '{VALUE} is not a valid category. Allowed: Electronics, Books, Clothing, Home, Beauty, Sports, Other'
      }
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Virtual index for searching
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
