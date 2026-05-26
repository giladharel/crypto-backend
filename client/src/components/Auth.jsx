function Auth({
  step,
  handleChange,
  handleSignup,
  handleLogin,
  setLoginForm,
  loginForm,
  ui,
  hover,
  error
}) {

  // only show auth page
  if (step !== "auth") {
    return null;
  }

  return (
      <div
    style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9fafb"
    }}
  >
    <div
      style={{
        display: "flex",
        gap: "40px",
        alignItems: "stretch"
      }}
    >

    {error && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fee2e2",
      color: "#b91c1c",
      padding: "12px 20px",
      borderRadius: "10px",
      fontWeight: "600",
      zIndex: 9999,
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
    }}
  >
    {error}
  </div>
)}


      {/* ================= SIGNUP ================= */}
      <div
        style={{
          width: "320px",
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column"
        }}
      >
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignup();
            }
          }}
          style={ui.input.base}
        />

        {/* pushes button to bottom for alignment */}
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleSignup}
            style={{
              ...ui.button.base,
              ...ui.button.primary,
              width: "100%"
            }}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* ================= LOGIN ================= */}
      <div
        style={{
          width: "320px",
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column"
        }}
      >
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          style={ui.input.base}
        />

        {/* spacer so button aligns with signup button */}
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogin}
            style={{
              ...ui.button.base,
              ...ui.button.secondary,
              width: "100%"
            }}
          >
            Login
          </button>
        </div>
      </div>

    </div>
  </div>
  );
}

export default Auth;