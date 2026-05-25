// ================= CORE IMPORTS =================
// These are the main libraries that power the backend
// Express = server framework
// CORS = allows frontend to talk to backend
// JWT = authentication tokens
// bcrypt = password hashing (security)
// axios = API calls to external services
// dotenv = loads environment variables
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
require("dotenv").config();

// Database connection (PostgreSQL pool)
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
// Middleware = code that runs BEFORE every request

// Allows frontend to send JSON data
app.use(express.json());

// CORS = security rule that defines who can call this backend
// Without this, frontend (Vercel) would be blocked
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local development
      "https://crypto-backend-b5dhw5cra-crypto-gilad.vercel.app", // production frontend
    ],
    credentials: true,
  })
);

// ================= UTILITIES =================
// Regular expression to validate email format
// Prevents invalid email inputs before hitting database
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ================= AUTH MIDDLEWARE =================
// This protects routes that require login
// It checks if the user has a valid JWT token

function authMiddleware(req, res, next) {
  // Extract token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If no token → user is not logged in
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request so next functions can use it
    req.user = decoded;

    next(); // continue to route
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ================= BASIC HEALTH CHECK =================
// Used to test if backend is alive
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ================= AUTH ROUTES =================

// REGISTER NEW USER
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Step 1: validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Step 2: check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Step 3: hash password (NEVER store plain passwords)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: insert user into database
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );

    res.json({
      message: "User created",
      userId: result.rows[0].id,
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN USER
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: find user in DB
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Step 2: compare password with hashed password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Step 3: create JWT token (used for authentication in frontend)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ================= USER INFO =================
// Returns logged-in user info (protected route)
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ================= ONBOARDING =================
// Saves user preferences after signup/login
// This is used to personalize dashboard experience
app.post("/onboarding", authMiddleware, async (req, res) => {
  const { assets, investorType, contentTypes } = req.body;

  try {
    // Validate required fields
    if (!assets || !investorType || !contentTypes) {
      return res.status(400).json({
        error: "Missing onboarding fields",
      });
    }

    const preferences = {
      assets,
      investorType,
      contentTypes,
    };

    // Insert or update user preferences
    // ON CONFLICT = "upsert" (insert or update)
    const result = await pool.query(
      `
      INSERT INTO user_preferences (user_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET preferences = $2
      RETURNING *
      `,
      [req.user.userId, preferences]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ONBOARDING ERROR:", err);
    res.status(500).json({ error: "Failed to save onboarding" });
  }
});

// ================= DASHBOARD =================
// Combines user data + preferences into one response
app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.userId]
    );

    const prefResult = await pool.query(
      "SELECT preferences FROM user_preferences WHERE user_id = $1",
      [req.user.userId]
    );

    res.json({
      user: userResult.rows[0],
      preferences: prefResult.rows[0]?.preferences || null,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// ================= MARKET DATA =================

// Gets live crypto prices from external API (CoinGecko)
app.get("/prices", authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("PRICE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// Static news (placeholder data for now)
// Later you could replace this with a real news API
app.get("/news", authMiddleware, async (req, res) => {
  try {
    res.json([
      { title: "Bitcoin Surges Above Key Resistance", url: "https://www.coindesk.com/" },
      { title: "Ethereum ETF Rumors Continue", url: "https://cointelegraph.com/" },
      { title: "Solana Ecosystem Keeps Growing", url: "https://decrypt.co/" },
    ]);
  } catch (err) {
    console.error("NEWS ERROR:", err);
    res.status(500).json({ error: "Failed to load news" });
  }
});

// ================= AI INSIGHT =================
// Uses external AI model to generate short market analysis
app.get("/ai-insight", authMiddleware, async (req, res) => {
  try {
    // Step 1: get real market data
    const market = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd",
        },
      }
    );

    const btc = market.data.bitcoin.usd;
    const eth = market.data.ethereum.usd;
    const sol = market.data.solana.usd;

    // Step 2: send prompt to AI model
    const prompt = `
You are a crypto analyst.

RULES:
- No reasoning
- Max 30 words
- Only final insight

Prices:
BTC: $${btc}
ETH: $${eth}
SOL: $${sol}
`;

    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "deepseek-ai/DeepSeek-V4-Pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const insight =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "Market is stable.";

    res.json({ insight });
  } catch (err) {
    console.error("AI INSIGHT ERROR:", err.response?.data || err.message);

    res.json({
      insight: "Market data temporarily unavailable.",
    });
  }
});

// ================= MEME SYSTEM =================
// Returns random meme from predefined list
app.get("/meme", authMiddleware, async (req, res) => {
  try {
    const memes = [
      { text: "Bought the dip. It kept dipping.", image: "https://i.imgflip.com/54hjww.jpg" },
      { text: "Crypto traders checking charts at 3AM", image: "https://i.imgflip.com/3si4.jpg" },
      { text: "When BTC goes up 1%", image: "https://i.imgflip.com/1bij.jpg" },
      { text: "HODL mode activated", image: "https://i.imgflip.com/26am.jpg" },
    ];

    const random = memes[Math.floor(Math.random() * memes.length)];

    res.json(random);
  } catch (err) {
    console.error("MEME ERROR:", err);
    res.status(500).json({ error: "Failed to load meme" });
  }
});

// ================= VOTING SYSTEM =================

// Save or update user vote for a section (AI, news, prices, etc.)
app.post("/vote", authMiddleware, async (req, res) => {
  const { sectionName, vote } = req.body;

  try {
    // If vote is null → user is removing vote
    if (vote === null) {
      await pool.query(
        `DELETE FROM votes WHERE user_id=$1 AND section_name=$2 AND created_at=CURRENT_DATE`,
        [req.user.userId, sectionName]
      );

      return res.json({ message: "Vote removed" });
    }

    // Otherwise insert or update vote
    const result = await pool.query(
      `
      INSERT INTO votes (user_id, section_name, vote)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, section_name, created_at)
      DO UPDATE SET vote = $3
      RETURNING *
      `,
      [req.user.userId, sectionName, vote]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("VOTE ERROR:", err);
    res.status(500).json({ error: "Failed to save vote" });
  }
});

// Get today's votes for this user
app.get("/votes", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT section_name, vote
      FROM votes
      WHERE user_id=$1 AND created_at=CURRENT_DATE
      `,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET VOTES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

// ================= START SERVER =================
// This starts the backend server and makes it listen for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});