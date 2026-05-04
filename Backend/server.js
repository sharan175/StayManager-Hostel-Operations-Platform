import express from "express";
import cors from "cors";
import floorRoutes from "./routes/floorRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rolecreateRoutes from "./routes/rolecreateRoutes.js"
import wardenRoutes from "./routes/wardenRoutes.js"
import feesRoutes from "./routes/feesRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import complaintsRoutes from "./routes/complaintsRoutes.js";
import allocationcheckRoutes  from "./routes/allocationcheckRoutes.js";
import dotenv from "dotenv";
import session from "express-session";

import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    secure: false,       
    httpOnly: true,
    sameSite: "lax",
  }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", floorRoutes);  
app.use("/", roomRoutes);    
app.use("/fees", feesRoutes);
app.use("/student", studentRoutes);
app.use("/complaints", complaintsRoutes);
app.use("/food", foodRoutes);
app.use("/",allocationcheckRoutes)
app.use("/roles",rolecreateRoutes)
app.use("/",wardenRoutes)

const PORT = process.env.PORT||3000 ;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});