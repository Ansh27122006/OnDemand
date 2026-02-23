const express = require("express");
const router = express.Router();
const {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getAllApprovedVendors,
} = require("../controllers/vendorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get all approved vendor profiles
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of all approved vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 vendors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendorProfile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAllApprovedVendors);

/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: Tech Haven
 *               description:
 *                 type: string
 *                 example: Best gadgets in town
 *               category:
 *                 type: string
 *                 example: Electronics
 *               logo:
 *                 type: string
 *                 example: https://example.com/logo.png
 *     responses:
 *       201:
 *         description: Vendor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/VendorProfile'
 *       400:
 *         description: Vendor profile already exists for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied — insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "admin"),
  createVendorProfile
);

/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get a vendor profile by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vendor profile ID
 *         example: 64a1f2c3e4b5d6e7f8a9b0c2
 *     responses:
 *       200:
 *         description: Vendor profile found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/VendorProfile'
 *       404:
 *         description: Vendor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", getVendorProfile);

/**
 * @swagger
 * /vendors/{id}:
 *   put:
 *     summary: Update a vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vendor profile ID
 *         example: 64a1f2c3e4b5d6e7f8a9b0c2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: Tech Haven Updated
 *               description:
 *                 type: string
 *                 example: Updated store description
 *               category:
 *                 type: string
 *                 example: Computers
 *               logo:
 *                 type: string
 *                 example: https://example.com/new-logo.png
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *                 description: Admin only — ignored for vendor role
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/VendorProfile'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied — not the profile owner or insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Vendor profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "admin"),
  updateVendorProfile
);

module.exports = router;
