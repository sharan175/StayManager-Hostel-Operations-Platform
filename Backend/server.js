import express from "express";
import cors from "cors";
import floorRoutes from "./routes/floorRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", floorRoutes);
app.use("/api", roomRoutes);
app.get("/test", (req, res) => {
  res.json({ message: "Server working" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});