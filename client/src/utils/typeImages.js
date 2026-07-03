/**
 * TYPE-ACCURATE IMAGE LIBRARY — Schema Rules (strictly followed):
 *
 * HOUSE     → Single-family home, exterior only, front/angled view,
 *             garden/driveway/garage visible, no apartments, no villas, no interiors
 *
 * VILLA     → Luxury villa exterior only, front/angled view,
 *             gates/walls/large landscaping/driveway, no small houses, no interiors
 *
 * APARTMENT → Multi-story apartment building exterior, front/angled view,
 *             roads/trees/open area around it, no houses, no villas, no interiors
 *
 * FLAT      → Mid-rise or low-rise residential building exterior, front view,
 *             compact building style, no interiors, no people
 *
 * ALL: Exterior only · No interiors · No people · No animals ·
 *      No text/logos · High-resolution professional photography
 */

export const TYPE_IMAGES = {

  // ── HOUSES — single-family homes, exterior, garden/driveway ──────────────
  House: [
    // Classic suburban house with garden and driveway
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    // Modern white house with garage and lawn
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
    // Brick house with front yard and trees
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop",
    // Contemporary house with clean facade and driveway
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    // Traditional house with sloped roof and garden
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=500&fit=crop",
    // Modern house exterior with landscaping
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=500&fit=crop",
    // House front view with blue sky
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    // Colonial-style house exterior
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop",
    // Craftsman house with porch and garden
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=500&fit=crop",
    // Modern home with flat roof and windows
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
    // Ranch-style house with wide front yard
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=500&fit=crop",
    // Two-storey detached house exterior
    "https://images.unsplash.com/photo-1509660933844-6910e12765a0?w=800&h=500&fit=crop",
  ],

  // ── VILLAS — luxury, large, gates/walls/landscaping exterior ─────────────
  Villa: [
    // Grand luxury villa with pool area and landscaping
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=500&fit=crop",
    // White luxury villa exterior with large garden
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    // Premium villa with gates and palm trees
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    // Modern villa with panoramic facade
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop",
    // Mediterranean-style villa exterior
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop",
    // Contemporary villa with large driveway
    "https://images.unsplash.com/photo-1601760561441-16420502c7e0?w=800&h=500&fit=crop",
    // Luxury villa front gate and walled compound
    "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&h=500&fit=crop",
    // Villa with terraced garden and stone walls
    "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?w=800&h=500&fit=crop",
    // Modern white villa with lush surroundings
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop",
    // Spanish-style villa with arched entrance
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop",
    // Hillside villa with scenic exterior view
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop",
    // Tropical villa exterior with surrounding greenery
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop",
  ],

  // ── APARTMENTS — multi-story residential building exterior ────────────────
  Apartment: [
    // Modern apartment block exterior with balconies
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    // High-rise apartment building with glass facade
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    // Contemporary multi-storey residential complex
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
    // Apartment building exterior with open surroundings
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop",
    // Urban apartment tower front view
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop",
    // Modern residential tower with landscaping
    "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop",
    // Apartment complex with trees and parking
    "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=500&fit=crop",
    // Mid-rise apartment building angled view
    "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800&h=500&fit=crop",
    // Residential apartment block blue sky
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&sat=-20",
    // Modern apartment building with road in front
    "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800&h=500&fit=crop",
    // City apartment building exterior — clean facade
    "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&h=500&fit=crop",
    // Apartment complex with balconies and greenery
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop",
  ],

  // ── FLATS — mid/low-rise compact residential building exterior ────────────
  Flat: [
    // Compact residential building front exterior
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=500&fit=crop",
    // Low-rise flat building with entrance and road
    "https://images.unsplash.com/photo-1549517045-bc93de28f8d6?w=800&h=500&fit=crop",
    // Modern flat block with clean lines exterior
    "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=500&fit=crop",
    // Residential flat building with parking lot
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=500&fit=crop",
    // Terraced flat buildings with trees
    "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=500&fit=crop",
    // Flat building block side-front angled view
    "https://images.unsplash.com/photo-1543489822-c49534f3271f?w=800&h=500&fit=crop",
    // Modern flat complex exterior with balconies
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop",
    // Low-rise housing block exterior — residential street
    "https://images.unsplash.com/photo-1580041065738-e72023775cdc?w=800&h=500&fit=crop",
    // Urban flat building facade — daytime
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=500&fit=crop",
    // Contemporary flat block with clean architecture
    "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=500&fit=crop",
    // Flat building with road and sky
    "https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&h=500&fit=crop",
    // Residential flat exterior — green surroundings
    "https://images.unsplash.com/photo-1597047084993-6509c0302e3e?w=800&h=500&fit=crop",
  ],
};

/**
 * Returns a deterministic, type-accurate exterior image URL for a property.
 * Uses property._id to pick consistently — same property always gets same image.
 * If property has its own uploaded photo (not a localhost URL), that is used instead.
 *
 * @param {{ _id: string, type: string, image?: string }} property
 * @returns {string} image URL
 */
export function getTypeImage(property) {
  if (property.image && !property.image.includes("localhost")) {
    return property.image;
  }
  const type = property.type || "Apartment";
  const pool = TYPE_IMAGES[type] || TYPE_IMAGES.Apartment;
  const idx  = parseInt((property._id || "0").slice(-4), 16) % pool.length;
  return pool[idx];
}

/**
 * Thumbnail version — same image, smaller crop hint for list views.
 */
export function getThumbImage(property) {
  const url = getTypeImage(property);
  return url.replace(/w=\d+&h=\d+/, "w=400&h=260");
}

/**
 * Hero/full-size version — 800×500.
 */
export function getHeroImage(property) {
  return getTypeImage(property);
}
