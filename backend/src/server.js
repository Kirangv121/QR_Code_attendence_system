import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

async function main() {
  await connectDb();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
