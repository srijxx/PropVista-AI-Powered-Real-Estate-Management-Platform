import { useState, useRef, useEffect } from "react";
import API_BASE from '../config';
import { useNavigate } from "react-router-dom";
import { getTypeImage } from "../utils/typeImages";

const SUGGESTIONS = [
  "Find me a 3 BHK villa under ₹80 lakhs in Coimbatore",
  "Estimate price for 1200 sqft 2 BHK in Peelamedu",
  "Should I invest in Coimbatore or Erode?",
  "Show affordable flats under ₹30 lakhs",
  "Which area has the best rental returns?",
];

function PropertyCard({ p, navigate }) {
  return (
    <div className="ai-prop-card" onClick={() => navigate(`/properties/${p._id}`)}>
      <img src={getTypeImage(p)} alt={p.title} className="ai-prop-img" />
      <div className="ai-prop-info">
        <p className="ai-prop-name">{p.title}</p>
        <p className="ai-prop-loc">📍 {p.location}</p>
        <div className="ai-prop-footer">
          <span className="ai-prop-price">₹ {(p.price / 100000).toFixed(1)}L</span>
          <span className="ai-prop-chips">{p.bedrooms}🛏 · {p.area} sqft</span>
          <span className={`ai-prop-badge ${p.status === "For Sale" ? "sale" : "rent"}`}>{p.status}</span>
        </div>
      </div>
    </div>
  );
}

function AIAssistant({ userName }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{
    role: "model", content: null,
    parsed: {
      intent: "general",
      message: `Hi ${userName || "there"}! 👋 I'm PropVista AI, your real estate assistant.\n\nI can help you:\n🔍 Find properties matching your needs\n💰 Estimate property prices\n📈 Give investment advice\n⚖️ Compare areas\n\nJust ask me anything!`,
      properties: [], comparison: null, estimate: null
    }
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, parsed: null }]);
    setLoading(true);
    try {
      const history = messages.filter(m => m.content)
        .map(m => ({ role: m.role, content: m.content || m.parsed?.message || "" }));
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", content: null, parsed: data }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "model", content: null,
        parsed: { intent: "general", message: "Sorry, I couldn't connect. Please try again.", properties: [], comparison: null, estimate: null }
      }]);
    } finally { setLoading(false); }
  };

  const renderMessage = (msg, i) => {
    if (msg.role === "user") return (
      <div key={i} className="ai-msg ai-msg-user">
        <div className="ai-bubble ai-bubble-user">{msg.content}</div>
      </div>
    );
    const p = msg.parsed;
    if (!p) return null;
    return (
      <div key={i} className="ai-msg ai-msg-bot">
        <div className="ai-bot-icon">🤖</div>
        <div className="ai-bot-content">
          <div className="ai-bubble ai-bubble-bot">
            {p.message.split("\n").map((line, j) => (
              <span key={j}>{line}{j < p.message.split("\n").length - 1 && <br />}</span>
            ))}
          </div>
          {p.properties?.length > 0 && (
            <div className="ai-props-list">
              <p className="ai-props-label">Found {p.properties.length} matching properties:</p>
              {p.properties.map(prop => <PropertyCard key={prop._id} p={prop} navigate={navigate} />)}
            </div>
          )}
          {p.estimate && (
            <div className="ai-estimate-card">
              <div className="ai-est-row">
                <span className="ai-est-label">Estimated Price</span>
                <span className="ai-est-value">₹ {(p.estimate.estimatedPrice / 100000).toFixed(1)} Lakh</span>
              </div>
              {p.estimate.range && <div className="ai-est-row"><span className="ai-est-label">Range</span><span className="ai-est-value2">{p.estimate.range}</span></div>}
              {p.estimate.confidence && <div className="ai-est-row"><span className="ai-est-label">Confidence</span><span className="ai-est-badge">{p.estimate.confidence}</span></div>}
              {p.estimate.avgPpsf && <div className="ai-est-row"><span className="ai-est-label">Avg ₹/sqft</span><span className="ai-est-value2">₹ {p.estimate.avgPpsf.toLocaleString()}</span></div>}
            </div>
          )}
          {p.comparison && (
            <div className="ai-compare-card">
              <div className="ai-compare-areas">
                <div className="ai-compare-area">
                  <p className="ai-compare-name">{p.comparison.areaA?.area}</p>
                  <p className="ai-compare-price">Avg ₹ {(p.comparison.areaA?.avgPrice / 100000).toFixed(1)}L</p>
                  <p className="ai-compare-count">{p.comparison.areaA?.count} listings</p>
                </div>
                <div className="ai-compare-vs">VS</div>
                <div className="ai-compare-area">
                  <p className="ai-compare-name">{p.comparison.areaB?.area}</p>
                  <p className="ai-compare-price">Avg ₹ {(p.comparison.areaB?.avgPrice / 100000).toFixed(1)}L</p>
                  <p className="ai-compare-count">{p.comparison.areaB?.count} listings</p>
                </div>
              </div>
              {p.comparison.winner && <div className="ai-compare-winner">🏆 Recommended: <strong>{p.comparison.winner}</strong></div>}
              {p.comparison.reason && <p className="ai-compare-reason">{p.comparison.reason}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-header-left">
          <span className="ai-header-icon">🤖</span>
          <div>
            <p className="ai-header-title">PropVista AI</p>
            <p className="ai-header-sub">Real Estate Intelligence</p>
          </div>
        </div>
        <span className="ai-beta-badge">Beta</span>
      </div>
      <div className="ai-messages">
        {messages.map((m, i) => renderMessage(m, i))}
        {loading && (
          <div className="ai-msg ai-msg-bot">
            <div className="ai-bot-icon">🤖</div>
            <div className="ai-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 1 && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map(s => <button key={s} className="ai-suggest-btn" onClick={() => sendMessage(s)}>{s}</button>)}
        </div>
      )}
      <div className="ai-input-row">
        <input className="ai-input" placeholder="Ask me anything about properties..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()} disabled={loading} />
        <button className="ai-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          {loading ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
