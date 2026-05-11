const request = require("supertest");
const app = require("../server");
const VendorProfile = require("../models/VendorsProfile");

describe("Product Routes", () => {
  let vendorToken;
  let productId;

  const vendorData = {
    name: "Test Vendor",
    email: `testvendor_${Date.now()}@example.com`,
    password: "Password123!",
    role: "vendor",
    category: "Other",
  };

  const productPayload = {
    name: "Test Product",
    description: "A product created during tests",
    price: 19.99,
    category: "Test",
    stock: 10,
  };

  beforeAll(async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(vendorData);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty("token");

    vendorToken = registerRes.body.token;
    const userId = registerRes.body.user.id || registerRes.body.user._id;

    const vendorProfile = await VendorProfile.findOne({ userId });
    expect(vendorProfile).toBeDefined();

    await VendorProfile.findByIdAndUpdate(vendorProfile._id, {
      isApproved: true,
    });
  }, 30000);

  test("GET /api/products — should return array of products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/products — should create product with vendor token", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send(productPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", productPayload.name);

    productId = res.body._id;
  });

  test("POST /api/products — should fail without auth token", async () => {
    const res = await request(app).post("/api/products").send(productPayload);

    expect(res.statusCode).toBe(401);
  });

  test("GET /api/products/:id — should return single product", async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", productId);
  });

  test("DELETE /api/products/:id — should delete product", async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${vendorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
