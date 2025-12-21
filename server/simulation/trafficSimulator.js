import fs from "fs";
import path from "path";

const filePath = path.join("simulation", "trafficData.json");

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;


// In-memory state for traffic signals
let signalsState = [];

const getCongestionLevel = (vehicles) => {
  if (vehicles < 30) return "LOW";
  if (vehicles < 60) return "MEDIUM";
  return "HIGH";
};

// Calculate dynamic duration based on congestion
const calculateGreenDuration = (congestion) => {
  switch (congestion) {
    case "HIGH": return 40; // Seconds
    case "MEDIUM": return 20;
    case "LOW": return 10;
    default: return 15;
  }
};

const simulateTraffic = (io) => {
  // Initial Load
  if (signalsState.length === 0) {
    const rawData = fs.readFileSync(filePath);
    signalsState = JSON.parse(rawData).map(s => ({
      ...s,
      lat: s.location.lat,
      lng: s.location.lng,
      currentLight: "RED", // RED, YELLOW, GREEN
      timer: 0,
      phaseDuration: 10,
      vehicles: s.vehicles || 0
    }));
  }

  // Handle Admin Overrides
  io.on("connection", (socket) => {
    // Admin manually changes a signal
    socket.on("adminSignalUpdate", ({ id, action, duration }) => {
      const signal = signalsState.find(s => s.id === id);
      if (signal) {
        if (action === "forceGreen") {
          signal.currentLight = "GREEN";
          signal.timer = duration || 30;
          signal.phaseDuration = duration || 30;
        } else if (action === "forceRed") {
          signal.currentLight = "RED";
          signal.timer = duration || 30;
          signal.phaseDuration = duration || 30;
        } else if (action === "forceYellow") {
          signal.currentLight = "YELLOW";
          signal.timer = duration || 5;
          signal.phaseDuration = duration || 5;
        }
        // Broadcast immediate update
        io.emit("trafficUpdate", signalsState);
      }
    });
  });

  // Simulation Loop (runs every 1 second)
  setInterval(() => {
    signalsState = signalsState.map(signal => {
      let { currentLight, timer, vehicles } = signal;

      // 1. Simulate Vehicle Flux
      // Randomly add/remove vehicles to simulate flow
      const change = getRandomInt(-5, 8);
      vehicles = Math.max(0, Math.min(100, vehicles + change));

      const congestion = getCongestionLevel(vehicles);

      // 2. Decrement Timer
      if (timer > 0) {
        timer--;
      } else {
        // 3. Switch Light Phase
        if (currentLight === "RED") {
          currentLight = "GREEN";
          timer = calculateGreenDuration(congestion);
        } else if (currentLight === "GREEN") {
          currentLight = "YELLOW";
          timer = 5; // Yellow always 5s
        } else if (currentLight === "YELLOW") {
          currentLight = "RED";
          timer = 20; // Default Red
        }
        signal.phaseDuration = timer;
      }

      return {
        ...signal,
        vehicles,
        congestion,
        currentLight,
        timer,
        lastUpdated: new Date().toISOString()
      };
    });

    // Write to file (optional, for persistence)
    // fs.writeFileSync(filePath, JSON.stringify(signalsState, null, 2));

    // Emit Real-time Update
    io.emit("trafficUpdate", signalsState);

  }, 1000);
};

export default simulateTraffic;
