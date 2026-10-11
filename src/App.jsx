
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8081/api";

const sections = {
  Dashboard: [],
  Patients: [
    { name: "name", label: "Patient Name" },
    { name: "age", label: "Age", type: "number" },
    { name: "gender", label: "Gender" },
    { name: "disease", label: "Disease" },
  ],
  Doctors: [
    { name: "name", label: "Doctor Name" },
    { name: "specialization", label: "Specialization" },
    { name: "phone", label: "Phone Number" },
    { name: "availability", label: "Availability" },
  ],
  Appointments: [
    { name: "patientName", label: "Patient Name" },
    { name: "doctorName", label: "Doctor Name" },
    { name: "date", label: "Appointment Date", type: "date" },
    { name: "time", label: "Appointment Time", type: "time" },
    { name: "status", label: "Status" },
  ],
};

const endpoints = {
  Patients: "patients",
  Doctors: "doctors",
  Appointments: "appointments",
};

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [data, setData] = useState({
    Patients: [],
    Doctors: [],
    Appointments: [],
  });
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(section) {
    try {
      const response = await fetch(`${API}/${endpoints[section]}`);
      if (!response.ok) throw new Error("Could not load records");
      const result = await response.json();

      setData((old) => ({ ...old, [section]: result }));
      setError("");
    } catch (e) {
      setError(
        "Unable to connect to the backend. Check that Spring Boot is running and the API endpoint exists."
      );
    }
  }

  useEffect(() => {
    load("Patients");
    load("Doctors");
    load("Appointments");
  }, []);

  function navigate(section) {
    setPage(section);
    setForm({});
    setMessage("");
    setError("");
    if (endpoints[section]) load(section);
  }

  async function addRecord(e) {
    e.preventDefault();
    const fields = sections[page];
    const body = {};

    fields.forEach(({ name, type }) => {
      body[name] =
        type === "number" ? Number(form[name]) : form[name] || "";
    });

    try {
      const response = await fetch(`${API}/${endpoints[page]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save record");
      }

      setForm({});
      setMessage(`${page.slice(0, -1)} added successfully!`);
      await load(page);
    } catch (e) {
      setError(
        "Could not save the record. Check the backend controller and database."
      );
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Do you want to delete this record?")) return;

    try {
      const response = await fetch(
        `${API}/${endpoints[page]}/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");

      setMessage("Record deleted successfully!");
      await load(page);
    } catch {
      setError("Delete failed. Check that the DELETE API exists.");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🏥 MediCare</h2>

        {["Dashboard", "Patients", "Doctors", "Appointments"].map(
          (item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => navigate(item)}
            >
              {item}
            </button>
          )
        )}
      </aside>

      <main className="main">
        <h1>{page}</h1>
        <p>Hospital Management System</p>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {page === "Dashboard" ? (
          <div className="stats">
            {Object.keys(endpoints).map((section) => (
              <div className="card" key={section}>
                <h3>Total {section}</h3>
                <h1>{data[section].length}</h1>
                <button onClick={() => navigate(section)}>
                  Manage {section}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <form className="form" onSubmit={addRecord}>
              <h2>Add {page.slice(0, -1)}</h2>

              {sections[page].map((field) => (
                <input
                  key={field.name}
                  type={field.type || "text"}
                  placeholder={field.label}
                  aria-label={field.label}
                  value={form[field.name] || ""}
                  required
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.name]: e.target.value,
                    })
                  }
                />
              ))}

              <button type="submit">Save {page.slice(0, -1)}</button>
            </form>

            <div className="table-card">
              <h2>All {page}</h2>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      {sections[page].map((field) => (
                        <th key={field.name}>{field.label}</th>
                      ))}
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data[page].map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        {sections[page].map((field) => (
                          <td key={field.name}>
                            {item[field.name]}
                          </td>
                        ))}
                        <td>
                          <button
                            className="delete"
                            onClick={() => deleteRecord(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {data[page].length === 0 && (
                      <tr>
                        <td colSpan={sections[page].length + 2}>
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
