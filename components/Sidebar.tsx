import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// The YouTube video id from the URL (?v=...), kept in sync as the user moves
// between videos. YouTube is a single-page app, so navigating to another video
// does NOT reload the page — it fires `yt-navigate-finish` instead. We listen
// for that (and popstate) so the box always reflects the video currently open.
function useVideoId() {
  const read = () => new URLSearchParams(window.location.search).get("v");
  const [videoId, setVideoId] = useState<string | null>(read());

  useEffect(() => {
    const update = () => setVideoId(read());
    window.addEventListener("yt-navigate-finish", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("yt-navigate-finish", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  return videoId;
}

type Note = { content: string; created_at: string };

// INTERIM per-video storage (localStorage), to be replaced by the `notes` table.
const notesKey = (videoId: string) => `younote:notes:${videoId}`;

function readNotes(videoId: string): Note[] {
  try {
    return JSON.parse(localStorage.getItem(notesKey(videoId)) ?? "[]");
  } catch {
    return [];
  }
}

function writeNotes(videoId: string, notes: Note[]) {
  localStorage.setItem(notesKey(videoId), JSON.stringify(notes));
}

export default function Sidebar() {
  const [email, setEmail] = useState<string | null>(null);
  const loggedIn = email !== null;

  const videoId = useVideoId();
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const canSave = text.trim().length > 0; // no empty/whitespace-only notes

  // Restore an existing session, and react when login completes in another tab.
  useEffect(() => {
    const refresh = () =>
      supabase.auth
        .getSession()
        .then(({ data }) => setEmail(data.session?.user.email ?? null));

    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    // Google login completes in the separate tab we open for it, so the session
    // is written there — not in this tab. onAuthStateChange doesn't reliably
    // fire across tabs in a content script, so when the user switches back to
    // this tab we re-read the session from storage to reflect that login.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Load this video's saved notes whenever the video (or login state) changes.
  // Loading is keyed by videoId, so switching videos swaps to that video's own
  // list (fixes cross-video bleed) and a reload restores it (fixes losing notes).
  useEffect(() => {
    if (!loggedIn || !videoId) {
      setNotes([]);
      return;
    }
    // INTERIM: read from localStorage until the DB is wired up.
    setNotes(readNotes(videoId));

    // TODO(backend): load history from the `notes` table once it exists.
    // supabase
    //   .from("notes")
    //   .select("content, created_at")
    //   .eq("video_id", videoId)
    //   .order("created_at", { ascending: false })
    //   .then(({ data }) => setNotes(data ?? []));
  }, [loggedIn, videoId]);

  async function saveNote() {
    const content = text.trim();
    if (!content || !videoId) return; // guard: never save empty notes

    const next: Note[] = [
      { content, created_at: new Date().toISOString() },
      ...notes,
    ];
    setNotes(next);
    setText("");

    // INTERIM: persist per-video in localStorage so notes survive reloads and
    // stay separate per video. Replace with the DB insert below when ready.
    writeNotes(videoId, next);

    // TODO(backend): persist to the `notes` table once it exists.
    // await supabase.from("notes").insert({ video_id: videoId, content });
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
            style={{ width: "100%", padding: "10px", cursor: "pointer" }}
          >
            Continue with Google
          </button>
        </>
      ) : !videoId ? (
        // Logged in but not on a video page — nothing to attach notes to.
        <p style={{ fontSize: "12px", color: "#555" }}>
          Open a video to take notes.
        </p>
      ) : (
        <>
          <p style={{ fontSize: "12px", color: "#555" }}>Signed in as {email}</p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note..."
            style={{ width: "100%", height: "120px" }}
          />

          <button
            onClick={saveNote}
            disabled={!canSave}
            style={{
              width: "100%",
              marginTop: "10px",
              cursor: canSave ? "pointer" : "not-allowed",
              opacity: canSave ? 1 : 0.5,
            }}
          >
            Save
          </button>

          {/* Saved-note history for this video, newest first. */}
          {notes.length > 0 && (
            <ul style={{ marginTop: "12px", padding: 0, listStyle: "none" }}>
              {notes.map((note, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "13px",
                    padding: "8px",
                    marginBottom: "6px",
                    background: "#f4f4f4",
                    borderRadius: "6px",
                  }}
                >
                  <div>{note.content}</div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );

  async function login() {
    // Open Google in a real browser tab — it blocks login inside the extension popup.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://www.youtube.com/", skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      console.error("Login failed:", error?.message);
      return;
    }
    window.open(data.url, "_blank");
  }
}
