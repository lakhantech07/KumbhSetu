const mongoose = require('mongoose');
const Shop = require('../models/Shop');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/KumbhSetuWeb';

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // 1. Requirement 6: Update old demo records too, not only insert new ones
    console.log('Step 1: Recalculating and enforcing max_price on all existing records...');
    const existingShops = await Shop.find({});
    let updatedCount = 0;
    for (const shop of existingShops) {
      const calculatedMax = Math.ceil(shop.price * 1.5);
      if (shop.max_price !== calculatedMax) {
        shop.max_price = calculatedMax;
        await shop.save();
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} existing shop records with exact price guardrail.`);

    // 2. Verified demo records to seed
    const verifiedDemoRecords = [
      {
        shopName: 'Kumbh Snacks Corner',
        ownerName: 'Rameshwar Sharma',
        item: 'Vada Pav',
        area: 'Sector 4',
        address: 'Main Gate, Kumbh Mela',
        price: 20, // Genuine price ₹20
        unit: 'per piece',
        status: 'Verified'
      },
      {
        shopName: 'City Delights',
        ownerName: 'Vikas Patel',
        item: 'Cheese Vada Pav',
        area: 'Sector 4',
        address: 'Food Court Stall #12',
        price: 40, // Genuine price ₹40 -> max ₹60
        unit: 'per piece',
        status: 'Verified'
      },
      {
        shopName: 'Kumbh Fast Food',
        ownerName: 'Anil Gupta',
        item: 'Vada Pav',
        area: 'Sector 1',
        address: 'Near Main Ghat, Exit 2',
        price: 25, // Genuine price ₹25 -> max ₹38
        unit: 'per piece',
        status: 'Verified'
      },
      {
        shopName: 'Sangam Halwai',
        ownerName: 'Om Prakash Tiwari',
        item: 'Samosa',
        area: 'Sector 1',
        address: 'Triveni Sangam Marg, Lane 3',
        price: 15,
        unit: 'per piece',
        status: 'Verified'
      },
      {
        shopName: 'Ganga Kinare Chai',
        ownerName: 'Raghav Das',
        item: 'Masala Chai',
        area: 'Sector 2',
        address: 'Ghat No. 3 Promenade',
        price: 10,
        unit: 'per cup',
        status: 'Verified'
      },
      {
        shopName: 'Mahaprasad Bhawan',
        ownerName: 'Santosh Kumar',
        type: 'Food',
        item: 'Poori Sabzi',
        area: 'Sector 3',
        address: 'Annakshetra Lane, Stall 5',
        price: 40,
        unit: 'per plate',
        status: 'Verified'
      },
      // Lodging services
      {
        shopName: 'Shri Ram Dharamshala',
        ownerName: 'Trust Board',
        type: 'Lodging',
        item: 'Dharamshala Bed',
        area: 'Ramkund',
        address: 'Ramkund Pilgrimage Trust Complex',
        price: 150,
        unit: 'per person per night',
        status: 'Verified'
      },
      {
        shopName: 'Ramkund Residency',
        ownerName: 'Ramesh Kothari',
        type: 'Lodging',
        item: 'AC Double Room',
        area: 'Panchavati',
        address: 'Near Ramkund Main Ghat',
        price: 1500,
        unit: 'per room per night',
        status: 'Verified'
      },
      // Transport services
      {
        shopName: 'Panchavati Auto Stand',
        ownerName: 'Dharma Pawar',
        type: 'Transport',
        item: 'Auto-rickshaw: Panchavati to Ramkund',
        area: 'Panchavati',
        address: 'Panchavati Karanja Auto Stand',
        price: 30,
        unit: 'per ride',
        status: 'Verified'
      },
      {
        shopName: 'Trimbak Tour Cabs',
        ownerName: 'Narayan Khairnar',
        type: 'Transport',
        item: 'Taxi: Panchavati to Trimbakeshwar',
        area: 'Panchavati',
        address: 'Malegaon Stand Cab Point',
        price: 1200,
        unit: 'per trip',
        status: 'Verified'
      }
    ];

    console.log('Step 2: Upserting verified records...');
    for (const item of verifiedDemoRecords) {
      item.max_price = Math.ceil(item.price * 1.5);
      await Shop.findOneAndUpdate(
        { shopName: item.shopName, item: item.item },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('Step 3: Verification check:');
    const vadaPavStore = await Shop.findOne({ shopName: 'Kumbh Snacks Corner', item: 'Vada Pav' });
    if (vadaPavStore) {
      console.log(`✓ Confirmed store: "${vadaPavStore.shopName}" sells "${vadaPavStore.item}" at genuine price ₹${vadaPavStore.price} with allowed max_price ₹${vadaPavStore.max_price} (Target: ₹30).`);
    }

    console.log('Database seeded and updated successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
