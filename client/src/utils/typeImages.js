/**
 * Shared type-accurate image utility.
 * EVERY page must use getTypeImage(property) — no random fallbacks.
 * House → only house images. Villa → only villa. Apartment → only apartment. Flat → only flat.
 */

export const TYPE_IMAGES = {
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1601760561441-16420502c7e0?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop",
  ],
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=500&fit=crop",
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=500&fit=crop",
  ],
};

/**
 * Returns a deterministic, type-accurate image URL for a property.
 * Uses the property's _id to pick consistently (same property always gets same image).
 * @param {{ _id: string, type: string, image?: string }} property
 * @param {string} [size="800&h=500"] - optional size override for w=X&h=Y
 */
export function getTypeImage(property, size) {
  // If it has its own uploaded image, use it
  if (property.image && !property.image.includes("localhost")) {
    return property.image;
  }
  const type = property.type || "Apartment";
  const pool = TYPE_IMAGES[type] || TYPE_IMAGES.Apartment;
  const idx  = parseInt((property._id || "0").slice(-4), 16) % pool.length;
  let url = pool[idx];
  if (size) {
    url = url.replace(/w=\d+&h=\d+/, `w=${size}`);
  }
  return url;
}

/** Thumbnail-sized image (140x100) */
export function getThumbImage(property) {
  if (property.image && !property.image.includes("localhost")) return property.image;
  const type = property.type || "Apartment";
  const pool = TYPE_IMAGES[type] || TYPE_IMAGES.Apartment;
  const idx  = parseInt((property._id || "0").slice(-4), 16) % pool.length;
  return pool[idx].replace(/w=\d+&h=\d+/, "w=300&h=200");
}

/** Hero/banner-sized image (800x500) */
export function getHeroImage(property) {
  return getTypeImage(property);
}
