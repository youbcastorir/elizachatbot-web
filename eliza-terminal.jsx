import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are ELIZA, the classic 1966 psychotherapist chatbot created by Joseph Weizenbaum at MIT. 

STRICT RULES:
- Respond ONLY IN UPPERCASE
- Keep responses SHORT (1-2 sentences max)
- Use classic ELIZA-style reflective questioning techniques
- Reflect the user's words back at them as questions
- Ask open-ended questions about feelings and relationships
- Occasionally use classic ELIZA phrases like "TELL ME MORE ABOUT...", "WHY DO YOU FEEL...", "DOES THAT CONCERN YOU?", "HOW LONG HAVE YOU FELT THIS WAY?"
- Stay in character as a 1966 terminal psychotherapist
- Never break character or acknowledge being AI
- Be slightly cold, clinical, and mechanical — like an old terminal program`;

export default function ElizaTerminal() {
  const [messages, setMessages] = useState([
    { type: "system", text: "[ELIZA] SYSTEM ONLINE — 1966" },
    { type: "reply", text: "GOOD DAY. I AM ELIZA. HOW CAN I HELP YOU TODAY?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim().toUpperCase();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { type: "user", text }]);
    setIsLoading(true);

    conversationRef.current.push({ role: "user", content: text });

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationRef.current,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "...";

      conversationRef.current.push({ role: "assistant", content: reply });
      setMessages((prev) => [...prev, { type: "reply", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "system", text: "[ERROR] TRANSMISSION FAILED. CHECK CONNECTION." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    conversationRef.current = [];
    setMessages([
      { type: "system", text: "[RECORDS BURNED] SESSION TERMINATED" },
      { type: "system", text: "[NEW SESSION INITIATED]" },
      { type: "reply", text: "GOOD DAY. I AM ELIZA. HOW CAN I HELP YOU TODAY?" },
    ]);
  };

  return (
    <div style={styles.page}>
      {/* Scanlines overlay */}
      <div style={styles.scanlines} />

      <div style={styles.crt}>
        {/* Header bar */}
        <div style={styles.header}>
          <span style={{ ...styles.dot, background: "#ff5f57" }} />
          <span style={{ ...styles.dot, background: "#ffbd2e" }} />
          <span style={{ ...styles.dot, background: "#28c940" }} />
          <span style={styles.headerTitle}>ELIZA PSYCHOTHERAPIST v1.0 — 1966</span>
        </div>

        {/* Chat area */}
        <div ref={chatRef} style={styles.chatArea}>
          {messages.map((msg, i) => (
            <div key={i} style={styles.line}>
              {msg.type === "user" && (
                <span style={styles.userPrefix}>&gt;&nbsp;</span>
              )}
              {msg.type === "reply" && (
                <span style={styles.elizaPrefix}>ELIZA:&nbsp;</span>
              )}
              {msg.type === "system" && (
                <span style={styles.systemPrefix}>***&nbsp;</span>
              )}
              <span
                style={
                  msg.type === "user"
                    ? styles.userText
                    : msg.type === "system"
                    ? styles.systemText
                    : styles.elizaText
                }
              >
                {msg.text}
              </span>
            </div>
          ))}
          {isLoading && (
            <div style={styles.line}>
              <span style={styles.elizaPrefix}>ELIZA:&nbsp;</span>
              <span style={{ ...styles.elizaText, ...styles.blink }}>█</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={styles.inputRow}>
          <span style={styles.promptSymbol}>&gt;</span>
          <input
            ref={inputRef}
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="TYPE YOUR RESPONSE..."
            autoFocus
            autoComplete="off"
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button style={styles.btnBurn} onClick={clearChat}>
            BURN RECORDS
          </button>
          <button
            style={isLoading ? { ...styles.btnTransmit, opacity: 0.5 } : styles.btnTransmit}
            onClick={sendMessage}
            disabled={isLoading}
          >
            TRANSMIT
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes flicker {
          0%,19.999%,22%,62.999%,64%,64.999%,70%,100% { opacity: 1; }
          20%,21.999%,63%,63.999%,65%,69.999% { opacity: 0.8; }
        }
        @keyframes scanmove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #00ff41; }
        ::placeholder { color: #005514; }
      `}</style>
    </div>
  );
}

const GREEN = "#00ff41";
const DIM_GREEN = "#00bb30";
const DARK_GREEN = "#003a0f";
const FONT = "'Share Tech Mono', monospace";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: FONT,
    position: "relative",
    overflow: "hidden",
  },
  scanlines: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
    pointerEvents: "none",
    zIndex: 999,
  },
  crt: {
    width: "100%",
    maxWidth: "720px",
    background: "#0a0a0a",
    border: `1px solid ${DIM_GREEN}`,
    borderRadius: "6px",
    boxShadow: `0 0 40px rgba(0,255,65,0.15), inset 0 0 80px rgba(0,0,0,0.5), 0 0 2px ${GREEN}`,
    animation: "flicker 8s infinite",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderBottom: `1px solid ${DARK_GREEN}`,
    background: "#050505",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
  headerTitle: {
    color: DIM_GREEN,
    fontSize: "11px",
    letterSpacing: "2px",
    marginLeft: "8px",
    fontFamily: FONT,
  },
  chatArea: {
    height: "420px",
    overflowY: "auto",
    padding: "20px 20px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  line: {
    display: "flex",
    alignItems: "flex-start",
    fontFamily: FONT,
    fontSize: "14px",
    lineHeight: "1.6",
  },
  userPrefix: { color: GREEN, whiteSpace: "nowrap" },
  elizaPrefix: { color: DIM_GREEN, whiteSpace: "nowrap" },
  systemPrefix: { color: "#555", whiteSpace: "nowrap" },
  userText: { color: GREEN },
  elizaText: { color: DIM_GREEN },
  systemText: { color: "#555", fontStyle: "italic" },
  blink: { animation: "blink 1s step-end infinite" },
  inputRow: {
    display: "flex",
    alignItems: "center",
    borderTop: `1px solid ${DARK_GREEN}`,
    padding: "12px 20px",
    gap: "10px",
  },
  promptSymbol: {
    color: GREEN,
    fontSize: "16px",
    fontFamily: FONT,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: GREEN,
    fontFamily: FONT,
    fontSize: "14px",
    letterSpacing: "1px",
    caretColor: GREEN,
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    padding: "12px 20px 16px",
    borderTop: `1px solid ${DARK_GREEN}`,
    justifyContent: "flex-end",
  },
  btnBurn: {
    background: "transparent",
    border: "1px solid #550000",
    color: "#cc0000",
    fontFamily: FONT,
    fontSize: "12px",
    letterSpacing: "2px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnTransmit: {
    background: DARK_GREEN,
    border: `1px solid ${GREEN}`,
    color: GREEN,
    fontFamily: FONT,
    fontSize: "12px",
    letterSpacing: "2px",
    padding: "8px 20px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: `0 0 8px rgba(0,255,65,0.2)`,
  },
};
