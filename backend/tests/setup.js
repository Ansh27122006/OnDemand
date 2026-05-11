const mongoose = require("mongoose");

// Use a separate test database
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});
