
import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { vehicles } from "./vehicles";
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello — welcome to Black Pearl Tours. How can I assist you today?" }
  ]);
  const listRef = useRef();
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);
  function pushBot(text) {
    setMessages(prev => [...prev, { from: "bot", text }]);
  }
  function sendUser(text) {
    setMessages(prev => [...prev, { from: "user", text }]);
    handleUserMessage(text);
  }
  function handleUserMessage(text) {
    const lc = text.toLowerCase();
    if (lc.includes("hours") || lc.includes("open")) {
      pushBot("We operate 06:00 - 20:00 Monday–Sunday. Need pickup outside these hours? We can arrange on request.");
      return;
    }
    if (lc.includes("payment") || lc.includes("pay")) {
      pushBot("We accept card payments, EFT, and cash. For corporate accounts we support invoicing.");
      return;
    }
    if (lc.includes("cancel") || lc.includes("cancellation")) {
      pushBot("Cancellations within 24 hours may incur fees. Would you like full cancellation policy details?");
      return;
    }
    if (lc.includes("quote") || lc.includes("price") || lc.includes("estimate")) {
      pushBot("Sure — please tell me pickup, dropoff, date/time and passenger count (e.g., 'OR Tambo to Sandton, 2025-11-01 14:00, 3 passengers').");
      return;
    }
    const pMatch = text.match(/(\d+)\s*(passengers|people|pax)/i);
    if (pMatch) {
      const pax = parseInt(pMatch[1], 10);
      const recommended = vehicles.filter(v => v.capacity >= pax).slice(0, 3);
      if (recommended.length === 0) {
        pushBot("We don't have a vehicle that matches that passenger count — please confirm your number or contact us.");
      } else {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: `Based on ${pax} passengers, these options might work:` },
          ...recommended.map(v => ({ from: "bot", type: "vehicle", payload: v }))
        ]);
      }
      return;
    }
    if (lc.includes("or tambo") && lc.includes("sandton")) {
      pushBot("Yes — service available OR Tambo ↔ Sandton. Typical travel time: approx 35–50 minutes depending on traffic.");
      return;
    }
    if (lc.includes("hi") || lc.includes("hello") || lc.includes("hey")) {
      pushBot("Hi there — how can I help with your shuttle today? You can ask for a quote, vehicle recommendation, or FAQ.");
      return;
    }
    pushBot("I can help with quotes, vehicle recommendations, routes, and FAQs. Try: 'quote OR Tambo to Sandton 2 passengers' or 'recommend for 10 passengers'.");
  }
  const quickReplies = [
    "Operating hours",
    "Payment methods",
    "OR Tambo to Sandton travel time",
    "Recommend for 3 passengers",
    "Get a quote"
  ];
  return (
    <div className={`chat-widget ${open ? "open" : ""}`} aria-hidden={!open}>
      {/* === Rounded black button with white SVG icon === */}
      <div
        className="chat-fab"
        title="Chat with us"
        onClick={() => setOpen(o => !o)}
      >
        {open ? (
          <span className="chat-close">✕</span>
        ) : (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff" />
            <circle cx="8.5" cy="10.3" r="1.1" fill="#666" />
            <circle cx="15.5" cy="10.3" r="1.1" fill="#666" />
            <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1" />
          </svg>
        )}
      </div>
      {/* === Chat panel === */}
      <div className="chat-panel" role="region" aria-label="Black Pearl assistant">
        <div className="chat-header">
          <div className="brand">Black Pearl Tours</div>
          <div className="subtitle">Shuttle Assistant</div>
        </div>
        <div className="chat-body" ref={listRef}>
          <MessageList messages={messages} />
        </div>
        <div className="chat-quick">
          {quickReplies.map((q, i) => (
            <button key={i} onClick={() => sendUser(q)} className="quick-btn">
              {q}
            </button>
          ))}
        </div>
        <MessageInput onSend={sendUser} />
      </div>
    </div>
  );
};


