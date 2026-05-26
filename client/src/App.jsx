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
{step === "auth" && (
  <div
    style={{
      display: "flex",
      gap: "40px",
      justifyContent: "center",
      alignItems: "flex-start",
      flexWrap: "wrap"
    }}
  >

    {/* ================= SIGNUP ================= */}
    <div style={{ width: "320px" }}>
      <h2 style={{ marginBottom: "15px" }}>Sign Up</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        style={ui.input.base}
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        style={ui.input.base}
      />

      <input
        name="password"
        placeholder="Password"
        type="password"
        onChange={handleChange}
        style={ui.input.base}
      />

      <button
        onClick={handleSignup}
        style={{
          ...ui.button.base,
          ...ui.button.primary,
          width: "100%",
          marginTop: "10px"
        }}
      >
        Create Account
      </button>
    </div>

    {/* ================= LOGIN ================= */}
    <div style={{ width: "320px" }}>
      <h2 style={{ marginBottom: "15px" }}>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) =>
          setLoginForm({
            ...loginForm,
            email: e.target.value
          })
        }
        style={ui.input.base}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) =>
          setLoginForm({
            ...loginForm,
            password: e.target.value
          })
        }
        style={ui.input.base}
      />

      <button
        onClick={handleLogin}
        style={{
          ...ui.button.base,
          ...ui.button.secondary,
          width: "100%",
          marginTop: "10px"
        }}
      >
        Login
      </button>
    </div>

  </div>
)}

      {/* ================= ONBOARDING ================= */}
      {step === "onboarding" && (
        <div>

          <h1>Onboarding</h1>

          <h3>
            What crypto assets are you interested in?
          </h3>

          <input
            placeholder="e.g. BTC, ETH, SOL"
            value={onboarding.assets}
            onChange={(e) =>
              setOnboarding({
                ...onboarding,
                assets: e.target.value
              })
            }
          />

          <br />
          <br />

          <h3>
            What type of investor are you?
          </h3>

          <select
            value={onboarding.investorType}
            onChange={(e) =>
              setOnboarding({
                ...onboarding,
                investorType: e.target.value
              })
            }
          >
            <option value="">
              Select...
            </option>

            <option value="HODLer">
              HODLer
            </option>

            <option value="Day Trader">
              Day Trader
            </option>

            <option value="NFT Collector">
              NFT Collector
            </option>
          </select>

          <br />
          <br />

          <h3>
            What content would you like to see?
          </h3>

          {["Market News", "Charts", "Social", "Fun"].map((item) => (
            <button
              key={item}
              onClick={() => {

                const exists =
                  onboarding.contentTypes.includes(item);

                setOnboarding({
                  ...onboarding,
                  contentTypes: exists
                    ? onboarding.contentTypes.filter(
                        (x) => x !== item
                      )
                    : [...onboarding.contentTypes, item]
                });
              }}
              style={{
                marginRight: "10px",
                backgroundColor:
                  onboarding.contentTypes.includes(item)
                    ? "green"
                    : "lightgray"
              }}
            >
              {item}
            </button>
          ))}

          <br />
          <br />

          <button onClick={submitOnboarding}>
            Continue
          </button>

        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {/* ================= DASHBOARD ================= */}
{step === "dashboard" && (
  <div>

    {/* ================= HEADER ================= */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}
    >
      <h1>Crypto Dashboard</h1>

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#ffdddd",
          border: "1px solid #ccc",
          padding: "8px 15px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Log Out
      </button>
    </div>

    {/* ================= DASHBOARD GRID ================= */}
    {!selectedSection && (

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px"
        }}
      >

        {/* ================= AI CARD ================= */}
        <div
          onClick={() => setSelectedSection("ai")}
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "20px",
            cursor: "pointer",
            backgroundColor: "#fafafa",
            minHeight: "220px"
          }}
        >
          <h2>AI Insight</h2>

          <p>
            {insight
              ? insight
              : "Loading AI insight..."}
          </p>

          <div style={{ marginTop: "20px" }}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("ai-insight", true);
              }}
              style={{
                backgroundColor:
                  votes["ai-insight"] === true
                    ? "lightgreen"
                    : "white"
              }}
            >
              👍
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("ai-insight", false);
              }}
              style={{
                marginLeft: "10px",
                backgroundColor:
                  votes["ai-insight"] === false
                    ? "lightcoral"
                    : "white"
              }}
            >
              👎
            </button>

          </div>
        </div>

        {/* ================= PRICES CARD ================= */}
        <div
          onClick={() => setSelectedSection("prices")}
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "20px",
            cursor: "pointer",
            backgroundColor: "#fafafa",
            minHeight: "220px"
          }}
        >
          <h2>Coin Prices</h2>

          {prices ? (
            <div>
              <p>BTC: ${prices.bitcoin.usd}</p>
              <p>ETH: ${prices.ethereum.usd}</p>
              <p>SOL: ${prices.solana.usd}</p>
            </div>
          ) : (
            <p>Loading prices...</p>
          )}

          <div style={{ marginTop: "20px" }}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("prices", true);
              }}
              style={{
                backgroundColor:
                  votes.prices === true
                    ? "lightgreen"
                    : "white"
              }}
            >
              👍
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("prices", false);
              }}
              style={{
                marginLeft: "10px",
                backgroundColor:
                  votes.prices === false
                    ? "lightcoral"
                    : "white"
              }}
            >
              👎
            </button>

          </div>
        </div>

        {/* ================= MEME CARD ================= */}
        <div
          onClick={() => setSelectedSection("meme")}
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "20px",
            cursor: "pointer",
            backgroundColor: "#fafafa",
            minHeight: "220px"
          }}
        >
          <h2>Meme</h2>

          {meme ? (
            <>
              <p>{meme.text}</p>

              <img
                src={meme.image}
                alt="meme"
                style={{
                  width: "150px",
                  borderRadius: "10px"
                }}
              />
            </>
          ) : (
            <p>Loading meme...</p>
          )}

          <div style={{ marginTop: "20px" }}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("meme", true);
              }}
              style={{
                backgroundColor:
                  votes.meme === true
                    ? "lightgreen"
                    : "white"
              }}
            >
              👍
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote("meme", false);
              }}
              style={{
                marginLeft: "10px",
                backgroundColor:
                  votes.meme === false
                    ? "lightcoral"
                    : "white"
              }}
            >
              👎
            </button>

          </div>
        </div>

        {/* ================= NEWS CARD ================= */}
        <div
          onClick={() => setSelectedSection("news")}
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "20px",
            cursor: "pointer",
            backgroundColor: "#fafafa",
            minHeight: "220px"
          }}
        >
          <h2>Market News</h2>

          {news.length > 0 ? (
            <>
              <p>{news[0].title}</p>

              <div style={{ marginTop: "20px" }}>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote("news-0", true);
                  }}
                  style={{
                    backgroundColor:
                      votes["news-0"] === true
                        ? "lightgreen"
                        : "white"
                  }}
                >
                  👍
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote("news-0", false);
                  }}
                  style={{
                    marginLeft: "10px",
                    backgroundColor:
                      votes["news-0"] === false
                        ? "lightcoral"
                        : "white"
                  }}
                >
                  👎
                </button>

              </div>
            </>
          ) : (
            <p>Loading news...</p>
          )}
        </div>

      </div>
    )}

    {/* ================= AI PAGE ================= */}
    {selectedSection === "ai" && (
      <div>

        <button
          onClick={async () => {
          await loadMeme();
          setSelectedSection(null);
        }}
        >
          ← Back
        </button>

        <h1>AI Insight</h1>

        <div
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "25px",
            marginTop: "20px"
          }}
        >
          <p style={{ fontSize: "20px" }}>
            {insight}
          </p>

          <div style={{ marginTop: "20px" }}>

            <button
              onClick={() => handleVote("ai-insight", true)}
              style={{
                backgroundColor:
                  votes["ai-insight"] === true
                    ? "lightgreen"
                    : "white"
              }}
            >
              👍
            </button>

            <button
              onClick={() => handleVote("ai-insight", false)}
              style={{
                marginLeft: "10px",
                backgroundColor:
                  votes["ai-insight"] === false
                    ? "lightcoral"
                    : "white"
              }}
            >
              👎
            </button>

          </div>
        </div>

      </div>
    )}

    {/* ================= PRICES PAGE ================= */}
    {selectedSection === "prices" && (
      <div>

        <button
          onClick={async () => {
            await loadMeme();
            setSelectedSection(null);
          }}
        >
          ← Back
        </button>

        <h1>Coin Prices</h1>

        <button
          onClick={loadPrices}
          disabled={loadingPrices || priceCooldown}
          style={{
            marginBottom: "20px",
            height: "35px",
            padding: "0 12px",
            borderRadius: "8px"
          }}
        >
          {loadingPrices
            ? "Refreshing..."
            : priceCooldown
            ? "Refresh 2 min"
            : "Refresh"}
        </button>

        <div
          style={{
            border: "1px solid lightgray",
            borderRadius: "15px",
            padding: "25px"
          }}
        >
          {prices ? (
            <>
              <h2>BTC: ${prices.bitcoin.usd}</h2>
              <h2>ETH: ${prices.ethereum.usd}</h2>
              <h2>SOL: ${prices.solana.usd}</h2>
            </>
          ) : (
            <p>Loading prices...</p>
          )}

          <div style={{ marginTop: "20px" }}>

            <button
              onClick={() => handleVote("prices", true)}
              style={{
                backgroundColor:
                  votes.prices === true
                    ? "lightgreen"
                    : "white"
              }}
            >
              👍
            </button>

            <button
              onClick={() => handleVote("prices", false)}
              style={{
                marginLeft: "10px",
                backgroundColor:
                  votes.prices === false
                    ? "lightcoral"
                    : "white"
              }}
            >
              👎
            </button>

          </div>
        </div>

      </div>
    )}

    {/* ================= MEME PAGE ================= */}
    {selectedSection === "meme" && (
      <div>

        <button
          onClick={async () => {
            await loadMeme();
            setSelectedSection(null);
          }}
        >
          ← Back
        </button>

        <h1>Meme of the Moment</h1>

        {meme && (
          <div
            style={{
              border: "1px solid lightgray",
              borderRadius: "15px",
              padding: "25px"
            }}
          >
            <h2>{meme.text}</h2>

            <img
              src={meme.image}
              alt="meme"
              style={{
                width: "400px",
                borderRadius: "10px"
              }}
            />

            <div style={{ marginTop: "20px" }}>

              <button
                onClick={() => handleVote("meme", true)}
                style={{
                  backgroundColor:
                    votes.meme === true
                      ? "lightgreen"
                      : "white"
                }}
              >
                👍
              </button>

              <button
                onClick={() => handleVote("meme", false)}
                style={{
                  marginLeft: "10px",
                  backgroundColor:
                    votes.meme === false
                      ? "lightcoral"
                      : "white"
                }}
              >
                👎
              </button>

            </div>
          </div>
        )}

      </div>
    )}

    {/* ================= NEWS PAGE ================= */}
    {selectedSection === "news" && (
      <div>

        <button
          onClick={async () => {
            await loadMeme();
            setSelectedSection(null);
          }}
        >
          ← Back
        </button>

        <h1>Market News</h1>

        {news.map((item, index) => (

          <div
            key={index}
            style={{
              border: "1px solid lightgray",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "20px"
            }}
          >

            <h2>{item.title}</h2>

            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              Read Article
            </a>

            <div style={{ marginTop: "20px" }}>

              <button
                onClick={() =>
                  handleVote(`news-${index}`, true)
                }
                style={{
                  backgroundColor:
                    votes[`news-${index}`] === true
                      ? "lightgreen"
                      : "white"
                }}
              >
                👍
              </button>

              <button
                onClick={() =>
                  handleVote(`news-${index}`, false)
                }
                style={{
                  marginLeft: "10px",
                  backgroundColor:
                    votes[`news-${index}`] === false
                      ? "lightcoral"
                      : "white"
                }}
              >
                👎
              </button>

            </div>

          </div>

        ))}

      </div>
    )}

  </div>
)}

    </div>
  );
}

export default App;