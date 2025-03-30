import networkx as nx
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def detect_deadlock(resource_allocation):
    G = nx.DiGraph()

    for first, second in resource_allocation:
        G.add_edge(first, second)


    process_holding = {}  # Tracks which process holds which resources
    process_waiting = {}  # Tracks processes waiting for resources


    for first, second in resource_allocation:
        G.add_edge(first, second)  # Process -> Resource (request) or Resource -> Process (allocation)

        if first.startswith("P") and second.startswith("R"):  # Process requests resource
            process_waiting.setdefault(first, []).append(second)
        elif first.startswith("R") and second.startswith("P"):  # Resource assigned to process
            process_holding.setdefault(second, []).append(first)

    # --- 1. Mutual Exclusion ---
    mutual_exclusion = any(len(holders) > 1 for holders in process_holding.values())

    # --- 2. Hold and Wait ---
    hold_and_wait = any(proc in process_holding and proc in process_waiting for proc in process_holding)

    # --- 3. No Preemption ---
    no_preemption = hold_and_wait  # If a process is holding and waiting, it implies no preemption

    # --- 4. Circular Wait ---
    circular_wait = False
    cycle = []

    # Check cycle
    try:
        cycle = nx.find_cycle(G, orientation="original")
        return True, cycle
        
    except nx.NetworkXNoCycle:
        return False, []
        pass  # No cycle found

    deadlock_detected = mutual_exclusion and hold_and_wait and no_preemption and circular_wait
    return {
        "deadlock_detected": deadlock_detected,
        "cycle": cycle,
        "conditions": {
            "Mutual Exclusion": mutual_exclusion,
            "Hold and Wait": hold_and_wait,
            "No Preemption": no_preemption,
            "Circular Wait": circular_wait,
        },
    }

@app.route('/detect-deadlock', methods=['POST'])
def detect_deadlock_api():
    data = request.json
    resource_allocation = data.get("resource_allocation", [])

    deadlock, cycle = detect_deadlock(resource_allocation)

    response = {  
        "deadlock_detected": deadlock,  
        "cycle": cycle  
    }
    return jsonify(response)  # Ensure proper JSON format



if __name__ == '__main__':
    app.run(debug=True, port=5001)