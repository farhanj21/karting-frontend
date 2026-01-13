require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: String,
  slug: String,
  location: String,
  description: String,
  logo: String,
  stats: Object,
}, { timestamps: true });

const Track = mongoose.models.Track || mongoose.model('Track', trackSchema);

async function updateLogos() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const logoMapping = {
      'sportzilla-formula-karting': '/tracks/sportzilla-formula-karting.png',
      'apex-autodrome': '/tracks/apex-autodrome.png',
    };

    for (const [slug, logo] of Object.entries(logoMapping)) {
      const result = await Track.updateOne(
        { slug },
        { $set: { logo } }
      );
      console.log(`Updated ${slug}:`, result.modifiedCount > 0 ? 'Success' : 'Not found or already set');
    }

    console.log('\nLogo update complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating logos:', error);
    process.exit(1);
  }
}

updateLogos();
