function bankersAlgorithm(available, max, allocation, request, process) {
    const numResources = available.length;
    const numProcesses = max.length;

    let work = [...available];
    let finish = new Array(numProcesses).fill(false);

    // Check if request can be granted
    for (let i = 0; i < numResources; i++) {
        if (request[i] > max[process][i] || request[i] > available[i]) {
            return { status: "Denied", reason: "Request exceeds available resources or max claim" };
        }
    }

    // Pretend to allocate resources
    for (let i = 0; i < numResources; i++) {
        available[i] -= request[i];
        allocation[process][i] += request[i];
    }

    // Check for a safe sequence
    let safeSequence = [];
    while (safeSequence.length < numProcesses) {
        let found = false;
        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i] && max[i].every((m, j) => m - allocation[i][j] <= work[j])) {
                for (let j = 0; j < numResources; j++) work[j] += allocation[i][j];
                finish[i] = true;
                safeSequence.push(i);
                found = true;
            }
        }
        if (!found) return { status: "Deadlock detected", sequence: safeSequence };
    }
    
    return { status: "Safe", sequence: safeSequence };
}

module.exports = bankersAlgorithm;
