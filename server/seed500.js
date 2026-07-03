const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

// =============================================================================
// THREE COMPLETELY SEPARATE IMAGE LIBRARIES — NEVER MIXED
// HOUSE_IMAGES    → independent single-family houses only
// APARTMENT_IMAGES → apartment / flat buildings only (multi-storey)
// VILLA_IMAGES    → luxury villas only
// =============================================================================

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
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop&sat=20",
];

// Strict type → pool mapping. Flat uses APARTMENT_IMAGES (always a building).
function getImagePool(type) {
  if (type === "House")                         return HOUSE_IMAGES;
  if (type === "Villa")                         return VILLA_IMAGES;
  if (type === "Apartment" || type === "Flat")  return APARTMENT_IMAGES;
  return APARTMENT_IMAGES; // unknown → building fallback
}

// Keep IMAGES alias so the rest of seed500.js (getImage call) still works
const IMAGES = { House: HOUSE_IMAGES, Villa: VILLA_IMAGES, Apartment: APARTMENT_IMAGES, Flat: APARTMENT_IMAGES };

// ── Coimbatore areas with precise coordinates ─────────────────
const COIMBATORE = [
  { area: "RS Puram",         lat: 11.0050, lng: 76.9600 },
  { area: "Gandhipuram",      lat: 11.0168, lng: 76.9558 },
  { area: "Peelamedu",        lat: 11.0270, lng: 77.0270 },
  { area: "Saibaba Colony",   lat: 11.0200, lng: 76.9450 },
  { area: "Singanallur",      lat: 10.9900, lng: 77.0200 },
  { area: "Vadavalli",        lat: 11.0350, lng: 76.9100 },
  { area: "Hopes College",    lat: 11.0100, lng: 76.9700 },
  { area: "Race Course",      lat: 11.0080, lng: 76.9680 },
  { area: "Tidel Park",       lat: 11.0300, lng: 77.0100 },
  { area: "Kovaipudur",       lat: 10.9800, lng: 76.9300 },
  { area: "Thudiyalur",       lat: 11.0600, lng: 76.9400 },
  { area: "Kuniyamuthur",     lat: 10.9700, lng: 76.9500 },
  { area: "Ukkadam",          lat: 10.9995, lng: 76.9688 },
  { area: "Podanur",          lat: 10.9760, lng: 76.9780 },
  { area: "Sowripalayam",     lat: 11.0060, lng: 77.0080 },
  { area: "Ganapathy",        lat: 11.0420, lng: 76.9740 },
  { area: "Pappanaickenpalayam", lat: 11.0490, lng: 76.9580 },
  { area: "Sulur",            lat: 11.0188, lng: 77.1244 },
  { area: "Ondipudur",        lat: 11.0010, lng: 77.0460 },
  { area: "Kalapatti",        lat: 11.0530, lng: 77.0440 },
];

