import { useState, useEffect, useRef } from "react";
import API_BASE from '../config';

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs/24) > 1 ? "s" : ""} ago`;
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchLatest = () => {
      fetch(`${API_BASE}/api/properties")
        .then(r => r.json())
        .then(data => {
          const recent = [...data]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          setNotifications(recent.map(p => ({
            id: p._id,
            title: p.title,
            sub: `${p.location} • ₹ ${Number(p.price).toLocaleString("en-IN")}`,
            time: timeAgo(p.createdAt),
            type: p.type,
          })));
        })
        .catch(() => {});
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeIcon = { Apartment: "🏢", House: "🏠", Villa: "🏡", Flat: "🛋️" };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button className="ndb-bell" onClick={() => setOpen(o => !o)}
        style={{ background: "#f4f6fb", width: 34, height: 34, borderRadius: "50%",
          border: "none", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
        🔔
      </button>

      {open && (
        <div className="ndb-notif-dropdown">
          <div className="ndb-notif-header">
            <span>Notifications</span>
            <span className="ndb-notif-count">{notifications.length} new</span>
          </div>
          {notifications.length === 0
            ? <p className="ndb-notif-empty">No new properties</p>
            : notifications.map(n => (
              <div key={n.id} className="ndb-notif-item">
                <div className="ndb-notif-icon">{typeIcon[n.type] || "🏠"}</div>
                <div className="ndb-notif-body">
                  <p className="ndb-notif-title">{n.title}</p>
                  <p className="ndb-notif-sub">{n.sub}</p>
                  <p className="ndb-notif-time">{n.time}</p>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

export default Notifications;
