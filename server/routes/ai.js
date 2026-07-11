const express  = require("express");
const router   = express.Router();
const Property = require("../models/Property");

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARSER — fully dynamic, no hardcoded city/area lists
// Extracts every meaningful filter from the user's natural language query
// ─────────────────────────────────────────────────────────────────────────────
function parseQuery(msg) {
  const m = msg.toLowerCase().trim();
  const filters = {};

  // ── PROPERTY TYPE ─────────────────────────────────────────────────────────
  if (/\bvilla\b/.test(m))                       filters.type = "Villa";
  else if (/\bapartment\b/.test(m))              filters.type = "Apartment";
  else if (/\bflat\b/.test(m))                   filters.type = "Flat";
  else if (/\bhouse\b|\bhome\b|\bindependent\b/.test(m)) filters.type = "House";

  // ── BEDROOMS — "2 bhk", "3 bedroom", "2 bed" ─────────────────────────────
  const bedMatch = m.match(/(\d)\s*(?:bhk|bed(?:room)?s?)/);
  if (bedMatch) filters.bedrooms = parseInt(bedMatch[1]);

  // ── BUDGET — "under 50 lakhs", "below 80L", "50 lakh", "50L" ─────────────
  const budgetMatch =
    m.match(/(?:under|below|within|max|less\s*than|upto?)\s*[₹rs]?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lac)\b/i) ||
    m.match(/[₹rs]\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lac)\b/i) ||
    m.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lac)\b/i);
  if (budgetMatch) filters.maxPrice = parseFloat(budgetMatch[1]) * 100000;

  // ── MIN BUDGET — "above 30 lakhs" ─────────────────────────────────────────
  const minBudget = m.match(/(?:above|more\s*than|minimum|min|atleast|at\s*least)\s*[₹rs]?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lac)/i);
  if (minBudget) filters.minPrice = parseFloat(minBudget[1]) * 100000;

  // ── STATUS ────────────────────────────────────────────────────────────────
  if (/\brent\b|\bto\s*let\b|\bfor\s*rent\b|\bleasing\b/.test(m)) filters.status = "For Rent";
  else if (/\bbuy\b|\bpurchase\b|\bfor\s*sale\b|\bsale\b|\bsell\b/.test(m)) filters.status = "For Sale";

  // ── MIN AREA — "1000 sqft", "1200 sq ft", "minimum 900" ──────────────────
  const areaMatch = m.match(/(\d{3,5})\s*(?:sq\.?\s*ft|sqft|square\s*feet?)/);
  if (areaMatch) filters.minArea = parseInt(areaMatch[1]);

  // ── LOCATION — extract location name after "in", "at", "near", "around"
  const locationMatch =
    m.match(/(?:in|at|near|around)\s+([a-z][a-z\s]{2,25?})(?=\s+(?:under|below|with|for|above|around|\d)|$)/i) ||
    m.match(/(?:in|at|near|around)\s+([a-z][a-z\s]{2,20})/i);
  if (locationMatch) {
    filters.location = locationMatch[1].trim()
      .replace(/\s*(under|below|for|with|sale|rent|buy|above|around)\b.*/i, "")
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(w => w.length > 1 && !["in","at","near","around","the","a"].includes(w))
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    if (!filters.location) delete filters.location;
  }

  return filters;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORER — calculates how well a property matches the parsed filters
