function Dashboard({
  step,
  selectedSection,
  setSelectedSection,
  insight,
  prices,
  news,
  meme,
  votes,
  handleVote,
  loadPrices,
  loadMeme,
  ui,
  hover,
  handleLogout,
  loadingPrices,
  priceCooldown
}) {

  if (step !== "dashboard") {
    return null;
  }

  return (
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
          style={{
            ...ui.button.base,
            ...ui.button.secondary,
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "12px"
          }}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
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
          style={{
            ...ui.button.base,
            ...ui.button.secondary,
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "12px"
          }}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
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
          style={{
            ...ui.button.base,
            ...ui.button.secondary,
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "12px"
          }}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
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
          style={{
            ...ui.button.base,
            ...ui.button.secondary,
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "12px"
          }}
          onMouseEnter={(e) => hover(e, true)}
          onMouseLeave={(e) => hover(e, false)}
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
  );
}

export default Dashboard;