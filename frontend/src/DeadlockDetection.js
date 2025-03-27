import React, { useState } from "react";
import axios from "axios";

function DeadlockDetection() {
  const [deadlockDetected, setDeadlockDetected] = useState(null);
  const [cycle, setCycle] = useState([]);

  const checkDeadlock = async () => {
    const data = {
      resource_allocation: [
        ["P1", "R1"], 
        ["P2", "R2"], 
        ["P3", "R1"], 
        ["P1", "P3"]  // This creates a cycle
      ]
    };

    const response = await axios.post("http://localhost:5001/detect-deadlock", data);
    setDeadlockDetected(response.data.deadlock_detected);
    setCycle(response.data.cycle);
  };

  return (
    <div>
      <h2>Deadlock Detection</h2>
      <button onClick={checkDeadlock}>Check for Deadlock</button>
      {deadlockDetected !== null && (
        <p>
          {deadlockDetected ? 
            `Deadlock detected! Cycle: ${JSON.stringify(cycle)}` 
            : "No deadlock detected."}
        </p>
      )}
    </div>
  );
}

export default DeadlockDetection;
