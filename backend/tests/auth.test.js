const request = require("supertest");
const app = require("../server"); // adjust to '../app' if needed

describe("Auth Routes", () => {
  let token;
  let userId;

  const testUser = {
    name: "Test Customer",
    email: `testuser_${Date.now()}@example.com`, // unique email per run
    password: "Password123!",
    role: "customer",
  };

  // ─── Register ────────────────────────────────────────────────────────────────

  test("POST /api/auth/register — should register a new customer", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("role", "customer");

    // Persist for subsequent tests
    token = res.body.token;
    userId = res.body.user._id ?? res.body.user.id;
  });

  test("POST /api/auth/register — should fail with duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser); // same payload → duplicate email

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  // ─── Login ───────────────────────────────────────────────────────────────────

  test("POST /api/auth/login — should login successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    // Refresh token in case the register token has a shorter TTL
    token = res.body.token;
  });

  test("POST /api/auth/login — should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword!",
    });

    expect(res.statusCode).toBe(401);
  });

  // ─── Protected route /me ─────────────────────────────────────────────────────

  test("GET /api/auth/me — should return user data with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  test("GET /api/auth/me — should fail without token", async () => {
    const res = await request(app).get("/api/auth/me");
    // No Authorization header

    expect(res.statusCode).toBe(401);
  });
});
