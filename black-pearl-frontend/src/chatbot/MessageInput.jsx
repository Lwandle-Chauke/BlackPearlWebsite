
import React, { useState } from "react";
export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }
  return (
    <form className="chat-input-form" onSubmit={submit}>
      <input
        aria-label="Type your message"
        placeholder="Ask about vehicles, quotes, or FAQs..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" aria-label="Send">Send</button>
    </form>
  );
}
