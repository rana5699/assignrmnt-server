require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

// assignmentserver56
// 6Nqf2ULLwbBKeiVD

app.listen(PORT, () => {
  console.log(`Server running at this port http://localhost:${PORT}`);
});
