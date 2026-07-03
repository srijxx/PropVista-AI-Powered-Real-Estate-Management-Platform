// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY IMAGE MAPPING — REBUILT FROM SCRATCH
// Four fixed constants. One function. No arrays. No rotation. No hashing.
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop";

const APARTMENT_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80&auto=format&fit=crop";

const FLAT_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop";

const VILLA_IMAGE =
  "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=1200&q=80&auto=format&fit=crop";

// ─────────────────────────────────────────────────────────────────────────────
// getTypeImage
// Priority:
//   1. If the property has its own uploaded image → use it (user's photo wins)
//   2. Otherwise → use the fixed type-accurate constant
//
// House      → HOUSE_IMAGE      only
// Apartment  → APARTMENT_IMAGE  only
// Flat       → FLAT_IMAGE       only
// Villa      → VILLA_IMAGE      only
// ─────────────────────────────────────────────────────────────────────────────
export function getTypeImage(property) {
  // Use user-uploaded image if it exists and is a valid external URL
  if (
    property.image &&
    typeof property.image === "string" &&
    property.image.startsWith("http") &&
    !property.image.includes("localhost")
  ) {
    return property.image;
  }

  // Fall back to fixed type-accurate image
  if (property.type === "House")     return HOUSE_IMAGE;
  if (property.type === "Apartment") return APARTMENT_IMAGE;
  if (property.type === "Flat")      return FLAT_IMAGE;
  if (property.type === "Villa")     return VILLA_IMAGE;
  return HOUSE_IMAGE;
}

export function getThumbImage(property) {
  return getTypeImage(property);
}

export function getHeroImage(property) {
  return getTypeImage(property);
}

// Legacy shape kept so any code importing TYPE_IMAGES doesn't break
export const TYPE_IMAGES = {
  House:     [HOUSE_IMAGE],
  Apartment: [APARTMENT_IMAGE],
  Flat:      [FLAT_IMAGE],
  Villa:     [VILLA_IMAGE],
};
