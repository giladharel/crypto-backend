function Onboarding({
  step,
  onboarding,
  setOnboarding,
  submitOnboarding,
  ui,
  hover,
  onboardingError
}) {

  if (step !== "onboarding") {
    return null;
  }

  return (
    <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
      padding: "20px"
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "24px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
      }}
    >

      <h1
        style={{
          marginBottom: "10px",
          fontSize: "36px",
          textAlign: "center"
        }}
      >
        Welcome 👋
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          marginBottom: "40px",
          fontSize: "16px"
        }}
      >
        Personalize your crypto dashboard
      </p>

      {/* ================= ASSETS ================= */}
      <div style={{ marginBottom: "30px" }}>

        <h3
          style={{
            marginBottom: "12px",
            color: "#111827"
          }}
        >
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
          style={{
            ...ui.input.base,
            width: "100%"
          }}
          onFocus={(e) => {
            e.currentTarget.style.border =
              "1px solid #2563eb";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(37,99,235,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.border =
              "1px solid #e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

      </div>

      {/* ================= INVESTOR TYPE ================= */}
      <div style={{ marginBottom: "30px" }}>

        <h3
          style={{
            marginBottom: "12px",
            color: "#111827"
          }}
        >
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
          style={{
            ...ui.input.base,
            width: "100%",
            cursor: "pointer",
            backgroundColor: "white",
            textAlign: "center"
          }}
        >
          <option value="">
            Select investor type
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

      </div>

      {/* ================= CONTENT TYPES ================= */}
      <div style={{ marginBottom: "40px" }}>

        <h3
          style={{
            marginBottom: "15px",
            color: "#111827",
            textAlign: "center"
          }}
        >
          What content would you like to see?
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {[
            "Market News",
            "Charts",
            "Social",
            "Fun"
          ].map((item) => {

            const selected =
              onboarding.contentTypes.includes(item);

            return (
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
                      : [
                          ...onboarding.contentTypes,
                          item
                        ]
                  });
                }}
                style={{
                  ...ui.button.base,
                  backgroundColor: selected
                    ? "#16922e"
                    : "#f3f4f6",
                  color: selected
                    ? "white"
                    : "#111827",
                  border: selected
                    ? "none"
                    : "1px solid #e5e7eb",
                  padding: "12px 18px"
                }}
                onMouseEnter={(e) => hover(e, true)}
                onMouseLeave={(e) => hover(e, false)}
              >
                {item}
              </button>
            );
          })}
        </div>

      </div>

      {/* ================= CONTINUE BUTTON ================= */}

      {onboardingError && (
        <p
          style={{
            color: "#ef4444",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "600"
          }}
        >
          {onboardingError}
        </p>
      )}

      <button
        onClick={submitOnboarding}
        style={{
          ...ui.button.base,
          ...ui.button.primary,
          width: "100%",
          padding: "14px",
          fontSize: "16px"
        }}
        onMouseEnter={(e) => hover(e, true)}
        onMouseLeave={(e) => hover(e, false)}
      >
        Continue →
      </button>

    </div>
  </div>
  );
}

export default Onboarding;