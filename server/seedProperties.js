const mongoose = require("mongoose");
const Property = require("./models/Property");

mongoose.connect("mongodb://127.0.0.1:27017/propvista");

const cities = [
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", lat: 9.9252, lng: 78.1198 },
  { name: "Trichy", lat: 10.7905, lng: 78.7047 },
  { name: "Salem", lat: 11.6643, lng: 78.1460 },
  { name: "Erode", lat: 11.3410, lng: 77.7172 },
  { name: "Tirunelveli", lat: 8.7139, lng: 77.7567 },
  { name: "Thoothukudi", lat: 8.7642, lng: 78.1348 },
  { name: "Vellore", lat: 12.9165, lng: 79.1325 },
  { name: "Tanjore", lat: 10.7867, lng: 79.1378 },
  { name: "Karur", lat: 10.9601, lng: 78.0766 },
  { name: "Namakkal", lat: 11.2194, lng: 78.1677 },
  { name: "Dindigul", lat: 10.3673, lng: 77.9803 },
  { name: "Cuddalore", lat: 11.7480, lng: 79.7714 },
  { name: "Kanchipuram", lat: 12.8342, lng: 79.7036 },
];

const types = ["Apartment", "Flat", "House", "Villa"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const demoProperties = [];

for (let i = 1; i <= 800; i++) {
  const city = cities[rand(0, cities.length - 1)];
  const type = types[rand(0, types.length - 1)];
  const bhk = rand(1, 4);

  demoProperties.push({
    title: `${bhk} BHK ${type}`,
    type,
    location: city.name,
    price: rand(1200000, 15000000),
    bedrooms: bhk,
    bathrooms: rand(1, 3),
    area: rand(600, 3200),
    status: Math.random() > 0.5 ? "For Sale" : "For Rent",
    lat: city.lat + (Math.random() - 0.5) * 0.08,
    lng: city.lng + (Math.random() - 0.5) * 0.08,
    published: true,
    featured: false,
  });
}

async function seed() {
  try {
    await Property.insertMany(demoProperties);
    console.log(`✅ ${demoProperties.length} Tamil Nadu demo properties inserted`);
    process.exit();
  } catch (err) {
    console.error("❌ Error inserting demo data", err);
    process.exit(1);
  }
}

seed();