// Returns a score 0–100. 0 means "does not match required filters at all".
// ─────────────────────────────────────────────────────────────────────────────
function scoreProperty(p, filters) {
  let score  = 0;
  let missed = 0; // hard-disqualifiers

  // Type — exact match required if specified
  if (filters.type) {
    if (p.type === filters.type) score += 30;
    else missed++;
  }

  // Bedrooms — exact or ±1 tolerance
  if (filters.bedrooms) {
    if (p.bedrooms === filters.bedrooms)          score += 25;
    else if (Math.abs(p.bedrooms - filters.bedrooms) === 1) score += 10;
    else missed++;
  }

  // Max price
  if (filters.maxPrice) {
    if (p.price <= filters.maxPrice)             score += 20;
    else missed++;
  }

  // Min price
  if (filters.minPrice) {
    if (p.price >= filters.minPrice)             score += 10;
    else missed++;
  }

  // Status
  if (filters.status) {
    if (p.status === filters.status)             score += 15;
    else missed++;
  }

  // Min area
  if (filters.minArea) {
    if ((p.area || 0) >= filters.minArea)        score += 10;
    else missed++;
  }

  // Location — partial case-insensitive match
  if (filters.location) {
    const loc = (p.location || "").toLowerCase();
    const words = filters.location.toLowerCase().split(" ").filter(Boolean);
    const matched = words.filter(w => loc.includes(w)).length;
    if (matched > 0) score += Math.round((matched / words.length) * 20);
    else missed++;
  }

  // Hard disqualify if any REQUIRED filter missed
  if (missed > 0) return 0;

  // Bonus: boost popular/featured properties slightly
  if (p.featured) score += 5;

  return Math.min(score, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE MESSAGE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildMessage(filters, count) {
  const parts = [];

  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.type)     parts.push(filters.type);
  if (filters.location) parts.push(`in ${filters.location}`);
  if (filters.maxPrice) parts.push(`under ₹${(filters.maxPrice / 100000).toFixed(0)} Lakhs`);
  if (filters.minPrice) parts.push(`above ₹${(filters.minPrice / 100000).toFixed(0)} Lakhs`);
  if (filters.status)   parts.push(`(${filters.status})`);
  if (filters.minArea)  parts.push(`≥ ${filters.minArea} sqft`);

  const desc = parts.length ? parts.join(" ") : "your criteria";

  if (count === 0) {
    return `No properties found matching ${desc}. Try adjusting your filters — for example, increase the budget, remove the bedroom count, or try a different location.`;
  }

  return `Found ${count} propert${count === 1 ? "y" : "ies"} matching ${desc}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION CHIPS — derived from what was parsed
// ─────────────────────────────────────────────────────────────────────────────
function buildSuggestions(filters) {
  const chips = [];
  if (filters.bedrooms) chips.push(`${filters.bedrooms} BHK`);
  if (filters.type)     chips.push(filters.type);
  if (filters.maxPrice) chips.push(`Under ₹${(filters.maxPrice / 100000).toFixed(0)} Lakhs`);
  if (filters.location) chips.push(filters.location);
  if (filters.status)   chips.push(filters.status);
  if (filters.minArea)  chips.push(`${filters.minArea}+ sqft`);
  return chips;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat
// ─────────────────────────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please type what you are looking for." });
    }

    const filters   = parseQuery(message);
    const hasFilter = Object.keys(filters).length > 0;

    // ── BUILD MONGODB QUERY ──────────────────────────────────────────────────
    const dbQuery = {};

    if (filters.type)                              dbQuery.type     = filters.type;
    if (filters.bedrooms)                          dbQuery.bedrooms = filters.bedrooms;
    if (filters.status)                            dbQuery.status   = filters.status;
    if (filters.maxPrice || filters.minPrice) {
      dbQuery.price = {};
      if (filters.maxPrice) dbQuery.price.$lte = filters.maxPrice;
      if (filters.minPrice) dbQuery.price.$gte = filters.minPrice;
    }
    if (filters.minArea)                           dbQuery.area     = { $gte: filters.minArea };
    if (filters.location) {
      // Search each word of the location independently for flexibility
      const words = filters.location.split(" ").filter(w => w.length > 2);
      if (words.length === 1) {
        dbQuery.location = { $regex: words[0], $options: "i" };
      } else {
        // Match if location contains ANY of the words
        dbQuery.$or = words.map(w => ({ location: { $regex: w, $options: "i" } }));
      }
    }

    // ── FETCH CANDIDATES ─────────────────────────────────────────────────────
    let candidates;
    if (hasFilter) {
      // Fetch with DB filters first (fast)
      candidates = await Property.find(dbQuery).sort({ createdAt: -1 }).limit(50).lean();

      // If strict DB query returns nothing, widen — drop bedrooms exact match
      if (candidates.length === 0 && filters.bedrooms) {
        const relaxed = { ...dbQuery };
        delete relaxed.bedrooms;
        candidates = await Property.find(relaxed).sort({ createdAt: -1 }).limit(50).lean();
      }
    } else {
      // No filters at all — return nothing meaningful, ask user to be specific
      return res.json({
        intent:     "clarify",
        message:    "Please tell me what you're looking for — for example: '2 BHK apartment in Coimbatore under 50 lakhs' or 'Villa for rent in Peelamedu'.",
        properties: [],
        suggestions: [
          "2 BHK Apartment in Coimbatore",
          "Villa under 80 Lakhs",
          "3 BHK House for rent",
          "Flat in Peelamedu under 40 Lakhs",
        ],
        comparison: null,
        estimate:   null,
      });
    }

    // ── SCORE AND RANK ────────────────────────────────────────────────────────
    // Convert to plain objects first so _matchScore is included in JSON response
    const scored = candidates
      .map(p => {
        const plain = JSON.parse(JSON.stringify(p));
        plain._matchScore = scoreProperty(p, filters);
        return plain;
      })
      .filter(p => p._matchScore > 0)
      .sort((a, b) => b._matchScore - a._matchScore)
      .slice(0, 12);

    res.json({
      intent:      "find_property",
      message:     buildMessage(filters, scored.length),
      properties:  scored,
      suggestions: buildSuggestions(filters),
      comparison:  null,
      estimate:    null,
    });

  } catch (err) {
    console.error("[AI chat error]", err.message);
    res.status(500).json({
      intent:      "error",
      message:     "Something went wrong. Please try again.",
      properties:  [],
      suggestions: [],
      comparison:  null,
      estimate:    null,
    });
  }
});

module.exports = router;
