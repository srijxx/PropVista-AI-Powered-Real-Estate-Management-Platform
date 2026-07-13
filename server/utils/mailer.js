const nodemailer = require("nodemailer");

// ─── TRANSPORTER ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout:   20000,
  socketTimeout:     30000,
  logger: true,  // enable nodemailer internal logs to console
  debug: false,
});

// ─── SEND HELPER ──────────────────────────────────────────────────────────────
async function sendMail({ to, subject, html }) {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_gmail_app_password_here"
  ) {
    console.log("[mailer] Email not configured — skipping:", subject, "→", to);
    return;
  }
  console.log(`[mailer] Attempting to send "${subject}" → ${to}`);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `PropVista <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[mailer] ✅ Sent "${subject}" → ${to} (msgId: ${info.messageId})`);
  } catch (err) {
    console.error(`[mailer] ❌ Failed to send "${subject}" → ${to}`);
    console.error(`[mailer] Error: ${err.message}`);
    console.error(`[mailer] Code: ${err.code || "none"}`);
  }
}

// ─── SHARED STYLES & COMPONENTS ───────────────────────────────────────────────
const baseStyle = `
  body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;}
  *{box-sizing:border-box;}
`;

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>PropVista</title>
  <style>${baseStyle}</style>
</head>
<body>
  <div style="max-width:600px;margin:40px auto 20px;padding:0 16px;">
    ${content}
    <!-- FOOTER -->
    <div style="text-align:center;padding:24px 0 8px;">
      <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;letter-spacing:0.03em;">
        © ${new Date().getFullYear()} <strong style="color:#64748b;">PropVista</strong> — India's Trusted Real Estate Platform
      </p>
      <p style="font-size:11px;color:#b0bec5;margin:0;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function headerBanner(bgColor, icon, title, subtitle) {
  return `
  <div style="background:${bgColor};border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:30px;margin-bottom:14px;">${icon}</div>
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">${title}</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;line-height:1.5;">${subtitle}</p>
  </div>`;
}

function card(content, bg = "#fff") {
  return `<div style="background:${bg};border-radius:12px;padding:20px 24px;margin-bottom:14px;">${content}</div>`;
}

function labelValue(label, value) {
  return `
  <tr>
    <td style="padding:6px 0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:500;">${value}</td>
  </tr>`;
}

function pillBadge(text, color, bg) {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;color:${color};background:${bg};letter-spacing:0.03em;">${text}</span>`;
}

