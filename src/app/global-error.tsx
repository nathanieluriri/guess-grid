"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global error boundary]", error);
    }
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0E0E10",
          color: "#F4F4F5",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            border: "1px solid #2A2A2E",
            borderRadius: "1.5rem",
            padding: "2rem",
            textAlign: "center",
            background: "#161618",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
            Something went very wrong
          </h1>
          <p style={{ margin: "0.75rem 0 1.5rem", fontSize: "0.875rem", color: "#A1A1AA" }}>
            The app could not render. Try reloading.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: "2.5rem",
              padding: "0 1rem",
              borderRadius: "9999px",
              background: "#F4F4F5",
              color: "#0E0E10",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: "1.5rem", fontFamily: "monospace", fontSize: "0.6875rem", color: "#71717A" }}>
              ref · {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
