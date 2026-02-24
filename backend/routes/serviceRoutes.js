const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const {
  addService,
  getAllServices,
  getServicesByVendor,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController.js');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 vendorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only vendors can create services
 */
router.post('/', protect, authorizeRoles('vendor'), addService);

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
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of services per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter services by category
 *     responses:
 *       200:
 *         description: Successfully retrieved all services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   vendorId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /services/vendor/{vendorId}:
 *   get:
 *     summary: Get services by vendor
 *     description: Retrieve all services offered by a specific vendor
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vendor
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   vendorId:
 *                     type: string
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get('/vendor/:vendorId', getServicesByVendor);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     description: Retrieve a specific service by its ID
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 category:
 *                   type: string
 *                 vendorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     description: Update service details. Only the vendor who created the service can update it.
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
 *         description: The ID of the service to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Advanced Web Development"
 *               description:
 *                 type: string
 *                 example: "Updated professional web development services"
 *               price:
 *                 type: number
 *                 example: 1500
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               duration:
 *                 type: string
 *                 example: "3 weeks"
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only the vendor owner can update
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, authorizeRoles('vendor'), updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     description: Delete a service from the catalog. Only the vendor who created the service can delete it.
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
 *         description: The ID of the service to delete
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Service deleted successfully"
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only the vendor owner can delete
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorizeRoles('vendor'), deleteService);

module.exports = router;