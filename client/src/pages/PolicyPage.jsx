import { useLocation } from "react-router-dom";

function PolicyPage() {
  const location = useLocation();
  const { title, content } = location.state || {};

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2>{title}</h2>
      <p style={{ marginTop: "15px", lineHeight: "1.6" }}>
        {content}
      </p>
    </div>
  );
}

export default PolicyPage;
