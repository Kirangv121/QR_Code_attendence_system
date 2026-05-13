import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 25,
      minPoolSize: 2,
      family: 4,
    });
    console.log(`[MongoDB] connected database="${mongoose.connection.name}"`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "Check: (1) Atlas Network Access IP allowlist includes your PC, (2) MONGODB_URI user/password and database name attendanceDB, (3) if mongodb+srv DNS fails, use the standard (non-SRV) connection string from Atlas Connect."
    );
    throw err;
  }
}
