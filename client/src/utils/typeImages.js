// =============================================================================
// PROPERTY IMAGE LIBRARY — COMPLETE REWRITE
// THREE COMPLETELY SEPARATE LIBRARIES — NEVER MIXED
//
// HOUSE_IMAGES    → ONLY independent single-family houses
// APARTMENT_IMAGES → ONLY apartment / flat buildings (multi-storey)
// VILLA_IMAGES    → ONLY luxury villas
//
// Rules:
//   - Exterior front view only
//   - No interiors, no people, no animals, no logos, no text
//   - Assignment: type === "House"     → HOUSE_IMAGES
//                 type === "Apartment" → APARTMENT_IMAGES
//                 type === "Flat"      → APARTMENT_IMAGES
//                 type === "Villa"     → VILLA_IMAGES
//                 unknown             → APARTMENT_IMAGES (safe building fallback)
// =============================================================================

// -----------------------------------------------------------------------------
// HOUSE_IMAGES
// ONLY: independent single-family homes, exterior front view
// garden / driveway / gate / lawn allowed
// NEVER: apartment buildings, villas, flats, interiors
// -----------------------------------------------------------------------------
const HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1609347744403-2306e1af3a49?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1598228723793-56200a5e7e03?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
];

// -----------------------------------------------------------------------------
// APARTMENT_IMAGES
// ONLY: multi-storey residential apartment buildings or flat blocks
// exterior front / angled view, roads / trees / open area around it
// NEVER: independent houses, villas, bungalows, interiors
// Used for: Apartment AND Flat
// -----------------------------------------------------------------------------
const APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1549517045-bc93de28f8d6?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1597047084993-6509c0302e3e?w=800&h=500&fit=crop",
];

// -----------------------------------------------------------------------------
// VILLA_IMAGES
// ONLY: luxury independent villas, exterior front view
// pool / large lawn / premium gate / landscaping allowed
// NEVER: apartment buildings, flats, small houses, interiors
// -----------------------------------------------------------------------------
const VILLA_IMAGES = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1601760561441-16420502c7e0?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1598977163716-7e2bf1d00a4c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop&sat=20&bri=5",
];

// =============================================================================
// IMAGE SELECTION LOGIC
// type === "House"              → HOUSE_IMAGES     (independent houses only)
// type === "Apartment"          → APARTMENT_IMAGES (apartment buildings only)
// type === "Flat"               → APARTMENT_IMAGES (apartment buildings only)
// type === "Villa"              → VILLA_IMAGES     (luxury villas only)
// anything else / unknown       → APARTMENT_IMAGES (safe building fallback)
// =============================================================================
function _selectPool(type) {
  if (type === "House")                           return HOUSE_IMAGES;
  if (type === "Villa")                           return VILLA_IMAGES;
  if (type === "Apartment" || type === "Flat")    return APARTMENT_IMAGES;
  return APARTMENT_IMAGES; // fallback — always a building, never a house or villa
}

function _deterministicIndex(id, poolLength) {
  // Use last 4 hex chars of MongoDB _id for a stable, spread index
  const hex = (id || "000f").slice(-4);
  return parseInt(hex, 16) % poolLength;
}

// =============================================================================
// PUBLIC API — these are the ONLY functions used by the entire frontend
// =============================================================================

/**
 * getTypeImage
 * Returns the correct image URL for a property based solely on its type.
 * If the property has its own uploaded photo, that is returned as-is.
 *
 * @param {{ _id?: string, type?: string, image?: string }} property
 * @returns {string} image URL
 */
export function getTypeImage(property) {
  // Use the property's own uploaded image if it exists and is not broken
  if (
    property.image &&
    property.image.trim() !== "" &&
    !property.image.includes("localhost") &&
    !property.image.includes("undefined") &&
    !property.image.includes("null")
  ) {
    return property.image;
  }

  const pool  = _selectPool((property.type || "").trim());
  const idx   = _deterministicIndex(property._id, pool.length);
  return pool[idx];
}

/**
 * getThumbImage
 * Same type-accurate image at a smaller size for card/list views.
 */
export function getThumbImage(property) {
  return getTypeImage(property).replace(/w=\d+&h=\d+/, "w=400&h=260");
}

/**
 * getHeroImage
 * Same type-accurate image at full 800×500 for detail/hero views.
 */
export function getHeroImage(property) {
  return getTypeImage(property);
}

// Legacy export kept so any code using TYPE_IMAGES directly doesn't break.
// Maps to the three separate arrays above — no cross-category data.
export const TYPE_IMAGES = {
  House:     HOUSE_IMAGES,
  Villa:     VILLA_IMAGES,
  Apartment: APARTMENT_IMAGES,
  Flat:      APARTMENT_IMAGES, // Flat always uses the apartment pool
};
