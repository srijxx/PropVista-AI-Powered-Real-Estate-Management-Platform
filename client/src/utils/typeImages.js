// =============================================================================
// PROPERTY IMAGE MAPPING — SINGLE SOURCE OF TRUTH
// =============================================================================
// Rules (1000000% strict — as per spec):
//   1. If user uploaded an image  → always show it (highest priority)
//   2. No uploaded image          → show the ONE fixed image for that type
//   3. Never show a random or wrong-type image
//
// Type → Image mapping:
//   House     → HOUSE_IMAGE      only
//   Apartment → APARTMENT_IMAGE  only
//   Flat      → FLAT_IMAGE       only
//   Villa     → VILLA_IMAGE      only
//   (unknown) → HOUSE_IMAGE      (safe fallback)
// =============================================================================

const HOUSE_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop";

const APARTMENT_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80&auto=format&fit=crop";

const FLAT_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop";

const VILLA_IMAGE =
  "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=1200&q=80&auto=format&fit=crop";

// -----------------------------------------------------------------------------
// getTypeImage — THE ONLY function that should be called to get a property image
// -----------------------------------------------------------------------------
export function getTypeImage(property) {
  if (!property) return HOUSE_IMAGE;

  // Priority 1: user-uploaded image (valid external URL, not localhost)
  if (
    property.image &&
    typeof property.image === "string" &&
    property.image.trim() !== "" &&
    property.image.startsWith("http") &&
    !property.image.includes("localhost")
  ) {
    return property.image;
  }

  // Priority 2: type-accurate default — NO random images, NO wrong-type images
  switch ((property.type || "").toLowerCase()) {
    case "house":     return HOUSE_IMAGE;
    case "apartment": return APARTMENT_IMAGE;
    case "flat":      return FLAT_IMAGE;
    case "villa":     return VILLA_IMAGE;
    default:          return HOUSE_IMAGE; // safe fallback — never random
  }
}

// Aliases — all route through getTypeImage so behaviour is always consistent
export const getThumbImage = getTypeImage;
export const getHeroImage  = getTypeImage;

// Legacy shape — kept so any code importing TYPE_IMAGES doesn't break at build
export const TYPE_IMAGES = {
  House:     [HOUSE_IMAGE],
  Apartment: [APARTMENT_IMAGE],
  Flat:      [FLAT_IMAGE],
  Villa:     [VILLA_IMAGE],
};
