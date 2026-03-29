const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware.js");
const {
  addService,
  getAllServices,
  getServicesByVendor,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceCategories,
  getServicesByCategory,
} = require("../controllers/serviceController.js");
const { upload } = require("../config/cloudinary.js");

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     description: Add a new service to the catalog. Only vendors can create services.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Web Development"
 *               description:
 *                 type: string
 *                 example: "Professional web development services"
 *               price:
 *                 type: number
 *                 example: 1000
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               duration:
 *                 type: string
 *                 example: "2 weeks"
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only vendors can create services
 */
router.post(
  "/",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  addService
);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     description: Retrieve a list of all available services
 *     tags:
 *       - Services
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved all services
 *       500:
 *         description: Server error
 */
router.get("/", getAllServices);

// ── IMPORTANT: These static routes MUST be before /:id ──────────────────────

// @desc  Get all unique service categories
// @route GET /api/services/categories
// @access Public
router.get("/categories", getServiceCategories);

// @desc  Get services filtered by category
// @route GET /api/services/category/:category
// @access Public
router.get("/category/:category", getServicesByCategory);

// @desc  Get vendor's own services
// @route GET /api/services/my/list
// @access Vendor only
router.get("/my/list", protect, authorizeRoles("vendor"), getMyServices);

// @desc  Get all services by a specific vendor
// @route GET /api/services/vendor/:vendorId
// @access Public
router.get("/vendor/:vendorId", getServicesByVendor);

// ── Dynamic :id routes MUST come after all static routes ────────────────────

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getServiceById);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  updateService
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, authorizeRoles("vendor"), deleteService);

module.exports = router;