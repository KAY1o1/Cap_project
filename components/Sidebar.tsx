import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const [loggedIn] = useState(false);

  async function login() {
    console.log("Starting Google login...");
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  
    console.log("Data:", data);
    console.log("Error:", error);
  }

  return (
    <div
      style={{
        width: "280px",
        background: "white",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>YouNote</h2>

      {!loggedIn ? (
        <>
          <p>Sign in to save notes.</p>

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </>
      ) : (
        <>
          <textarea
            placeholder="Write a note..."
            style={{
              width: "100%",
              height: "120px",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "10px",
            }}
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}