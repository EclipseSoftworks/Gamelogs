import { useEffect, useState } from "react";

export default function GameLogsViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/gamelogs");
      const data = await res.json();
      setLogs(data);
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0b1020", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>GameLogs Viewer</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
        {logs.map(game => (
          <div key={game.universeId} style={{ background: "#111827", padding: 16, borderRadius: 12 }}>
            <img
              src={game.imageUrl}
              alt={game.name}
              style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
            />
            <h2 style={{ fontSize: 18 }}>{game.name}</h2>
            <p style={{ color: "#9ca3af" }}>Players: {game.playing}</p>
            <button
              onClick={() =>
                (window.location.href = `roblox://placeID=${game.placeId}&gameID=${game.universeId}`)
              }
              style={{
                background: "#facc15",
                color: "black",
                fontWeight: 600,
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Join Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
