import express from "express";
import cors from "cors";
import floorRoutes from "./routes/floorRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import foodmenuRoutes from "./routes/foodmenuRoutes.js";
import foodlistRoutes from "./routes/foodlistRoutes.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rolecreateRoutes from "./routes/rolecreateRoutes.js"
import dotenv from "dotenv";
import session from "express-session";
dotenv.config();

const app = express();

app.use(express.json());
app.set("view engine", "ejs");
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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);



app.use("/api", floorRoutes);
app.use("/api", roomRoutes);
app.use("/api",foodmenuRoutes);
app.use("/api",foodlistRoutes);
app.use("/api",rolecreateRoutes)
app.get("/test", (req, res) => {
  res.json({ message: "Server working" });
});
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});