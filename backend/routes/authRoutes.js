import express from "express";
import passport from "../config/passport.js";
import generateTokenAndSetCookie from "../utils/helpers/GenerateTokenAndSetCookie.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:3000/auth?error=GoogleAuthFailed");
    }

    generateTokenAndSetCookie(req.user._id, res);

    res.redirect("http://localhost:3000/auth?success=true");
  }
);

export default router;