// ── Tamil Nadu cities ─────────────────────────────────────────
const TN_CITIES = [
  // Chennai (50 properties)
  { area: "Anna Nagar",        city: "Chennai",       lat: 13.0850, lng: 80.2101 },
  { area: "Adyar",             city: "Chennai",       lat: 13.0012, lng: 80.2565 },
  { area: "Velachery",         city: "Chennai",       lat: 12.9815, lng: 80.2180 },
  { area: "Porur",             city: "Chennai",       lat: 13.0358, lng: 80.1573 },
  { area: "OMR",               city: "Chennai",       lat: 12.9010, lng: 80.2279 },
  { area: "T Nagar",           city: "Chennai",       lat: 13.0418, lng: 80.2341 },
  { area: "Tambaram",          city: "Chennai",       lat: 12.9249, lng: 80.1000 },
  { area: "Perambur",          city: "Chennai",       lat: 13.1067, lng: 80.2357 },
  { area: "Sholinganallur",    city: "Chennai",       lat: 12.9299, lng: 80.2279 },
  { area: "Medavakkam",        city: "Chennai",       lat: 12.9254, lng: 80.1954 },
  // Madurai (30 properties)
  { area: "Anna Nagar",        city: "Madurai",       lat: 9.9252,  lng: 78.1198 },
  { area: "KK Nagar",          city: "Madurai",       lat: 9.9038,  lng: 78.0919 },
  { area: "Tallakulam",        city: "Madurai",       lat: 9.9316,  lng: 78.1397 },
  { area: "Palanganatham",     city: "Madurai",       lat: 9.8923,  lng: 78.1264 },
  { area: "Thirunagar",        city: "Madurai",       lat: 9.9168,  lng: 78.1000 },
  { area: "Mattuthavani",      city: "Madurai",       lat: 9.9388,  lng: 78.1339 },
  // Salem (25 properties)
  { area: "Salem Town",        city: "Salem",         lat: 11.6643, lng: 78.1460 },
  { area: "Fairlands",         city: "Salem",         lat: 11.6939, lng: 78.1337 },
  { area: "Suramangalam",      city: "Salem",         lat: 11.6500, lng: 78.0800 },
  { area: "Hasthampatti",      city: "Salem",         lat: 11.6510, lng: 78.1730 },
  { area: "Shevapet",          city: "Salem",         lat: 11.6662, lng: 78.1589 },
  // Trichy (25 properties)
  { area: "Trichy Town",       city: "Trichy",        lat: 10.7905, lng: 78.7047 },
  { area: "Srirangam",         city: "Trichy",        lat: 10.8633, lng: 78.6939 },
  { area: "Ariyamangalam",     city: "Trichy",        lat: 10.7714, lng: 78.7445 },
  { area: "Thillai Nagar",     city: "Trichy",        lat: 10.8001, lng: 78.7139 },
  { area: "K K Nagar",         city: "Trichy",        lat: 10.7673, lng: 78.7237 },
  // Erode (20 properties)
  { area: "Erode Town",        city: "Erode",         lat: 11.3410, lng: 77.7172 },
  { area: "Perundurai",        city: "Erode",         lat: 11.2750, lng: 77.5850 },
  { area: "Bhavani",           city: "Erode",         lat: 11.4450, lng: 77.6830 },
  { area: "Gobichettipalayam", city: "Erode",         lat: 11.4540, lng: 77.3580 },
  { area: "Sathyamangalam",    city: "Erode",         lat: 11.5040, lng: 77.2380 },
  // Tirupur (20 properties)
  { area: "Tirupur Town",      city: "Tirupur",       lat: 11.1085, lng: 77.3411 },
  { area: "Veerapandi",        city: "Tirupur",       lat: 11.0580, lng: 77.3200 },
  { area: "Avinashi",          city: "Tirupur",       lat: 11.1940, lng: 77.2640 },
  { area: "Palladam",          city: "Tirupur",       lat: 10.9853, lng: 77.2844 },
  // Tirunelveli (15 properties)
  { area: "Tirunelveli Town",  city: "Tirunelveli",   lat: 8.7139,  lng: 77.7567 },
  { area: "Palayamkottai",     city: "Tirunelveli",   lat: 8.7270,  lng: 77.7358 },
  { area: "Ambasamudram",      city: "Tirunelveli",   lat: 8.7042,  lng: 77.4595 },
  // Vellore (15 properties)
  { area: "Vellore Town",      city: "Vellore",       lat: 12.9165, lng: 79.1325 },
  { area: "Katpadi",           city: "Vellore",       lat: 12.9715, lng: 79.1507 },
  { area: "Sathuvachari",      city: "Vellore",       lat: 12.9560, lng: 79.1700 },
  // Thanjavur (15 properties)
  { area: "Thanjavur Town",    city: "Thanjavur",     lat: 10.7870, lng: 79.1378 },
  { area: "Kumbakonam",        city: "Thanjavur",     lat: 10.9602, lng: 79.3845 },
  { area: "Papanasam",         city: "Thanjavur",     lat: 10.9311, lng: 79.2724 },
  // Dindigul (10 properties)
  { area: "Dindigul Town",     city: "Dindigul",      lat: 10.3673, lng: 77.9803 },
  { area: "Palani",            city: "Dindigul",      lat: 10.4486, lng: 77.5247 },
  // Cuddalore (10 properties)
  { area: "Cuddalore Town",    city: "Cuddalore",     lat: 11.7480, lng: 79.7714 },
  { area: "Chidambaram",       city: "Cuddalore",     lat: 11.3993, lng: 79.6932 },
  // Kanchipuram (10 properties)
  { area: "Kanchipuram Town",  city: "Kanchipuram",   lat: 12.8342, lng: 79.7036 },
  { area: "Sriperumbudur",     city: "Kanchipuram",   lat: 12.9695, lng: 79.9450 },
  // Karur (10 properties)
  { area: "Karur Town",        city: "Karur",         lat: 10.9601, lng: 78.0766 },
  { area: "Kulithalai",        city: "Karur",         lat: 10.9376, lng: 78.4196 },
  // Namakkal (10 properties)
  { area: "Namakkal Town",     city: "Namakkal",      lat: 11.2194, lng: 78.1677 },
  { area: "Rasipuram",         city: "Namakkal",      lat: 11.4640, lng: 78.1726 },
  // Krishnagiri (10 properties)
  { area: "Krishnagiri Town",  city: "Krishnagiri",   lat: 12.5266, lng: 78.2139 },
  { area: "Hosur",             city: "Krishnagiri",   lat: 12.7409, lng: 77.8253 },
  // Villupuram (10 properties)
  { area: "Villupuram Town",   city: "Villupuram",    lat: 11.9391, lng: 79.4931 },
  { area: "Tindivanam",        city: "Villupuram",    lat: 12.2345, lng: 79.6527 },
  // Tiruvannamalai (10 properties)
  { area: "Tiruvannamalai Town", city: "Tiruvannamalai", lat: 12.2253, lng: 79.0747 },
  { area: "Polur",             city: "Tiruvannamalai", lat: 12.5226, lng: 79.3822 },
];

