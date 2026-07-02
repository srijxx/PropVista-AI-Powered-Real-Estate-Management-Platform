const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propvista");

// Coimbatore areas with real coordinates
const coimbatoreAreas = [
  { area: "RS Puram", lat: 11.0050, lng: 76.9600 },
  { area: "Gandhipuram", lat: 11.0168, lng: 76.9558 },
  { area: "Peelamedu", lat: 11.0270, lng: 77.0270 },
  { area: "Saibaba Colony", lat: 11.0200, lng: 76.9450 },
  { area: "Singanallur", lat: 10.9900, lng: 77.0200 },
  { area: "Vadavalli", lat: 11.0350, lng: 76.9100 },
  { area: "Hopes College", lat: 11.0100, lng: 76.9700 },
  { area: "Race Course", lat: 11.0080, lng: 76.9680 },
  { area: "Tidel Park", lat: 11.0300, lng: 77.0100 },
  { area: "Kovaipudur", lat: 10.9800, lng: 76.9300 },
  { area: "Thudiyalur", lat: 11.0600, lng: 76.9400 },
  { area: "Kuniyamuthur", lat: 10.9700, lng: 76.9500 },
];

// Erode areas with real coordinates
const erodeAreas = [
  { area: "Erode Town", lat: 11.3410, lng: 77.7172 },
  { area: "Perundurai", lat: 11.2750, lng: 77.5850 },
  { area: "Bhavani", lat: 11.4450, lng: 77.6830 },
  { area: "Gobichettipalayam", lat: 11.4540, lng: 77.3580 },
  { area: "Sathyamangalam", lat: 11.5040, lng: 77.2380 },
  { area: "Chithode", lat: 11.3200, lng: 77.6900 },
  { area: "Kavindapadi", lat: 11.3800, lng: 77.6500 },
  { area: "Veerappanchatram", lat: 11.3600, lng: 77.7400 },
];

const types = ["Apartment", "Flat", "House", "Villa"];
const statuses = ["For Sale", "For Rent"];

// Each type has clearly different, real images of that exact property type
const propertyImages = {
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",  // modern apartment building exterior
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",  // apartment interior living room
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop", // apartment interior bedroom
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop", // apartment kitchen modern
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop", // high-rise apartment
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop", // apartment balcony view
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",  // flat interior open plan
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",  // flat kitchen
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop",     // flat living room
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop",  // flat bedroom
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&h=400&fit=crop",  // flat modern interior
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=600&h=400&fit=crop",  // flat dining area
  ],
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",  // suburban house exterior
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",  // family house with garden
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",     // two-storey house
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop",  // modern house front
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",  // house with driveway
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&h=400&fit=crop",  // brick house exterior
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=400&fit=crop",  // luxury villa with pool
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",  // villa exterior modern
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",  // villa with terrace
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",  // villa night view
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",  // white modern villa
    "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=600&h=400&fit=crop",  // mediterranean villa
  ],
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(5));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ownerNames  = ["Rajesh Kumar", "Priya Devi", "Suresh Babu", "Meena Sundaram", "Arun Prakash", "Kavitha Rajan", "Murugan S", "Lakshmi Narayanan"];
const ownerPhones = ["9876543210", "9123456789", "9988776655", "9345678901", "9012345678", "9765432109", "9654321098", "9543210987"];

const properties = [];

for (let i = 1; i <= 100; i++) {
  const city    = i <= 60 ? "Coimbatore" : "Erode";   // 60 in CBE, 40 in Erode
  const areaObj = city === "Coimbatore" ? pick(coimbatoreAreas) : pick(erodeAreas);
  const type    = pick(types);
  const bhk     = rand(1, 5);
  const status  = pick(statuses);
  const ownerIdx = rand(0, ownerNames.length - 1);

  properties.push({
    title:      `${bhk} BHK ${type} in ${areaObj.area}`,
    type,
    location:   `${areaObj.area}, ${city}`,
    price:      rand(1000000, 10000000),   // ₹10L – ₹1Cr
    bedrooms:   bhk,
    bathrooms:  rand(1, 3),
    area:       rand(600, 3500),
    status,
    lat:        randFloat(areaObj.lat - 0.02, areaObj.lat + 0.02),
    lng:        randFloat(areaObj.lng - 0.02, areaObj.lng + 0.02),
    ownerName:  ownerNames[ownerIdx],
    ownerPhone: ownerPhones[ownerIdx],
    ownerEmail: `owner${ownerIdx + 1}@propvista.com`,
    published:  true,
    featured:   Math.random() > 0.85,
    image:      pick(propertyImages[type]),
  });
}

async function seed() {
  try {
    await Property.insertMany(properties);
    console.log(`✅ 100 properties inserted (60 Coimbatore + 40 Erode)`);
    console.log(`   Price range: ₹10,00,000 – ₹1,00,00,000`);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

seed();
