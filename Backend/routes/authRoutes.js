import express from "express";
import passport from "../config/passport.js";
import { attachRole } from "../middleware/roleMiddleware.js";
import {
  completeProfile,
  redirectUser,
  logout,
} from "../controllers/authcontroller.js";
import { isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  redirectUser
);

router.post("/complete-profile", isAuth, completeProfile);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid credentials",
      });
    }

    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Login failed",
        });
      }

      return res.json({
        success: true,
        message: "Login successful",
        user: user,
      });
    });

  })(req, res, next);
});
router.get("/user", attachRole, async (req, res) => {
  if (req.user) {
    return res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,   
      },
    });
  }

  return res.json({ user: null });
});

  
// Logout
router.get("/logout", logout);

export default router;