function actionButton(href, label, bg) {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:${bg};color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.02em;">${label}</a>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e8edf2;margin:16px 0;"/>`;
}

// ─── 1. OWNER BOOKING NOTIFICATION ───────────────────────────────────────────
async function sendOwnerBookingNotification({
  ownerEmail, ownerName,
  visitorName, visitorPhone, visitorEmail,
  propertyTitle, propertyLocation, propertyType, propertyPrice,
  visitDate, visitTime,
  message,
  bookingId,
}) {
  const fDate = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const fPrice = `₹ ${Number(propertyPrice || 0).toLocaleString("en-IN")}`;
  const now    = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const body = emailWrapper(`
  <!-- CARD -->
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#0f2857 0%,#1a4fa0 100%)",
      "🏡",
      "New Property Visit Scheduled",
      "A prospective buyer has booked a site visit for your listing."
    )}

    <!-- BODY -->
    <div style="padding:28px 32px;">

      <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">
        Dear <strong style="color:#0f2857;">${ownerName || "Property Owner"}</strong>,<br/>
        We are pleased to inform you that a visitor has scheduled a site visit for your property listed on <strong>PropVista</strong>. Please find the details below.
      </p>

      <!-- PROPERTY INFO -->
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">📌 Property Listed</p>
        <p style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px;">${propertyTitle}</p>
        <p style="font-size:13px;color:#475569;margin:0 0 4px;">📍 ${propertyLocation}</p>
        <p style="font-size:13px;color:#475569;margin:0;">
          ${pillBadge(propertyType, "#1d4ed8", "#dbeafe")}
          &nbsp;
          ${pillBadge(fPrice, "#065f46", "#d1fae5")}
        </p>
      </div>

      <!-- VISIT SCHEDULE -->
      <div style="display:table;width:100%;margin-bottom:18px;">
        <div style="display:table-cell;width:50%;padding-right:8px;">
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 8px;">📅 Visit Date</p>
            <p style="font-size:14px;font-weight:700;color:#14532d;margin:0;">${fDate}</p>
          </div>
        </div>
        <div style="display:table-cell;width:50%;padding-left:8px;">
          <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 8px;">🕐 Preferred Time</p>
            <p style="font-size:14px;font-weight:700;color:#7c2d12;margin:0;">${visitTime}</p>
          </div>
        </div>
      </div>

      <!-- VISITOR DETAILS -->
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">👤 Visitor Information</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("Full Name",   visitorName  || "—")}
          ${labelValue("Phone",       `<a href="tel:${visitorPhone}" style="color:#2563eb;text-decoration:none;">${visitorPhone || "Not provided"}</a>`)}
          ${labelValue("Email",       `<a href="mailto:${visitorEmail}" style="color:#2563eb;text-decoration:none;">${visitorEmail || "—"}</a>`)}
          ${message ? labelValue("Message", `<em style="color:#64748b;">"${message}"</em>`) : ""}
        </table>
      </div>

      ${divider()}

      <!-- ACTION BUTTONS -->
      <p style="font-size:13px;color:#64748b;margin:0 0 14px;">You may reach out to the visitor directly to confirm the visit:</p>
      <div style="text-align:center;margin-bottom:20px;">
        ${actionButton(`tel:${visitorPhone}`, "📞 Call Visitor", "#16a34a")}
        &nbsp;&nbsp;
        ${actionButton(
          `mailto:${visitorEmail}?subject=Re%3A%20Property%20Visit%20-%20${encodeURIComponent(propertyTitle)}&body=Dear%20${encodeURIComponent(visitorName || "")}%2C%0A%0AThank%20you%20for%20your%20interest%20in%20my%20property.%20I%20look%20forward%20to%20meeting%20you.%0A%0ARegards`,
          "✉️ Reply by Email",
          "#2563eb"
        )}
      </div>

      ${divider()}

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.8;">
        Notification received at ${now}<br/>
        Booking Reference: <code style="font-size:11px;background:#f1f5f9;padding:2px 8px;border-radius:4px;color:#475569;">${bookingId}</code>
      </p>
    </div>
  </div>`);

  await sendMail({
    to: ownerEmail,
    subject: `🏡 New Visit Scheduled — ${propertyTitle} | PropVista`,
    html: body,
  });
}

// ─── 2. VISITOR BOOKING CONFIRMATION ─────────────────────────────────────────
async function sendVisitorBookingConfirmation({
  visitorEmail, visitorName,
  propertyTitle, propertyLocation, propertyType, propertyPrice,
  ownerName, ownerPhone, ownerEmail: propOwnerEmail,
  visitDate, visitTime,
  bookingId,
}) {
  const fDate  = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const fPrice = `₹ ${Number(propertyPrice || 0).toLocaleString("en-IN")}`;
  const now    = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const body = emailWrapper(`
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#059669 0%,#10b981 100%)",
      "✅",
      "Booking Confirmed!",
      "Your property visit has been successfully scheduled."
    )}

    <div style="padding:28px 32px;">

      <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">
        Dear <strong style="color:#065f46;">${visitorName || "Valued Customer"}</strong>,<br/>
        Thank you for your interest in a property listed on <strong>PropVista</strong>. Your site visit has been confirmed. Below are your complete booking details for reference.
      </p>

      <!-- BOOKING SUMMARY BOX -->
      <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:1px solid #6ee7b7;border-radius:12px;padding:20px 24px;margin-bottom:18px;text-align:center;">
        <p style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Booking Confirmed</p>
        <p style="font-size:13px;color:#065f46;margin:0;font-weight:600;">Reference: <code style="background:#d1fae5;padding:2px 8px;border-radius:4px;">${bookingId}</code></p>
      </div>

      <!-- PROPERTY DETAILS -->
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">🏠 Property Details</p>
        <p style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px;">${propertyTitle}</p>
        <p style="font-size:13px;color:#475569;margin:0 0 6px;">📍 ${propertyLocation}</p>
        <p style="font-size:13px;color:#475569;margin:0;">
          ${pillBadge(propertyType, "#1d4ed8", "#dbeafe")}
          &nbsp;
          ${pillBadge(fPrice, "#065f46", "#d1fae5")}
        </p>
      </div>

      <!-- VISIT DATE & TIME -->
      <div style="display:table;width:100%;margin-bottom:18px;">
        <div style="display:table-cell;width:50%;padding-right:8px;">
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 8px;">📅 Visit Date</p>
            <p style="font-size:14px;font-weight:700;color:#14532d;margin:0;">${fDate}</p>
          </div>
        </div>
        <div style="display:table-cell;width:50%;padding-left:8px;">
          <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:16px;text-align:center;">
            <p style="font-size:11px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 8px;">🕐 Scheduled Time</p>
            <p style="font-size:14px;font-weight:700;color:#7c2d12;margin:0;">${visitTime}</p>
          </div>
        </div>
      </div>

      <!-- OWNER CONTACT -->
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">📋 Property Owner Contact</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("Name",  ownerName || "—")}
          ${labelValue("Phone", `<a href="tel:${ownerPhone}" style="color:#2563eb;text-decoration:none;">${ownerPhone || "—"}</a>`)}
          ${labelValue("Email", `<a href="mailto:${propOwnerEmail}" style="color:#2563eb;text-decoration:none;">${propOwnerEmail || "—"}</a>`)}
        </table>
      </div>

      <!-- PRE-VISIT CHECKLIST -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        <p style="font-size:12px;font-weight:700;color:#92400e;margin:0 0 10px;letter-spacing:0.03em;">💡 Before Your Visit — Checklist</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="font-size:13px;color:#78350f;padding:4px 0;">✔</td><td style="font-size:13px;color:#78350f;padding:4px 0 4px 8px;">Call the owner a day prior to confirm availability</td></tr>
          <tr><td style="font-size:13px;color:#78350f;padding:4px 0;">✔</td><td style="font-size:13px;color:#78350f;padding:4px 0 4px 8px;">Carry a valid government photo ID (Aadhaar / PAN / Passport)</td></tr>
          <tr><td style="font-size:13px;color:#78350f;padding:4px 0;">✔</td><td style="font-size:13px;color:#78350f;padding:4px 0 4px 8px;">Note the full address and plan your route in advance</td></tr>
          <tr><td style="font-size:13px;color:#78350f;padding:4px 0;">✔</td><td style="font-size:13px;color:#78350f;padding:4px 0 4px 8px;">Prepare a list of questions about the property and amenities</td></tr>
          <tr><td style="font-size:13px;color:#78350f;padding:4px 0;">✔</td><td style="font-size:13px;color:#78350f;padding:4px 0 4px 8px;">Check for water, electricity, and maintenance details during the visit</td></tr>
        </table>
      </div>

      ${divider()}

      <!-- CONTACT OWNER BUTTON -->
      <div style="text-align:center;margin-bottom:20px;">
        ${actionButton(`tel:${ownerPhone}`, "📞 Contact Owner", "#0f2857")}
      </div>

      ${divider()}

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.8;">
        Booking confirmed on ${now}<br/>
        You can manage your bookings anytime in the <strong style="color:#475569;">My Bookings</strong> section on PropVista.
      </p>
    </div>
  </div>`);

  await sendMail({
    to: visitorEmail,
    subject: `✅ Visit Confirmed — ${propertyTitle} on ${fDate} | PropVista`,
    html: body,
  });
}

// ─── 3. CANCELLATION EMAIL ────────────────────────────────────────────────────
async function sendCancellationEmail({
  toEmail, toName, role,
  propertyTitle, visitDate, visitTime,
  cancelledBy,
}) {
  const fDate = new Date(visitDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const now   = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const ownerMsg   = `The site visit for your property has been cancelled by the visitor. We apologise for any inconvenience caused. The listing remains active and new visits can be booked.`;
  const visitorMsg = `Your scheduled site visit has been successfully cancelled as per your request. We hope to assist you in finding your ideal property soon.`;

  const body = emailWrapper(`
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#dc2626 0%,#ef4444 100%)",
      "❌",
      "Visit Booking Cancelled",
      role === "owner"
        ? "A scheduled visit to your property has been cancelled."
        : "Your property visit booking has been cancelled."
    )}

    <div style="padding:28px 32px;">

      <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">
        Dear <strong style="color:#7f1d1d;">${toName || (role === "owner" ? "Property Owner" : "Valued Customer")}</strong>,<br/>
        ${role === "owner" ? ownerMsg : visitorMsg}
      </p>

      <!-- CANCELLED BOOKING DETAILS -->
      <div style="background:#fff5f5;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">🚫 Cancelled Booking Details</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("Property",     `<strong style="color:#0f172a;">${propertyTitle}</strong>`)}
          ${labelValue("Visit Date",   fDate)}
          ${labelValue("Time",         visitTime)}
          ${labelValue("Cancelled By", cancelledBy)}
          ${labelValue("Cancelled On", now)}
        </table>
      </div>

      ${role === "visitor" ? `
      <!-- CTA for visitor -->
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:18px;text-align:center;">
        <p style="font-size:14px;color:#1e40af;font-weight:600;margin:0 0 12px;">Still looking for your perfect property?</p>
        <p style="font-size:13px;color:#3b82f6;margin:0;">Browse thousands of verified listings on PropVista and book a new visit at any time.</p>
      </div>` : `
      <!-- Message for owner -->
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin-bottom:18px;text-align:center;">
        <p style="font-size:14px;color:#065f46;font-weight:600;margin:0;">Your property listing remains active on PropVista.</p>
        <p style="font-size:13px;color:#16a34a;margin:8px 0 0;">New visitors can continue to discover and book your property.</p>
      </div>`}

      ${divider()}

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.8;">
        If you believe this cancellation was made in error or need assistance,<br/>
        please contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color:#2563eb;">${process.env.EMAIL_USER}</a>.
      </p>
    </div>
  </div>`);

  await sendMail({
    to: toEmail,
    subject: `❌ Visit Cancelled — ${propertyTitle} | PropVista`,
    html: body,
  });
}

module.exports = {
  sendOwnerBookingNotification,
  sendVisitorBookingConfirmation,
  sendCancellationEmail,
  sendContactNotification,
  sendFeedbackNotification,
};

// ─── 4. CONTACT MESSAGE NOTIFICATION ─────────────────────────────────────────
// Sent to admin (EMAIL_USER) when a user submits the Contact form
async function sendContactNotification({ name, email, subject, message }) {
  const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const body = emailWrapper(`
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#0f2857 0%,#1a4fa0 100%)",
      "✉️",
      "New Contact Message",
      "A user has submitted a message via the Contact page on PropVista."
    )}

    <div style="padding:28px 32px;">

      <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">
        You have received a new support message on <strong>PropVista</strong>. Please respond within 24 hours.
      </p>

      <!-- SENDER DETAILS -->
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">👤 Sender Details</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("Name",    name)}
          ${labelValue("Email",   `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>`)}
          ${labelValue("Subject", subject || "—")}
          ${labelValue("Sent At", now)}
        </table>
      </div>

      <!-- MESSAGE BODY -->
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        <p style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">💬 Message</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
      </div>

      ${divider()}

      <!-- REPLY BUTTON -->
      <div style="text-align:center;margin-bottom:8px;">
        ${actionButton(
          `mailto:${email}?subject=Re%3A%20${encodeURIComponent(subject || "Your message to PropVista")}&body=Dear%20${encodeURIComponent(name)}%2C%0A%0AThank%20you%20for%20contacting%20PropVista.%0A%0A`,
          "✉️ Reply to User",
          "#2563eb"
        )}
      </div>
    </div>
  </div>`);

  await sendMail({
    to: process.env.EMAIL_USER,
    subject: `📩 Contact Message from ${name}: ${subject || "(no subject)"} | PropVista`,
    html: body,
  });

  // Also send an acknowledgement to the user
  const ackBody = emailWrapper(`
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#059669 0%,#10b981 100%)",
      "✅",
      "Message Received!",
      "We have received your message and will respond shortly."
    )}

    <div style="padding:28px 32px;">
      <p style="font-size:15px;color:#334155;margin:0 0 18px;line-height:1.7;">
        Dear <strong style="color:#065f46;">${name}</strong>,<br/>
        Thank you for reaching out to us. We have received your message and our team will get back to you within <strong>24 hours</strong>.
      </p>

      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
        <p style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">📋 Your Message Summary</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("Subject", subject || "—")}
          ${labelValue("Sent",    now)}
        </table>
        <p style="font-size:13px;color:#64748b;font-style:italic;margin:10px 0 0;border-top:1px solid #e2e8f0;padding-top:10px;">"${message.length > 120 ? message.substring(0, 120) + "..." : message}"</p>
      </div>

      ${divider()}

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.8;">
        If this is urgent, you can also reach us at<br/>
        <a href="mailto:${process.env.EMAIL_USER}" style="color:#2563eb;">${process.env.EMAIL_USER}</a>
      </p>
    </div>
  </div>`);

  await sendMail({
    to: email,
    subject: `✅ We received your message — PropVista Support`,
    html: ackBody,
  });
}

// ─── 5. FEEDBACK NOTIFICATION ─────────────────────────────────────────────────
// Sent to admin (EMAIL_USER) when a user submits feedback
async function sendFeedbackNotification({ category, rating, message, userName }) {
  const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const STARS = "★".repeat(rating) + "☆".repeat(5 - rating);
  const STAR_COLOR = rating >= 4 ? "#16a34a" : rating >= 3 ? "#f59e0b" : "#ef4444";

  const CATEGORY_ICONS = {
    general:     "💬",
    bug:         "🐛",
    feature:     "✨",
    ui:          "🎨",
    performance: "⚡",
  };
  const catIcon = CATEGORY_ICONS[category] || "💬";

  const body = emailWrapper(`
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(15,40,87,0.10);">

    ${headerBanner(
      "linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
      "⭐",
      "New User Feedback",
      "A user has submitted feedback about their PropVista experience."
    )}

    <div style="padding:28px 32px;">

      <!-- RATING HIGHLIGHT -->
      <div style="background:linear-gradient(135deg,#fef9c3,#fefce8);border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:18px;text-align:center;">
        <p style="font-size:32px;font-weight:800;color:${STAR_COLOR};margin:0 0 4px;letter-spacing:2px;">${STARS}</p>
        <p style="font-size:24px;font-weight:800;color:#1e293b;margin:0 0 4px;">${rating} / 5</p>
        <p style="font-size:13px;color:#78350f;margin:0;font-weight:600;">
          ${rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"} Rating
        </p>
      </div>

      <!-- FEEDBACK DETAILS -->
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:10px;padding:18px 20px;margin-bottom:18px;">
        <p style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">📋 Feedback Details</p>
        <table style="width:100%;border-collapse:collapse;">
          ${labelValue("From",     userName || "Anonymous")}
          ${labelValue("Category", `${catIcon} ${category.charAt(0).toUpperCase() + category.slice(1)}`)}
          ${labelValue("Rating",   `${rating}/5 — ${STARS}`)}
          ${labelValue("Received", now)}
        </table>
      </div>

      <!-- MESSAGE -->
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">💬 User Feedback</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
      </div>

      ${divider()}

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.8;">
        This feedback has been saved to your PropVista dashboard.<br/>
        Keep improving based on user insights!
      </p>
    </div>
  </div>`);

  await sendMail({
    to: process.env.EMAIL_USER,
    subject: `⭐ ${rating}/5 Feedback from ${userName || "Anonymous"} [${category}] | PropVista`,
    html: body,
  });
}
