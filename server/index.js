import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import trafficRoutes from "./routes/trafficRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bulletinRoutes from "./routes/bulletinRoutes.js";

import simulateTraffic from "./simulation/trafficSimulator.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));



app.use("/api/auth", authRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bulletin", bulletinRoutes);

setInterval(simulateTraffic, 5000);

app.listen(5000, () => console.log("Server running on port 5000"));
