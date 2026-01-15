/**
 * Script to add test ticker events to Firebase
 * Run this to populate the ticker with sample data
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Import from backend (need to use require for CommonJS)
const backendPath = path.join(__dirname, '../backend');
const { initializeFirebase, addTickerEvent } = require(path.join(backendPath, 'dist/server/firebase_client.js'));

async function main() {
  console.log('🚀 Adding test ticker events to Firebase...\n');

  try {
    // Initialize Firebase
    initializeFirebase();

    // Add some test events
    const testEvents = [
      {
        type: '🏢',
        name: 'NYC Penthouse',
        val: '$2.5M',
        risk: 25
      },
      {
        type: '📄',
        name: 'Invoice #12345',
        val: '$50K',
        risk: 15
      },
      {
        type: '🏭',
        name: 'Factory Asset',
        val: '$1.2M',
        risk: 45
      },
      {
        type: '🏠',
        name: 'Commercial Property',
        val: '$800K',
        risk: 30
      },
      {
        type: '📊',
        name: 'Bond Portfolio',
        val: '$5M',
        risk: 20
      }
    ];

    for (const event of testEvents) {
      await addTickerEvent(event);
      console.log(`✅ Added: ${event.type} ${event.name} - ${event.val}`);
      // Small delay to ensure timestamps are different
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ All test events added!');
    console.log('📊 Check your frontend ticker - it should now show data!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Make sure backend is built: cd backend && npm run build');
    process.exit(1);
  }
}

main();

