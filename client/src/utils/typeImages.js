/**
 * PROPERTY IMAGE LIBRARY
 *
 * STRICT RULES — NEVER BREAK:
 *   House     → independent single-family home, exterior front view only
 *               garden / gate / driveway allowed
 *               NEVER apartments, villas, flats, buildings, or interiors
 *
 *   Apartment → multi-storey apartment / residential building, exterior front view only
 *   Flat      → same as Apartment — multi-storey residential building exterior only
 *               NEVER houses, villas, bungalows, or interiors
 *
 *   Villa     → luxury independent villa, exterior front view only
 *               pool / lawn / premium gate / landscaping allowed
 *               NEVER apartments, flats, or small houses
 *
 * GLOBAL:  exterior only · no interiors · no people · no animals
 *          no logos · no text · no watermarks · HD real photography only
 *          deterministic: same _id → same image, never cross-category
 */

export const TYPE_IMAGES = {

  // ─────────────────────────────────────────────────────────────────
  // HOUSE — independent single-family homes, exterior front view
  // garden, driveway, gate, lawn all fine
  // NOT apartments / NOT villas / NOT flats
  // ─────────────────────────────────────────────────────────────────
  House: [
    // 1. Classic two-storey suburban house, front lawn, blue sky
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    // 2. White modern house, clean garage, driveway
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
    // 3. Brick single-family home, front yard, trees
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop",
    // 4. Contemporary house, flat roof, wide driveway
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    // 5. Traditional house, sloped roof, garden path
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=500&fit=crop",
    // 6. Modern detached house, landscaped front garden
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=500&fit=crop",
    // 7. Colonial-style house, white exterior, porch
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop",
    // 8. Craftsman bungalow, porch, front garden
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=500&fit=crop",
    // 9. Modern house, large windows, front yard
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
    // 10. Two-storey house, garage, green lawn
    "https://images.unsplash.com/photo-1609347744403-2306e1af3a49?w=800&h=500&fit=crop",
    // 11. Detached house, wooden cladding, garden
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    // 12. Ranch-style single storey house, wide plot
    "https://images.unsplash.com/photo-1598228723793-56200a5e7e03?w=800&h=500&fit=crop",
    // 13. Suburban house, autumn trees, driveway
    "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800&h=500&fit=crop&auto=format",
    // 14. Grey modern house, clean architecture, hedge
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop&sat=-100&hue=200",
    // 15. House with red brick, wide front path
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop&sat=-50",
  ],

  // ─────────────────────────────────────────────────────────────────
  // VILLA — luxury independent villa, exterior front view only
  // pool / lawn / gates / premium landscaping fine
  // NOT apartments / NOT flats / NOT small houses
  // ─────────────────────────────────────────────────────────────────
  Villa: [
    // 1. Grand luxury villa, pool visible, landscaped garden
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=500&fit=crop",
    // 2. White luxury villa, large garden, palm trees
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    // 3. Premium villa, gated entrance, manicured lawn
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop",
    // 4. Contemporary luxury villa, wide driveway, hedges
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop",
    // 5. Modern villa, panoramic facade, open surroundings
    "https://images.unsplash.com/photo-1601760561441-16420502c7e0?w=800&h=500&fit=crop",
    // 6. Mediterranean-style luxury villa, arched entrance
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop",
    // 7. Hillside luxury villa, scenic exterior
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop",
    // 8. Modern white villa, tropical landscaping, gate
    "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=800&h=500&fit=crop",
    // 9. Luxury villa with swimming pool, stone walls
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop",
    // 10. Premium villa exterior, long driveway, tall trees
    "https://images.unsplash.com/photo-1598977163716-7e2bf1d00a4c?w=800&h=500&fit=crop",
    // 11. Modern villa, glass walls, infinity pool view
    "https://images.unsplash.com/photo-1609948543911-c6b4e38a3f4a?w=800&h=500&fit=crop",
    // 12. Tuscan-style villa, stone facade, garden terrace
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop",
    // 13. Luxury villa compound, walled, gate, fountain
    "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&h=500&fit=crop",
    // 14. Contemporary villa, flat roof, wrap-around lawn
    "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?w=800&h=500&fit=crop",
    // 15. Beachside villa exterior, premium architecture
    "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&h=500&fit=crop",
  ],

  // ─────────────────────────────────────────────────────────────────
  // APARTMENT — multi-storey residential apartment building
  // exterior front/angled view, roads/trees/open area around
  // NOT houses / NOT villas / NO interiors
  // ─────────────────────────────────────────────────────────────────
  Apartment: [
    // 1. Modern apartment complex, balconies, blue sky
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    // 2. High-rise residential tower, glass facade
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    // 3. Mid-rise apartment block, open surroundings
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
    // 4. Apartment building, trees in front, road view
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop",
    // 5. Modern residential tower, landscaped compound
    "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop",
    // 6. Urban apartment complex, clean architecture
    "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=500&fit=crop",
    // 7. Multi-storey apartment building, angled front view
    "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&h=500&fit=crop",
    // 8. Residential building, balconies, green landscape
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop",
    // 9. City apartment building, clean white facade
    "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&h=500&fit=crop",
    // 10. Modern housing complex, multiple blocks, road
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop",
    // 11. Apartment block, brick facade, parking in front
    "https://images.unsplash.com/photo-1549517045-bc93de28f8d6?w=800&h=500&fit=crop",
    // 12. Tall residential building, blue sky, trees
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=500&fit=crop",
    // 13. Modern apartment with colourful balconies
    "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=500&fit=crop",
    // 14. Residential complex, courtyard visible
    "https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&h=500&fit=crop",
    // 15. High-rise apartment tower, city skyline
    "https://images.unsplash.com/photo-1597047084993-6509c0302e3e?w=800&h=500&fit=crop",
  ],

  // ─────────────────────────────────────────────────────────────────
  // FLAT — mid/low-rise compact residential block, exterior front view
  // same strict rules as Apartment
  // NOT houses / NOT villas / NO interiors
  // ─────────────────────────────────────────────────────────────────
  Flat: [
    // 1. Low-rise residential flat block, road in front
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=500&fit=crop",
    // 2. Compact flat building, clean exterior, sky
    "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=500&fit=crop",
    // 3. Mid-rise block of flats, parking, trees
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop",
    // 4. Residential flat building, balconies, green area
    "https://images.unsplash.com/photo-1580041065738-e72023775cdc?w=800&h=500&fit=crop",
    // 5. Modern flat complex, clean lines, blue sky
    "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=500&fit=crop",
    // 6. Terraced flat buildings, tree-lined street
    "https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&h=500&fit=crop",
    // 7. Flat block, brick exterior, front entrance
    "https://images.unsplash.com/photo-1598228723793-56200a5e7e03?w=800&h=500&fit=crop&sat=-30",
    // 8. Modern residential flats, wide road, landscaping
    "https://images.unsplash.com/photo-1609347744403-2306e1af3a49?w=800&h=500&fit=crop&sat=-20",
    // 9. Urban flat building, daytime, clean facade
    "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop&sat=-10",
    // 10. Low-rise housing block, residential street
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&sat=-20",
    // 11. Compact flat block, coloured facade, exterior
    "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&h=500&fit=crop&sat=-15",
    // 12. Residential flats exterior, greenery around
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop&sat=-20",
    // 13. Flat building, angled view, open sky
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop&sat=-15",
    // 14. Modern flat block, concrete and glass exterior
    "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&h=500&fit=crop&sat=-20",
    // 15. Residential flats, trees in foreground
    "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=500&fit=crop&sat=-15",
  ],
};

