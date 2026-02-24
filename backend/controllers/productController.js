const Product = require('../models/Product.js');
const VendorProfile = require('../models/VendorsProfile.js');

// @desc    Add a new product
// @route   POST /api/products
// @access  Vendor only
const addProduct = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const { name, description, price, category, images, stock } = req.body;

    const product = new Product({
      vendorId: vendorProfile._id,
      name,
      description,
      price,
      category,
      images,
      stock,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all products with optional filters
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Vendor only (owner)
const updateProduct = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const allowedUpdates = ['name', 'description', 'price', 'category', 'images', 'stock'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Vendor only (owner)
const deleteProduct = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all products by a specific vendor
// @route   GET /api/products/vendor/:vendorId
// @access  Public
const getProductsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendorExists = await VendorProfile.findById(vendorId);

    if (!vendorExists) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await Product.find({ vendorId });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
};