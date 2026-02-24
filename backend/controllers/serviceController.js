const Service = require('../models/Service.js');
const VendorProfile = require('../models/VendorsProfile.js');

// @desc    Add a new service
// @route   POST /api/services
// @access  Vendor only
const addService = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const { name, description, price, category, duration, availability, images } = req.body;

    const service = new Service({
      vendorId: vendorProfile._id,
      name,
      description,
      price,
      category,
      duration,
      availability,
      images,
    });

    const savedService = await service.save();

    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all services with optional filters
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res) => {
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

    const services = await Service.find(filter);

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Vendor only (owner)
const updateService = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.vendorId.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const allowedUpdates = ['name', 'description', 'price', 'category', 'duration', 'availability', 'images'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    const updatedService = await service.save();

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Vendor only (owner)
const deleteService = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.vendorId.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all services by a specific vendor
// @route   GET /api/services/vendor/:vendorId
// @access  Public
const getServicesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendorExists = await VendorProfile.findById(vendorId);

    if (!vendorExists) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const services = await Service.find({ vendorId });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByVendor,
};