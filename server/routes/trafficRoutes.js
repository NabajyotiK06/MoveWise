import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const filePath = path.join("simulation", "trafficData.json");

router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

export default router;
