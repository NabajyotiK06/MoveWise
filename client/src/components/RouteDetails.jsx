const RouteDetails = ({
  routes,
  selectedRouteIndex,
  setSelectedRouteIndex,
  fetchRoutes
}) => {
  if (!routes.length) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>Route Planner</h3>
        <button onClick={() => fetchRoutes("shortest")}>
          Find Shortest Route
        </button>
        <button onClick={() => fetchRoutes("optimal")}>
          Find Optimal Route
        </button>
      </div>
    );
  }

  const route = routes[selectedRouteIndex];

  return (
    <div style={{ padding: "20px" }}>
      <h3>Routes</h3>

      {routes.map((r, i) => (
        <div
          key={i}
          onClick={() => setSelectedRouteIndex(i)}
          style={{
            cursor: "pointer",
            padding: "8px",
            marginBottom: "6px",
            background: i === selectedRouteIndex ? "#e0f2fe" : "#f8fafc"
          }}
        >
          Route {i + 1}: {r.distance} km, {r.duration} min
        </div>
      ))}

      <hr />
      <h4>Turn-by-Turn Directions</h4>

      <ol>
        {route.steps.map((s, i) => (
          <li key={i}>
            {s.maneuver.instruction} ({Math.round(s.distance)} m)
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RouteDetails;
