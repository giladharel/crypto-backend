import { useState } from "react";
import axios from "axios";
import Auth from "./components/Auth";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard.jsx";

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
  const [onboardingError, setOnboardingError] = useState("");

  const ui = {
  button: {
    base: {
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.2s ease",
      fontSize: "14px",
      outline: "none",
    },

    primary: {
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
    },

    secondary: {
      backgroundColor: "#f3f4f6",
      color: "#111",
      border: "1px solid #e5e7eb",
    },

    danger: {
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
    },

    success: {
      backgroundColor: "#22c55e",
      color: "white",
      border: "none",
    },
  },

  input: {
    base: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      outline: "none",
      fontSize: "14px",
      width: "250px",
      transition: "all 0.2s ease",
      marginBottom: "10px",
    },
  },
};


const hover = (e, on) => {
  e.currentTarget.style.transform = on ? "translateY(-2px)" : "translateY(0)";
  e.currentTarget.style.boxShadow = on
    ? "0 6px 20px rgba(0,0,0,0.12)"
    : "none";
};

  // ================= VOTE STATES =================
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

  // ================= EMAIL VALIDATION =================
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ================= FORM CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= LOAD PRICES =================
  const loadPrices = async () => {

  // prevent spam clicking
  if (priceCooldown) {
    return;
  }

  try {

    setLoadingPrices(true);
    setPriceCooldown(true);

    const jwt = token || localStorage.getItem("token");

    const res = await axios.get(
      `${API}/prices`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    );

    setPrices(res.data);

  } catch (err) {

    console.log(err);

  } finally {

    setLoadingPrices(false);

    // unlock after 2 minutes
    setTimeout(() => {
      setPriceCooldown(false);
    }, 120000);
  }
};

  // ================= LOAD NEWS =================
  const loadNews = async () => {
    try {

      const jwt = token || localStorage.getItem("token");

      const res = await axios.get(
        `${API}/news`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );

      setNews(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOAD Insight =================
  const loadInsight = async () => {
  try {
    const jwt = token || localStorage.getItem("token");

    const res = await axios.get(`${API}/ai-insight`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    setInsight(res.data.insight);

  } catch (err) {
    console.log(err);
  }
};

  // ================= SIGNUP =================
  const handleSignup = async () => {
    try {

      setError("");

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

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {

      setError("");

      const res = await axios.post(
        `${API}/login`,
        loginForm
      );

      const jwt = res.data.token;

      setToken(jwt);

      localStorage.setItem("token", jwt);

      const profile = await axios.get(
        `${API}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );



      // ================= LOAD SAVED VOTES =================
      const votesRes = await axios.get(
        `${API}/votes`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );

      const votesObject = {};

      votesRes.data.forEach((item) => {
        votesObject[item.section_name] = item.vote;
      });

      setVotes(votesObject);

      if (!profile.data.preferences) {

        setStep("onboarding");

      } else {

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


  // ================= ONBOARDING =================
  const submitOnboarding = async () => {

    // reset old error
    setOnboardingError("");

    // validate assets
    if (!onboarding.assets.trim()) {
      setOnboardingError(
        "Must choose crypto assets"
      );
      return;
    }

    // validate investor type
    if (!onboarding.investorType) {
      setOnboardingError(
        "Must choose investor type"
      );
      return;
    }

    try {

      const jwt = token || localStorage.getItem("token");

      await axios.post(
        `${API}/onboarding`,
        onboarding,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      );

      await loadPrices();
      await loadNews();
      await loadMeme();
      await loadInsight();

      setStep("dashboard");

    } catch (err) {
      console.log(err);
    }
  };

  // ================= VOTING =================
  const handleVote = async (sectionName, vote) => {

  try {

    const jwt = token || localStorage.getItem("token");

    // current vote for this section
    const currentVote = votes[sectionName];

    // if clicking same vote again -> remove vote
    const finalVote =
      currentVote === vote
        ? null
        : vote;

    // update frontend state
    setVotes({
      ...votes,
      [sectionName]: finalVote
    });

    // send to backend
    const res = await axios.post(
      `${API}/vote`,
      {
        sectionName,
        vote: finalVote
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    );

    console.log("VOTE RESPONSE:", res.data);

  } catch (err) {
    console.log(err);
  }
};

// ================= LOGOUT =================
      const handleLogout = () => {

        // remove saved token
        localStorage.removeItem("token");

        // reset states
        setToken("");
        setPrices(null);
        setNews([]);
        setInsight("");
        setMeme(null);
        setVotes({});

        // go back to auth screen
        setStep("auth");
      };


  // ================= LOAD MEME =================
const loadMeme = async () => {

  try {

    const jwt = token || localStorage.getItem("token");

    const res = await axios.get(
      `${API}/meme`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    );

    setMeme(res.data);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div style={{ padding: "20px" }}>

      {/* ================= AUTH ================= */}
      <Auth
        step={step}
        handleChange={handleChange}
        handleSignup={handleSignup}
        handleLogin={handleLogin}
        setLoginForm={setLoginForm}
        loginForm={loginForm}
        ui={ui}
        hover={hover}
        error={error}
      />

      {/* ================= ONBOARDING ================= */}
      <Onboarding
        step={step}
        onboarding={onboarding}
        setOnboarding={setOnboarding}
        submitOnboarding={submitOnboarding}
        ui={ui}
        hover={hover}
        onboardingError={onboardingError}
      />

      {/* ================= DASHBOARD ================= */}
      <Dashboard
        step={step}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        insight={insight}
        prices={prices}
        news={news}
        meme={meme}
        votes={votes}
        handleVote={handleVote}
        loadPrices={loadPrices}
        loadMeme={loadMeme}
        ui={ui}
        hover={hover}
        handleLogout={handleLogout}
        loadingPrices={loadingPrices}
        priceCooldown={priceCooldown}
      />

    </div>
  );
}

export default App;