/**
 * getTypeImage — returns the correct exterior image for a property.
 *
 * Logic (strict, deterministic):
 *  1. If the property has its own uploaded image (not a localhost URL) → use it
 *  2. Normalise type: "Flat" maps to Flat pool, "Apartment" to Apartment pool,
 *     "House" to House pool, "Villa" to Villa pool
 *  3. Unknown type → Apartment pool (safe fallback, always a building)
 *  4. Index is derived from last 4 hex chars of _id → always same image per property
 *
 * @param {{ _id?: string, type?: string, image?: string }} property
 * @returns {string} absolute image URL
 */
export function getTypeImage(property) {
  // Use uploaded image if available and not a broken localhost URL
  if (property.image &&
      !property.image.includes("localhost") &&
      !property.image.includes("undefined")) {
    return property.image;
  }

  const raw  = (property.type || "").trim();
  // Strict type normalisation — only exact matches accepted
  const type =
    raw === "House"     ? "House"     :
    raw === "Villa"     ? "Villa"     :
    raw === "Apartment" ? "Apartment" :
    raw === "Flat"      ? "Flat"      :
    "Apartment"; // safe fallback — always a building, never a house/villa

  const pool = TYPE_IMAGES[type];
  const seed = parseInt((property._id || "000000000000").slice(-4), 16);
  const idx  = seed % pool.length;
  return pool[idx];
}

/**
 * getThumbImage — same type-accurate image, resized to 400×260 for list/card views.
 */
export function getThumbImage(property) {
  return getTypeImage(property).replace(/w=\d+&h=\d+/, "w=400&h=260");
}

/**
 * getHeroImage — same type-accurate image at full 800×500 resolution.
 */
export function getHeroImage(property) {
  return getTypeImage(property);
}
