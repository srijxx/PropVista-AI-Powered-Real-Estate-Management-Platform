import { useState } from "react";

function RateApp() {
  const [rating, setRating] = useState(0);

  const handleRate = (value) => {
    setRating(value);
    alert(`You rated ${value} star${value > 1 ? "s" : ""}`);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h2>Rate Our App</h2>
      <p style={{ marginTop: "10px" }}>
        Please rate your experience with PropVista
      </p>

      <div style={{ fontSize: "32px", marginTop: "20px", cursor: "pointer" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRate(star)}
            style={{
              color: star <= rating ? "gold" : "#cbd5e1",
              marginRight: "6px"
            }}
          >
            ★
          </span>
        ))}
      </div>

      {rating > 0 && (
        <p style={{ marginTop: "15px" }}>
          Your Rating: <b>{rating}/5</b>
        </p>
      )}
    </div>
  );
}

export default RateApp;
