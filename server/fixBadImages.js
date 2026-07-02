const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

const propertyImages = {
  Apartment: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop",
  ],
  Flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=600&h=400&fit=crop",
  ],
  House: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&h=400&fit=crop",
  ],
  Villa: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=600&h=400&fit=crop",
  ],
};

// Good image URL patterns
const goodPatterns = ['unsplash.com'];

function isGoodImage(url) {
  if (!url) return false;
  return goodPatterns.some(p => url.includes(p));
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const properties = await Property.find({});
  let fixed = 0;

  // Show all properties with bad images
  console.log('\nChecking all property images...\n');
  for (const p of properties) {
    if (!isGoodImage(p.image)) {
      const imgs = propertyImages[p.type] || propertyImages.House;
      // pick a different index using full id hash
      const idx = (parseInt(p._id.toString().slice(-2), 16) + 3) % imgs.length;
      console.log(`Fixing: ${p.title} | old: ${p.image} | new: ${imgs[idx]}`);
      await Property.findByIdAndUpdate(p._id, { image: imgs[idx] });
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} properties with bad images`);
  mongoose.disconnect();
});
