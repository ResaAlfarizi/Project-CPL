const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./auth/auth.routes");
const db = require("./config/db");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});