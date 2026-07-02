const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

// Smart keyword parser
function parseQuery(message) {
  const msg = message.toLowerCase();
  const filters = {};

  // Type detection
  if (msg.includes("villa")) filters.type = "Villa";
  else if (msg.includes("apartment")) filters.type = "Apartment";
  else if (msg.includes("flat")) filters.type = "Flat";
  else if (msg.includes("house")) filters.type = "House";

  // Bedrooms
  const bedroomMatch = msg.match(/(\d)\s*bhk/);
  if (bedroomMatch) filters.bedrooms = parseInt(bedroomMatch[1]);

  // Budget - extract numbers near "lakh" or "lakhs"
  const budgetMatch = msg.match(/under\s*[₹rs]?\s*(\d+(?:\.\d+)?)\s*lakh/i) ||
                      msg.match(/(\d+(?:\.\d+)?)\s*lakh/i) ||
                      msg.match(/below\s*[₹rs]?\s*(\d+(?:\.\d+)?)\s*lakh/i);
  if (budgetMatch) filters.maxPrice = parseFloat(budgetMatch[1]) * 100000;

  // Location
  if (msg.includes("coimbatore")) filters.city = "Coimbatore";
  else if (msg.includes("erode")) filters.city = "Erode";

  // Area keywords
  const areas = ["rs puram","gandhipuram","peelamedu","saibaba colony","singanallur",
    "vadavalli","hopes college","race course","tidel park","kovaipudur","thudiyalur",
    "kuniyamuthur","erode town","perundurai","bhavani","gobichettipalayam","sathyamangalam"];
  for (const area of areas) {
    if (msg.includes(area)) { filters.area = area; break; }
  }

  // Status
  if (msg.includes("for sale") || msg.includes("buy") || msg.includes("purchase")) filters.status = "For Sale";
  else if (msg.includes("for rent") || msg.includes("rent")) filters.status = "For Rent";

  return filters;
}

function buildResponse(filters, properties, originalMessage) {
  const parts = [];
  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.type) parts.push(filters.type);
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.area) parts.push(`near ${filters.area}`);
  if (filters.maxPrice) parts.push(`under ₹${(filters.maxPrice/100000).toFixed(0)} Lakhs`);
  if (filters.status) parts.push(`(${filters.status})`);

  const filterDesc = parts.length > 0 ? parts.join(" ") : "your criteria";

  if (properties.length === 0) {
    return `I searched our database but couldn't find properties matching ${filterDesc}. Try broadening your search — for example, remove the budget limit or try a different area.`;
  }
  return `I found ${properties.length} propert${properties.length === 1 ? "y" : "ies"} matching ${filterDesc}. Here are the best matches:`;
}

function extractSuggestions(filters) {
  const chips = [];
  if (filters.bedrooms) chips.push(`${filters.bedrooms} BHK`);
  if (filters.type) chips.push(filters.type);
  if (filters.maxPrice) chips.push(`Under ₹${(filters.maxPrice/100000).toFixed(0)} Lakhs`);
  if (filters.city) chips.push(filters.city);
  if (filters.area) chips.push(filters.area.split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" "));
  if (filters.status) chips.push(filters.status);
  return chips;
}

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const filters = parseQuery(message);

    // Build MongoDB query
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.bedrooms) query.bedrooms = filters.bedrooms;
    if (filters.maxPrice) query.price = { $lte: filters.maxPrice };
    if (filters.status) query.status = filters.status;
    if (filters.city || filters.area) {
      const locationFilter = filters.area || filters.city;
      query.location = { $regex: locationFilter, $options: "i" };
    }

    // If no filters found, do a general listing
    const hasFilters = Object.keys(query).length > 0;
    let properties;
    if (hasFilters) {
      properties = await Property.find(query).sort({ createdAt: -1 }).limit(12).lean();
    } else {
      // General question — return recent properties
      properties = await Property.find({}).sort({ createdAt: -1 }).limit(6).lean();
    }

    const responseMessage = buildResponse(filters, properties, message);
    const suggestions = extractSuggestions(filters);

    res.json({
      intent: hasFilters ? "find_property" : "general",
      message: responseMessage,
      properties,
      suggestions,
      comparison: null,
      estimate: null
    });

  } catch (err) {
    console.error("AI Chat error:", err.message);
    res.status(500).json({
      intent: "general",
      message: "Something went wrong. Please try again.",
      properties: [], suggestions: [], comparison: null, estimate: null
    });
  }
});

module.exports = router;
