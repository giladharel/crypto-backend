const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("./db");
const axios = require("axios");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://crypto-backend-b5dhw5cra-crypto-gilad.vercel.app/"
  ],
  credentials: true
}));
app.use(express.json());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ================= AUTH MIDDLEWARE =================
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // check duplicate email
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );

    res.json({
      message: "User created",
      userId: result.rows[0].id
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});


app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


// ================= ME =================
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
app.post("/onboarding", authMiddleware, async (req, res) => {
  const { assets, investorType, contentTypes } = req.body;

  try {
    // validation
    if (!assets || !investorType || !contentTypes) {
      return res.status(400).json({
        error: "Missing onboarding fields"
      });
    }

    const preferences = {
      assets,
      investorType,
      contentTypes
    };

    const result = await pool.query(
      `
      INSERT INTO user_preferences (user_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET preferences = $2
      RETURNING *
      `,
      [
        req.user.userId,
        preferences
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("ONBOARDING ERROR:", err);
    res.status(500).json({ error: "Failed to save onboarding" });
  }
});

// ================= DASHBOARD =================
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

    const preferences =
      prefResult.rows.length > 0
        ? prefResult.rows[0].preferences
        : null;

    res.json({
      user: userResult.rows[0],
      preferences
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// ================= COIN PRICES =================
app.get("/prices", authMiddleware, async (req, res) => {
  try {

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd"
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error("PRICE ERROR:", err.message);

    res.status(500).json({
      error: "Failed to fetch prices"
    });
  }
});

// ================= NEWS =================
app.get("/news", authMiddleware, async (req, res) => {

  try {

    // STATIC FALLBACK NEWS
    // later you can replace with CryptoPanic API

    const news = [
      {
        title: "Bitcoin Surges Above Key Resistance",
        url: "https://www.coindesk.com/"
      },
      {
        title: "Ethereum ETF Rumors Continue",
        url: "https://cointelegraph.com/"
      },
      {
        title: "Solana Ecosystem Keeps Growing",
        url: "https://decrypt.co/"
      }
    ];

    res.json(news);

  } catch (err) {

    console.error("NEWS ERROR:", err);

    res.status(500).json({
      error: "Failed to load news"
    });
  }
});

// ================= AI INSIGHT (REAL FIXED) =================
app.get("/ai-insight", authMiddleware, async (req, res) => {
  try {
    const market = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd"
        }
      }
    );

    const btc = market.data.bitcoin.usd;
    const eth = market.data.ethereum.usd;
    const sol = market.data.solana.usd;

    const prompt = `
You are a crypto analyst.

IMPORTANT RULES:
- No explanations, no reasoning, no thinking steps
- No extra text before or after
- Keep it under 30 words total

Prices:
Bitcoin: $${btc}
Ethereum: $${eth}
Solana: $${sol}

`;

    const response = await axios.post(
      
  "https://router.huggingface.co/v1/chat/completions",
  {
    model: "deepseek-ai/DeepSeek-V4-Pro",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 300
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);
    console.log("HF RAW RESPONSE:", JSON.stringify(response.data, null, 2));
    const insight =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "Market is stable with moderate volatility.";

    res.json({ insight });

  } catch (err) {
    console.error("AI INSIGHT ERROR:", err.response?.data || err.message);

    res.json({
      insight: "Market data temporarily unavailable."
    });
  }
});


// ================= MEMES =================
app.get("/meme", authMiddleware, async (req, res) => {

  try {

    const memes = [

      {
        text: "Bought the dip. It kept dipping.",
        image:
          "https://i.imgflip.com/54hjww.jpg"
      },

      {
        text: "Crypto traders checking charts at 3AM",
        image:
          "https://i.imgflip.com/3si4.jpg"
      },

      {
        text: "When BTC goes up 1%",
        image:
          "https://i.imgflip.com/1bij.jpg"
      },

      {
        text: "HODL mode activated",
        image:
          "https://i.imgflip.com/26am.jpg"
      }

    ];

    const randomIndex =
      Math.floor(Math.random() * memes.length);

    res.json(memes[randomIndex]);

  } catch (err) {

    console.error("MEME ERROR:", err);

    res.status(500).json({
      error: "Failed to load meme"
    });
  }
});

// ================= VOTING =================
app.post("/vote", authMiddleware, async (req, res) => {

  const { sectionName, vote } = req.body;

  try {

    // ================= REMOVE VOTE =================
    if (vote === null) {

      await pool.query(
        `
        DELETE FROM votes
        WHERE user_id = $1
        AND section_name = $2
        AND created_at = CURRENT_DATE
        `,
        [
          req.user.userId,
          sectionName
        ]
      );

      return res.json({
        message: "Vote removed"
      });
    }

    // ================= INSERT OR UPDATE =================
    const result = await pool.query(
      `
      INSERT INTO votes (
        user_id,
        section_name,
        vote
      )
      VALUES (
        $1,
        $2,
        $3
      )

      ON CONFLICT (
        user_id,
        section_name,
        created_at
      )

      DO UPDATE SET
        vote = $3

      RETURNING *
      `,
      [
        req.user.userId,
        sectionName,
        vote
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error("VOTE ERROR:", err);

    res.status(500).json({
      error: "Failed to save vote"
    });
  }
});

// ================= GET USER VOTES =================
app.get("/votes", authMiddleware, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT section_name, vote
      FROM votes
      WHERE user_id = $1
      AND created_at = CURRENT_DATE
      `,
      [req.user.userId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error("GET VOTES ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch votes"
    });
  }
});

//  ================= START SERVER =================
// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});