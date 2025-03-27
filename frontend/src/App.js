import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DragDropGraph from "./components/DragDropGraph";
import Graph from "react-vis-network-graph";

function App() {
  const [resourceData, setResourceData] = useState(""); // Stores manual input
  const [dragDropData, setDragDropData] = useState([]); // Stores drag & drop allocations
  const [manualEntry, setManualEntry] = useState(true); // Toggle input mode
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetectDeadlock = async () => {
    setLoading(true);
    try {
      console.log("Sending request to server...");

      // Select data based on input mode
      const allocationData = manualEntry
        ? JSON.parse(resourceData) // Manual Entry (parse input)
        : dragDropData; // Drag & Drop Data

      console.log("Resource Allocation Data:", allocationData);

      const response = await axios.post("http://127.0.0.1:5001/detect-deadlock", {
        resource_allocation: allocationData,
      });

      console.log("Server response:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Error detecting deadlock:", error);

      if (error.response) {
        console.error("Server Error Response:", error.response.data);
      }

      setResult({ error: "Failed to connect to the server. Please check if Flask backend is running." });
    }
    setLoading(false);
  };

  // Function to prepare graph visualization data
  const getGraphData = () => {
    if (!result || !result.cycle || result.cycle.length === 0) return null;
  
    let nodes = [];
    let edges = [];
    let seenNodes = new Set();
  
    result.cycle.forEach(([from, to]) => {
      if (!seenNodes.has(from)) {
        nodes.push({ id: from, label: from, color: "lightblue" });
        seenNodes.add(from);
      }
      if (!seenNodes.has(to)) {
        nodes.push({ id: to, label: to, color: "lightcoral" });
        seenNodes.add(to);
      }
      edges.push({ from, to, color: "red" });
    });
  
    console.log("Graph Data:", { nodes, edges });
    return { nodes, edges };
  };
  

  const graphData = getGraphData();

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">🔗 Deadlock Detection Toolkit</h1>

      <div className="card p-4 shadow-lg">
        {/* Mode Selection */}
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            id="manualEntry"
            checked={manualEntry}
            onChange={() => setManualEntry(true)}
          />
          <label className="form-check-label" htmlFor="manualEntry">
            Manual Entry
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            id="dragDrop"
            checked={!manualEntry}
            onChange={() => setManualEntry(false)}
          />
          <label className="form-check-label" htmlFor="dragDrop">
            Drag & Drop Mode
          </label>
        </div>

        {/* Input Fields */}
        {manualEntry ? (
          <textarea
            className="form-control mt-3"
            rows="5"
            placeholder='Enter resource allocation (e.g., [["P1", "R1"], ["P2", "R2"], ["P3", "R1"], ["P1", "P3"]])'
            value={resourceData}
            onChange={(e) => setResourceData(e.target.value)}
          />
        ) : (
          <DragDropGraph onUpdate={setDragDropData} />
        )}

        {/* Detect Deadlock Button */}
        <button
          className="btn btn-primary mt-3"
          onClick={handleDetectDeadlock}
          disabled={loading}
        >
          {loading ? "Processing..." : "Detect Deadlock"}
        </button>
      </div>

      {/* Display Results */}
      {result && (
        <div className="card mt-4 p-4 shadow">
          <h3 className="text-center">Result</h3>
          {result.error ? (
            <div className="alert alert-danger">{result.error}</div>
          ) : result.deadlock_detected ? (
            <>
              <div className="alert alert-danger">
                ⚠️ Deadlock detected! <br />
                <strong>Cycle:</strong> {JSON.stringify(result.cycle)}
              </div>
              {graphData && (
                <div className="mt-3">
                  <h4>Deadlock Graph:</h4>
                  <Graph
                    graph={graphData}
                    options={{
                      nodes: { shape: "circle", font: { size: 16 } },
                      edges: { arrows: "to", length: 200 },
                      height: "400px",
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-success">✅ No deadlock detected.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
