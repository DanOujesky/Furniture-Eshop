import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
