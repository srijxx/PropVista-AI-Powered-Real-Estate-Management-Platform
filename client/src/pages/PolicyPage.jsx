import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const DEFAULT_CONTENT = `PropVista Terms of Service & Privacy Policy

1. Acceptance of Terms
By accessing or using PropVista, you agree to be bound by these Terms of Service and our Privacy Policy.

2. Use of Service
PropVista is a real estate listing platform. You may use it to browse, list, and manage property listings. You agree not to misuse the platform or post false information.

3. Privacy & Data
We collect only the information necessary to provide the service. Your email and profile data are stored securely and are never sold to third parties.

4. Listings & Content
You are responsible for the accuracy of any listing you post. PropVista reserves the right to remove listings that violate our guidelines.

5. Intellectual Property
All content and design on PropVista is owned by PropVista unless otherwise noted.

6. Limitation of Liability
PropVista is not liable for any loss or damage arising from the use of listings or information on the platform.

7. Changes to Terms
We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance.

8. Contact
For questions, contact us at sreeja010605@gmail.com or visit the Contact page.`;

function PolicyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, content } = location.state || {};

  return (
    <AppLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "8px 0 40px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#374151",
            marginBottom: "24px",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "36px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            {title || "Terms of Service & Privacy Policy"}
          </h2>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#374151",
              whiteSpace: "pre-wrap",
            }}
          >
            {content || DEFAULT_CONTENT}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default PolicyPage;
