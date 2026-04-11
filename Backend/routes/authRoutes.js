import express from "express";
import passport from "../config/passport.js";
import {
  completeProfile,
  redirectUser,
  logout,
} from "./controllers/authcontroller.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  redirectUser
);

router.post("/complete-profile", isAuth, completeProfile);

// Logout
router.get("/logout", logout);

export default router;