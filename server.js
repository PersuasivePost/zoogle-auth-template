// server.js - Complete Zoogle Backend Setup
// Copy this entire file into your project!

import express from "express";
import zoogleModule from "zoogle";
import dotenv from "dotenv";

const googleAuth = zoogleModule.default || zoogleModule;

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve your HTML files

// ============================================
// ZOOGLE CONFIGURATION - COPY THIS SECTION
// ============================================
googleAuth.configure({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:
      process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d",
  },

  // Database integration - CUSTOMIZE THIS
  async findOrCreateUser(profile) {
    console.log("📝 User logged in:", profile);

    // OPTION 1: If you have a database (MongoDB example)
    // const User = require('./models/User');
    // return await User.findOneAndUpdate(
    //   { googleId: profile.id },
    //   {
    //     googleId: profile.id,
    //     email: profile.email,
    //     name: profile.name,
    //     picture: profile.picture,
    //     lastLogin: new Date()
    //   },
    //   { upsert: true, new: true }
    // );

    // OPTION 2: Simple in-memory storage (for testing)
    return {
      id: profile.id,
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    };
  },

  // Optional: Custom success handler
  onSuccess: (user, token, req, res) => {
    // Redirect to your frontend with token
    res.redirect(`/dashboard.html?token=${token}`);
  },

  // Optional: Custom error handler
  onError: (error, req, res) => {
    console.error("❌ Auth error:", error);
    res.redirect("/login.html?error=auth_failed");
  },
});

// Mount Zoogle auth routes
app.use("/auth/google", googleAuth.routes);

// ============================================
// EXAMPLE PROTECTED ROUTES
// ============================================

// Public route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Protected route example
app.get("/profile", googleAuth.middleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Protected route with custom logic
app.get("/dashboard", googleAuth.middleware, (req, res) => {
  res.json({
    success: true,
    message: `Welcome back, ${req.user.name}!`,
    user: req.user,
  });
});

// ============================================
// SERVE STATIC HTML PAGES
// ============================================

app.get("/", (req, res) => {
  res.sendFile("login.html", { root: "./public" });
});

app.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "./public" });
});

app.get("/signup", (req, res) => {
  res.sendFile("signup.html", { root: "./public" });
});

app.get("/dashboard", (req, res) => {
  res.sendFile("dashboard.html", { root: "./public" });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ✅ Server running on http://localhost:${PORT}
  
  📍 Routes:
     - Login:    http://localhost:${PORT}/login
     - Signup:   http://localhost:${PORT}/signup
     - Dashboard: http://localhost:${PORT}/dashboard
     
  🔐 Google Auth:
     - Start:    http://localhost:${PORT}/auth/google/login
     - Callback: http://localhost:${PORT}/auth/google/callback
     
  🛡️  Protected APIs:
     - Profile:  http://localhost:${PORT}/profile
     - Dashboard: http://localhost:${PORT}/dashboard
  `);
});