const TYPES = ["Apartment", "Flat", "House", "Villa"];
const STATUSES = ["For Sale", "For Rent"];

const OWNERS = [
  { name: "Rajesh Kumar",      phone: "9876543210", email: "rajesh@propvista.com" },
  { name: "Priya Devi",        phone: "9123456789", email: "priya@propvista.com" },
  { name: "Suresh Babu",       phone: "9988776655", email: "suresh@propvista.com" },
  { name: "Meena Sundaram",    phone: "9345678901", email: "meena@propvista.com" },
  { name: "Arun Prakash",      phone: "9012345678", email: "arun@propvista.com" },
  { name: "Kavitha Rajan",     phone: "9765432109", email: "kavitha@propvista.com" },
  { name: "Murugan S",         phone: "9654321098", email: "murugan@propvista.com" },
  { name: "Lakshmi Narayanan", phone: "9543210987", email: "lakshmi@propvista.com" },
  { name: "Senthil Kumar",     phone: "9432109876", email: "senthil@propvista.com" },
  { name: "Deepa Krishnan",    phone: "9321098765", email: "deepa@propvista.com" },
  { name: "Vijay Anand",       phone: "9210987654", email: "vijay@propvista.com" },
  { name: "Saranya Mohan",     phone: "9109876543", email: "saranya@propvista.com" },
];

// Price ranges by type (realistic Indian market)
const PRICE_RANGES = {
  Flat:      { min: 800000,   max: 6000000  },
  Apartment: { min: 1200000,  max: 9000000  },
  House:     { min: 1500000,  max: 12000000 },
  Villa:     { min: 4000000,  max: 25000000 },
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randF(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(6)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// BHK ranges per type
function getBHK(type) {
  if (type === "Flat")      return rand(1, 3);
  if (type === "Apartment") return rand(1, 4);
  if (type === "House")     return rand(2, 5);
  if (type === "Villa")     return rand(3, 6);
  return rand(1, 4);
}

function makeProperty(areaObj, cityName, globalIndex) {
  const type = TYPES[globalIndex % 4]; // rotate types for variety
  const bhk  = getBHK(type);
  const status = globalIndex % 3 === 0 ? "For Rent" : "For Sale"; // 1/3 rental
  const owner = OWNERS[globalIndex % OWNERS.length];
  const pr = PRICE_RANGES[type];
  const price = rand(pr.min, pr.max);

  // Area size by type
  const areaSize =
    type === "Villa" ? rand(1800, 5000) :
    type === "House" ? rand(1200, 3500) :
    type === "Apartment" ? rand(700, 2200) :
    rand(450, 1500);

  // Strict: use ONLY the pool for this type — never cross-category
  const pool = getImagePool(type);
  const image = pool[globalIndex % pool.length];

  return {
    title: `${bhk} BHK ${type} in ${areaObj.area}`,
    type,
    location: `${areaObj.area}, ${cityName}`,
    price,
    bedrooms: bhk,
    bathrooms: bhk <= 2 ? rand(1, 2) : rand(2, bhk - 1),
    area: areaSize,
    status,
    lat: randF(areaObj.lat - 0.015, areaObj.lat + 0.015),
    lng: randF(areaObj.lng - 0.015, areaObj.lng + 0.015),
    ownerName: owner.name,
    ownerPhone: owner.phone,
    ownerEmail: owner.email,
    published: true,
    featured: globalIndex % 10 === 0,
    image,
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Property.deleteMany({});
  console.log("🗑  Cleared existing properties");

  const properties = [];

  // ── 100 Coimbatore properties ──
  for (let i = 0; i < 100; i++) {
    const areaObj = COIMBATORE[i % COIMBATORE.length];
    properties.push(makeProperty(areaObj, "Coimbatore", i));
  }

  // ── 400 Tamil Nadu properties ──
  for (let i = 0; i < 400; i++) {
    const loc = TN_CITIES[i % TN_CITIES.length];
    properties.push(makeProperty(loc, loc.city, i + 100));
  }

  await Property.insertMany(properties);

  // Summary
  const byCity = {};
  properties.forEach(p => {
    const city = p.location.split(", ")[1];
    byCity[city] = (byCity[city] || 0) + 1;
  });

  console.log(`\n✅ Seeded ${properties.length} properties:`);
  Object.entries(byCity).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
    console.log(`   ${city.padEnd(20)} → ${count} properties`);
  });

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. All done!");
}

seed().catch(err => {
  console.error("❌ Seed error:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
