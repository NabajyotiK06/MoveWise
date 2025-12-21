import express from "express";
import Incident from "../models/Incident.js";

const router = express.Router();

// GET ALL INCIDENTS (ADMIN)
router.get("/", async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json(incidents);
});

// CREATE INCIDENT (USER)
router.post("/", async (req, res) => {
  const incident = await Incident.create(req.body);
  res.status(201).json(incident);
});

// UPDATE INCIDENT STATUS (ADMIN)
router.put("/:id", async (req, res) => {
  const updated = await Incident.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

export default router;
