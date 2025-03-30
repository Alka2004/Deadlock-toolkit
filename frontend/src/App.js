import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DragDropGraph from "./components/DragDropGraph";
import Graph from "react-vis-network-graph";

function App() {
  const [resourceData, setResourceData] = useState("");
  const [dragDropData, setDragDropData] = useState([]);
  const [manualEntry, setManualEntry] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetectDeadlock = async () => {
    setLoading(true);
    try {
      console.log("Sending request to server...");

      const allocationData = manualEntry
        ? JSON.parse(resourceData)
        : dragDropData;

      console.log("Resource Allocation Data:", allocationData);

      const response = await axios.post(
        "http://127.0.0.1:5001/detect-deadlock",
        { resource_allocation: allocationData }
      );

      console.log("Server response:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Error detecting deadlock:", error);
      setResult({
        error: "Failed to connect to the server. Please check if Flask backend is running.",
      });
    }
    setLoading(false);
  };

  const getGraphData = () => {
    if (!result || !result.cycle || result.cycle.length === 0) return null;

    let nodes = [];
    let edges = [];
    let seenNodes = new Set();

    result.cycle.forEach(([from, to]) => {
      if (!seenNodes.has(from)) {
        nodes.push({
          id: from,
          label: from,
          color: from.startsWith("P") ? "#4CAF50" : "#FF5722",
          shape: from.startsWith("P") ? "ellipse" : "box",
          font: { color: "white", size: 18, bold: true },
          borderWidth: 3,
        });
        seenNodes.add(from);
      }
      if (!seenNodes.has(to)) {
        nodes.push({
          id: to,
          label: to,
          color: to.startsWith("P") ? "#4CAF50" : "#FF5722",
          shape: to.startsWith("P") ? "ellipse" : "box",
          font: { color: "white", size: 18, bold: true },
          borderWidth: 3,
        });
        seenNodes.add(to);
      }
      edges.push({
        from,
        to,
        color: { color: "#007BFF", highlight: "#FFC107" },
        arrows: { to: { enabled: true, scaleFactor: 1.2 } },
        width: 2.5,
      });
    });

    console.log("Graph Data:", { nodes, edges });
    return { nodes, edges };
  };


  const graphData = getGraphData();

  return (
    <div className="container mt-5">
      <header className="text-center mb-4">
        <h1 className="display-4">🔗 Deadlock Detection Toolkit</h1>
        <p className="lead text-muted">
          Analyze resource allocation and detect deadlocks visually.
        </p>
      </header>

      {/* About Deadlock Section */}
      <div className="card mb-4 shadow-sm p-4">
        <h2>What is a Deadlock? 🤔</h2>
        <p>
          A deadlock occurs when two or more processes are stuck waiting for
          each other to release resources, creating a cycle with no way to
          proceed. This tool helps visualize deadlocks and detect them in
          resource allocation graphs.
        </p>
      </div>

      <div className="card p-4 shadow-lg">
        <h2 className="mb-3">Choose Input Mode</h2>
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
            placeholder='Enter resource allocation (e.g., [["P1", "R1"], ["P2", "R2"], ["R2", "P1"], ["R1", "P2"]])'
            value={resourceData}
            onChange={(e) => setResourceData(e.target.value)}
          />
        ) : (
          <DragDropGraph onUpdate={setDragDropData} />
        )}

        {/* Detect Deadlock Button */}
        <button
          className="btn btn-primary mt-3 btn-lg"
          onClick={handleDetectDeadlock}
          disabled={loading}
        >
          {loading ? "Processing..." : "Detect Deadlock"}
        </button>
      </div>

      {/* Display Results */}
      {result && (
        <div className="card mt-4 p-4 shadow">
          <h3 className="text-center">Detection Result</h3>
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
                  <h4>Deadlock Graph Visualization:</h4>
                  <Graph
                    graph={graphData}
                    options={{
                      nodes: {
                        shapeProperties: { useBorderWithImage: true },
                        size: 35,
                      },
                      edges: {
                        smooth: {
                          type: "dynamic",
                          roundness: 0.5,
                        },
                      },
                      physics: {
                        enabled: true,
                        stabilization: { iterations: 200 },
                      },
                      layout: { improvedLayout: true },
                      height: "500px",
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

      {/* Footer */}
      <footer className="text-center text-muted mt-5">
        <p>🔗 Built for Deadlock Detection & Visualization</p>
      </footer>
    </div>
  );
}

export default App;
