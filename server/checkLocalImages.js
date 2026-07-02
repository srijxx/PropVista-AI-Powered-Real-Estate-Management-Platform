const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

const TYPE_IMAGES = {
  House: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
  Villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=400&fit=crop",
  Apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
  Flat: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const all = await Property.find({}).lean();
  let fixed = 0;

  for (const p of all) {
    // Fix if image is: local upload, forest/nature photo, or doesn't start with https://images.unsplash
    const img = p.image || "";
    const isBad = !img ||
      img.includes("localhost") ||
      img.includes("/uploads/") ||
      img.includes("1448375240586") ||
      img.includes("1563089674820") ||
      !img.startsWith("https://images.unsplash");

    if (isBad) {
      const replacement = TYPE_IMAGES[p.type] || TYPE_IMAGES.House;
      await Property.findByIdAndUpdate(p._id, { image: replacement });
      console.log(`Fixed: ${p.title} | was: ${img.slice(0, 60)}`);
      fixed++;
    }
  }

  console.log(`\nTotal fixed: ${fixed}`);
  mongoose.disconnect();
});
