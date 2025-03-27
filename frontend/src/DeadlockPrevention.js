import React, { useState } from "react";
import axios from "axios";

function DeadlockPrevention() {
  const [result, setResult] = useState("");

  const checkSafety = async () => {
    const data = {
      available: [3, 3, 2],
      max: [[7, 5, 3], [3, 2, 2], [9, 0, 2]],
      allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2]],
      request: [1, 0, 2],
      process: 1,
    };

    const response = await axios.post("http://localhost:5000/check-safety", data);
    setResult(response.data.status);
  };

  return (
    <div>
      <h2>Deadlock Prevention</h2>
      <button onClick={checkSafety}>Check Safety</button>
      <p>Result: {result}</p>
    </div>
  );
}

export default DeadlockPrevention;
