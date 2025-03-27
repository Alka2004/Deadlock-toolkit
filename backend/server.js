const bankersAlgorithm = require("./bankersAlgorithm");

app.post("/check-safety", (req, res) => {
  const { available, max, allocation, request, process } = req.body;
  const result = bankersAlgorithm(available, max, allocation, request, process);
  res.json(result);
});
