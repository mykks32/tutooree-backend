import express from "express";
import passport from "passport";
import { StatusCodes } from "http-status-codes";
import { ensureAuthenticated } from "@middlewares/auth"

const {
    UNAUTHORIZED,
    OK,
    INTERNAL_SERVER_ERROR
} = StatusCodes;

const router = express.Router();

// Google OAuth login route
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: true,
    }),
    (req, res) => {
        res.status(OK).json({ message: "Authentication successful", user: req.user });
    }
);

// Logout route (requires authentication)
router.get("/logout", ensureAuthenticated, (req, res) => {
    req.logout((err): any => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(INTERNAL_SERVER_ERROR).json({ message: "Logout failed" });
        }
        res.status(OK).json({ message: "Logged out successfully" });
    });
});

// User info route (requires authentication)
router.get("/user", ensureAuthenticated, (req, res) => {
    res.status(OK).json({ user: req.user });
});

export default router;
