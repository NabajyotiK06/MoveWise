import axios from "axios";

const AdminIncidentPanel = ({ incident, refresh }) => {
  if (!incident) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>Select an incident</h3>
      </div>
    );
  }

  const updateStatus = async (status) => {
    await axios.put(
      `http://localhost:5000/api/incidents/${incident._id}`,
      { status }
    );
    refresh();
  };

  const alertDept = async (dept) => {
    await axios.put(
      `http://localhost:5000/api/incidents/${incident._id}`,
      { alertedDepartments: [dept] }
    );
    alert(`${dept} alerted`);
    refresh();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{incident.type}</h2>

      <p>{incident.description}</p>
      <p>Status: <strong>{incident.status}</strong></p>

      <hr />

      <h4>Update Status</h4>
      <button onClick={() => updateStatus("UNDER_INVESTIGATION")}>
        Under Investigation
      </button>
      <button onClick={() => updateStatus("RESOLVED")}>
        Mark Resolved
      </button>

      <hr />

      <h4>Alert Departments</h4>
      <button onClick={() => alertDept("FIRE")}>Fire</button>
      <button onClick={() => alertDept("EMS")}>EMS</button>
      <button onClick={() => alertDept("POLICE")}>Police</button>
    </div>
  );
};

export default AdminIncidentPanel;
