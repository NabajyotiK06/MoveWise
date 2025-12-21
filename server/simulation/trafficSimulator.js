import fs from "fs";
import path from "path";

const filePath = path.join("simulation", "trafficData.json");

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getCongestionLevel = (vehicles) => {
  if (vehicles < 30) return "LOW";
  if (vehicles < 60) return "MEDIUM";
  return "HIGH";
};

const simulateTraffic = () => {
  const data = JSON.parse(fs.readFileSync(filePath));

  const updatedData = data.map(signal => {
    const vehicles = getRandomInt(10, 90);

    return {
      ...signal,
      vehicles,
      congestion: getCongestionLevel(vehicles),
      aqi: getRandomInt(80, 220),
      avgSpeed: getRandomInt(10, 60),
      lastUpdated: new Date().toISOString()
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
};

export default simulateTraffic;
