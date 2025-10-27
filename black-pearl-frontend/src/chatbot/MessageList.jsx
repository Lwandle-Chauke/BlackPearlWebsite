
import React from "react";
export default function MessageList({ messages }) {
  return (
    <div className="chat-msg-list" role="log" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={`chat-msg ${m.from === "user" ? "user" : "bot"}`}>
          <div className="msg-content">
            {m.type === "vehicle" ? (
              <div className="vehicle-card">
                <img src={m.payload.image} alt={m.payload.name} />
                <div className="vehicle-info">
                  <strong>{m.payload.name}</strong>
                  <p>{m.payload.description}</p>
                </div>
              </div>
            ) : (
              <div>{m.text}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
