// const express = require("express");
// const router = express.Router();
// const {
//   createVendorProfile,
//   getVendorProfile,
//   updateVendorProfile,
//   getAllApprovedVendors,
// } = require("../controllers/vendorController");
// const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// /**
//  * @swagger
//  * /vendors:
//  *   get:
//  *     summary: Get all approved vendor profiles
//  *     tags: [Vendors]
//  *     responses:
//  *       200:
//  *         description: List of all approved vendors
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 count:
//  *                   type: integer
//  *                   example: 3
//  *                 vendors:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/VendorProfile'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.get("/", getAllApprovedVendors);

// /**
//  * @swagger
//  * /vendors:
//  *   post:
//  *     summary: Create a vendor profile
//  *     tags: [Vendors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - storeName
//  *             properties:
//  *               storeName:
//  *                 type: string
//  *                 example: Tech Haven
//  *               description:
//  *                 type: string
//  *                 example: Best gadgets in town
//  *               category:
//  *                 type: string
//  *                 example: Electronics
//  *               logo:
//  *                 type: string
//  *                 example: https://example.com/logo.png
//  *     responses:
//  *       201:
//  *         description: Vendor profile created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 profile:
//  *                   $ref: '#/components/schemas/VendorProfile'
//  *       400:
//  *         description: Vendor profile already exists for this user
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       401:
//  *         description: Not authorized
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: Access denied — insufficient role
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.post(
//   "/",
//   protect,
//   authorizeRoles("vendor", "admin"),
//   createVendorProfile
// );

// /**
//  * @swagger
//  * /vendors/{id}:
//  *   get:
//  *     summary: Get a vendor profile by ID
//  *     tags: [Vendors]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The vendor profile ID
//  *         example: 64a1f2c3e4b5d6e7f8a9b0c2
//  *     responses:
//  *       200:
//  *         description: Vendor profile found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 profile:
//  *                   $ref: '#/components/schemas/VendorProfile'
//  *       404:
//  *         description: Vendor profile not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.get("/:id", getVendorProfile);

// /**
//  * @swagger
//  * /vendors/{id}:
//  *   put:
//  *     summary: Update a vendor profile
//  *     tags: [Vendors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The vendor profile ID
//  *         example: 64a1f2c3e4b5d6e7f8a9b0c2
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               storeName:
//  *                 type: string
//  *                 example: Tech Haven Updated
//  *               description:
//  *                 type: string
//  *                 example: Updated store description
//  *               category:
//  *                 type: string
//  *                 example: Computers
//  *               logo:
//  *                 type: string
//  *                 example: https://example.com/new-logo.png
//  *               isApproved:
//  *                 type: boolean
//  *                 example: true
//  *                 description: Admin only — ignored for vendor role
//  *     responses:
//  *       200:
//  *         description: Vendor profile updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 profile:
//  *                   $ref: '#/components/schemas/VendorProfile'
//  *       401:
//  *         description: Not authorized
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: Access denied — not the profile owner or insufficient role
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Vendor profile not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.put(
//   "/:id",
//   protect,
//   authorizeRoles("vendor", "admin"),
//   updateVendorProfile
// );

// module.exports = router;




const express = require("express");
const router = express.Router();
const {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getAllApprovedVendors,
} = require("../controllers/vendorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const VendorProfile = require("../models/VendorsProfile");

/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get all approved vendor profiles
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of all approved vendors
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
 */
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "admin"),
  createVendorProfile
);

/**
 * @swagger
 * /vendors/profile:
 *   get:
 *     summary: Get the vendor profile for the currently logged-in vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile for the logged-in user
 *       404:
 *         description: Vendor profile not found
 *       500:
 *         description: Server error
 */
// ⚠️ MUST be defined before /:id so Express doesn't treat "profile" as an id param
router.get("/profile", protect, async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({
      userId: req.user.id,
    }).populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json({
      _id: profile._id,
      vendorId: profile._id,
      storeName: profile.storeName,
      businessName: profile.storeName,
      description: profile.description,
      category: profile.category,
      logo: profile.logo,
      isApproved: profile.isApproved,
      userId: profile.userId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get a vendor profile by ID
 *     tags: [Vendors]
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
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "admin"),
  updateVendorProfile
);

module.exports = router;