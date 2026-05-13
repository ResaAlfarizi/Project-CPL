const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const module1Routes = require("./module1/src/routes/index");
const module2Routes = require("./module2/src/routes/index");

app.use(cors());
app.use(express.json());

// Health check (opsional tapi bagus)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Modul 1 & 2 aktif",
  });
});

// Jalur API Modul 1
app.use("/api/v1/m1", module1Routes);

// Jalur API Modul 2
app.use("/api/v1/m2", module2Routes);

// Handle route tidak ditemukan (optional tapi penting)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend Modul 1 dan Modul 2 aktif di port ${PORT}`);
});