// ======================================================
// CRYPTO DASHBOARD FRONTEND
// ======================================================

import { useState } from "react";
import axios from "axios";

function App() {
  const API = import.meta.env.VITE_API_URL;

  const [error, setError] = useState("");
  const [step, setStep] = useState("auth");
  const [token, setToken] = useState("");

  const [prices, setPrices] = useState(null);
  const [news, setNews] = useState([]);
  const [insight, setInsight] = useState("");
  const [meme, setMeme] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceCooldown, setPriceCooldown] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const [votes, setVotes] = useState({});

  const [onboarding, setOnboarding] = useState({
    assets: "",
    investorType: "",
    contentTypes: []
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getToken = () => token || localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ======================================================
  // BUTTON STYLE (reused everywhere)
  // ======================================================
  const buttonStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
    backgroundColor: "#f5f5f5",
    fontWeight: "500",
    transition: "0.2s",
    marginTop: "8px"
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    width: "250px"
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
    try {
      setError("");

      if (!isValidEmail(form.email)) {
        setError("Invalid email");
        return;
      }

      await axios.post(`${API}/signup`, form);

      alert("Signup successful!");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setError("");

      const res = await axios.post(`${API}/login`, loginForm);

      const jwt = res.data.token;
      setToken(jwt);
      localStorage.setItem("token", jwt);

      const profile = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      const votesRes = await axios.get(`${API}/votes`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      const votesObject = {};
      votesRes.data.forEach((v) => {
        votesObject[v.section_name] = v.vote;
      });

      setVotes(votesObject);

      if (!profile.data.preferences) {
        setStep("onboarding");
      } else {
        setStep("dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setStep("auth");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      {/* ================= AUTH ================= */}
      {step === "auth" && (
        <div>
          <h2>Signup</h2>

          <input
            style={inputStyle}
            name="name"
            placeholder="Name"
            onChange={handleChange}
          />
          <br />

          <input
            style={inputStyle}
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          <br />

          <input
            style={inputStyle}
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <br />

          <button style={buttonStyle} onClick={handleSignup}>
            Create Account
          </button>

          <hr />

          <h2>Login</h2>

          <input
            style={inputStyle}
            placeholder="Email"
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
          />
          <br />

          <input
            style={inputStyle}
            placeholder="Password"
            type="password"
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />
          <br />

          <button style={buttonStyle} onClick={handleLogin}>
            Login
          </button>

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}
        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {step === "dashboard" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h2>Dashboard</h2>

            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#ffdddd"
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;