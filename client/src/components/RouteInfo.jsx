import axios from "axios";

const RouteInfo = ({ start, end, routeData, setRouteData }) => {
  const calculate = async (type) => {
    if (!start || !end) {
      alert("Select start and destination");
      return;
    }

    const res = await axios.post("http://localhost:5000/api/route-planner", {
      start,
      end,
      type
    });

    setRouteData(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Route Planner</h2>

      <p>
        Start: {start ? "Selected" : "Not selected"} <br />
        Destination: {end ? "Selected" : "Not selected"}
      </p>

      <button onClick={() => calculate("shortest")}>
        Find Shortest Route
      </button>

      <button onClick={() => calculate("optimal")}>
        Find Optimal Route
      </button>

      {routeData && (
        <>
          <hr />
          <h3>Route Details</h3>
          <p>Type: {routeData.routeType}</p>
          <p>Distance: {routeData.distance} km</p>
          <p>Estimated Time: {routeData.estimatedTime} min</p>
          <p>Signals Crossed: {routeData.signalsCrossed}</p>
        </>
      )}
    </div>
  );
};

export default RouteInfo;
