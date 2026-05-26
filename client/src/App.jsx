// ======================================================
// CRYPTO DASHBOARD FRONTEND
// ======================================================
//
// Features:
// - User signup/login with JWT authentication
// - Onboarding flow
// - Protected API requests
// - Crypto price tracking
// - AI-generated insights
// - Meme system
// - Voting system
// - Dashboard navigation
//
// Frontend Stack:
// - React
// - Axios
// - Vite
//
// Backend:
// - Node.js
// - Express
// - PostgreSQL
// ======================================================

import { useState } from "react";
import axios from "axios";

function App() {

  // ======================================================
  // API URL
  // ======================================================
  //
  // Loaded from Vite environment variables.
  // Automatically changes between local and production.
  //
  // Example:
  // Local    -> http://localhost:5000
  // Production -> Render backend URL
  //
  // ======================================================

  const API = import.meta.env.VITE_API_URL;

  // ======================================================
  // GENERAL APP STATE
  // ======================================================

  // Global error messages shown to user
  const [error, setError] = useState("");

  // Controls which screen is currently visible
  // auth -> onboarding -> dashboard
  const [step, setStep] = useState("auth");

  // JWT token used for protected requests
  const [token, setToken] = useState("");

  // ======================================================
  // DASHBOARD DATA STATE
  // ======================================================

  // Crypto prices from CoinGecko
  const [prices, setPrices] = useState(null);

  // News articles array
  const [news, setNews] = useState([]);

  // AI-generated market insight
  const [insight, setInsight] = useState("");

  // Random crypto meme object
  const [meme, setMeme] = useState(null);

  // Loading state while refreshing prices
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Cooldown prevents spam refreshing
  const [priceCooldown, setPriceCooldown] = useState(false);

  // Controls expanded dashboard section
  // null = grid view
  // ai / prices / meme / news = detail page
  const [selectedSection, setSelectedSection] = useState(null);

  // ======================================================
  // VOTING SYSTEM STATE
  // ======================================================
  //
  // Stores likes/dislikes for dashboard sections.
  //
  // Example:
  // {
  //   "prices": true,
  //   "meme": false
  // }
  //
  // ======================================================

  const [votes, setVotes] = useState({});

  // ======================================================
  // ONBOARDING STATE
  // ======================================================

  const [onboarding, setOnboarding] = useState({
    assets: "",
    investorType: "",
    contentTypes: []
  });

  // ======================================================
  // SIGNUP FORM STATE
  // ======================================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  // ======================================================
  // LOGIN FORM STATE
  // ======================================================

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  // ======================================================
  // HELPER FUNCTIONS
  // ======================================================

  // Returns active JWT token
  // Used in all protected API requests
  const getToken = () => {
    return token || localStorage.getItem("token");
  };

  // ======================================================
  // EMAIL VALIDATION
  // ======================================================
  //
  // Simple regex validation before signup request.
  // Prevents obviously invalid emails from reaching backend.
  //
  // ======================================================

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ======================================================
  // SIGNUP FORM INPUT HANDLER
  // ======================================================
  //
  // Dynamically updates form state using input name.
  //
  // Example:
  // input name="email"
  // updates form.email
  //
  // ======================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ======================================================
  // LOAD CRYPTO PRICES
  // ======================================================
  //
  // Fetches latest prices from backend.
  // Backend then calls CoinGecko API.
  //
  // Includes cooldown system to prevent
  // excessive refresh requests.
  //
  // ======================================================

  const loadPrices = async () => {

    // Prevent spam clicking during cooldown
    if (priceCooldown) {
      return;
    }

    try {

      setLoadingPrices(true);
      setPriceCooldown(true);

      const res = await axios.get(
        `${API}/prices`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setPrices(res.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoadingPrices(false);

      // Unlock refresh after 2 minutes
      setTimeout(() => {
        setPriceCooldown(false);
      }, 120000);
    }
  };

  // ======================================================
  // LOAD NEWS
  // ======================================================
  //
  // Fetches crypto news from backend.
  //
  // Current implementation uses static news.
  // Can later be replaced with live API.
  //
  // ======================================================

  const loadNews = async () => {

    try {

      const res = await axios.get(
        `${API}/news`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setNews(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // LOAD AI INSIGHT
  // ======================================================
  //
  // Backend:
  // 1. Fetches crypto prices
  // 2. Sends prompt to AI model
  // 3. Returns generated insight
  //
  // ======================================================

  const loadInsight = async () => {

    try {

      const res = await axios.get(
        `${API}/ai-insight`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setInsight(res.data.insight);

    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // LOAD MEME
  // ======================================================
  //
  // Fetches random meme object from backend.
  //
  // Backend currently returns random item
  // from static array.
  //
  // ======================================================

  const loadMeme = async () => {

    try {

      const res = await axios.get(
        `${API}/meme`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setMeme(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // USER SIGNUP
  // ======================================================
  //
  // Creates new user account.
  //
  // Flow:
  // 1. Validate email
  // 2. Send signup request
  // 3. Backend hashes password
  // 4. User saved in PostgreSQL
  //
  // ======================================================

  const handleSignup = async () => {

    try {

      setError("");

      // Frontend validation
      if (!isValidEmail(form.email)) {
        setError("Please enter a valid email address");
        return;
      }

      await axios.post(
        `${API}/signup`,
        form
      );

      alert("Signup successful!");

    } catch (err) {

      setError(
        err.response?.data?.error || "Signup failed"
      );
    }
  };

  // ======================================================
  // USER LOGIN
  // ======================================================
  //
  // Flow:
  // 1. Send credentials
  // 2. Backend verifies password
  // 3. Backend returns JWT token
  // 4. Save token locally
  // 5. Load dashboard data
  //
  // ======================================================

  const handleLogin = async () => {

    try {

      setError("");

      const res = await axios.post(
        `${API}/login`,
        loginForm
      );

      // JWT token returned from backend
      const jwt = res.data.token;

      setToken(jwt);

      // Persist login after refresh
      localStorage.setItem("token", jwt);

      // Load user profile/dashboard data
      const profile = await axios.get(
        `${API}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );

      // ======================================================
      // LOAD USER VOTES
      // ======================================================

      const votesRes = await axios.get(
        `${API}/votes`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );

      // Convert array into object
      const votesObject = {};

      votesRes.data.forEach((item) => {
        votesObject[item.section_name] = item.vote;
      });

      setVotes(votesObject);

      // ======================================================
      // CHECK IF USER COMPLETED ONBOARDING
      // ======================================================

      if (!profile.data.preferences) {

        setStep("onboarding");

      } else {

        // Load dashboard content
        await loadPrices();
        await loadNews();
        await loadMeme();
        await loadInsight();

        setStep("dashboard");
      }

    } catch (err) {

      setError(
        err.response?.data?.error || "Something went wrong"
      );
    }
  };

  // ======================================================
  // SUBMIT ONBOARDING
  // ======================================================
  //
  // Saves user preferences into database.
  //
  // Preferences personalize dashboard experience.
  //
  // ======================================================

  const submitOnboarding = async () => {

    try {

      await axios.post(
        `${API}/onboarding`,
        onboarding,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      // Load dashboard data after onboarding
      await loadPrices();
      await loadNews();
      await loadMeme();
      await loadInsight();

      setStep("dashboard");

    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // VOTING SYSTEM
  // ======================================================
  //
  // Allows users to like/dislike content.
  //
  // Clicking same vote again removes vote.
  //
  // Votes saved in PostgreSQL database.
  //
  // ======================================================

  const handleVote = async (sectionName, vote) => {

    try {

      // Current vote for this section
      const currentVote = votes[sectionName];

      // Toggle behavior:
      // same click removes vote
      const finalVote =
        currentVote === vote
          ? null
          : vote;

      // Update frontend instantly
      setVotes({
        ...votes,
        [sectionName]: finalVote
      });

      // Save vote to backend
      const res = await axios.post(
        `${API}/vote`,
        {
          sectionName,
          vote: finalVote
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log("VOTE RESPONSE:", res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================
  //
  // Clears token and resets app state.
  //
  // ======================================================

  const handleLogout = () => {

    // Remove persisted login
    localStorage.removeItem("token");

    // Reset app state
    setToken("");
    setPrices(null);
    setNews([]);
    setInsight("");
    setMeme(null);
    setVotes({});

    // Return to auth screen
    setStep("auth");
  };

  // ======================================================
  // RENDER UI
  // ======================================================

  return (
    <div style={{ padding: "20px" }}>

      {/* ======================================================
          AUTH SCREEN
      ====================================================== */}

      {step === "auth" && (
        <>
          <h1>Signup</h1>

          {/* Signup Inputs */}
        </>
      )}

      {/* ======================================================
          ONBOARDING SCREEN
      ====================================================== */}

      {step === "onboarding" && (
        <div>
          <h1>Onboarding</h1>
        </div>
      )}

      {/* ======================================================
          DASHBOARD SCREEN
      ====================================================== */}

      {step === "dashboard" && (
        <div>

          {/* ======================================================
              DASHBOARD HEADER
          ====================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px"
            }}
          >
            <h1>Crypto Dashboard</h1>

            <button onClick={handleLogout}>
              Log Out
            </button>
          </div>

          {/* ======================================================
              DASHBOARD CONTENT
          ====================================================== */}

          {/* 
            Dashboard uses conditional rendering.

            If no section selected:
            -> show grid cards

            If section selected:
            -> show detailed page
          */}

        </div>
      )}

    </div>
  );
}

export default App;