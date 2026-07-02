const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

const TYPE_IMAGES = {
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&h=400&fit=crop",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
  ],
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop",
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&h=400&fit=crop",
  ],
};

// Known bad image keywords
const BAD_KEYWORDS = ["1448375240586", "1563089674820", "moss", "forest", "nature", "tree"];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const all = await Property.find({}).lean();
  let fixed = 0;

  for (const p of all) {
    const isBad = !p.image || BAD_KEYWORDS.some(k => (p.image || "").includes(k));
    if (isBad) {
      const imgs = TYPE_IMAGES[p.type] || TYPE_IMAGES.House;
      const idx = parseInt(p._id.toString().slice(-4), 16) % imgs.length;
      await Property.findByIdAndUpdate(p._id, { image: imgs[idx] });
      fixed++;
    }
  }

  console.log(`Fixed ${fixed} properties with bad/forest images`);
  mongoose.disconnect();
});
