#!/bin/bash
# Add test ticker events to Firebase

cd "$(dirname "$0")/../backend"

echo "🧪 Adding test ticker events to Firebase..."
echo ""

node << 'EOF'
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account - try multiple possible locations
let serviceAccountPath = path.resolve(__dirname, '../backend/serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  serviceAccountPath = path.resolve(__dirname, '../backend/taximapma-firebase-adminsdk-fbsvc-d8d2316db9.json');
}
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account JSON not found');
  console.error('   Looking for: serviceAccountKey.json or taximapma-firebase-adminsdk-*.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestEvents() {
  const testEvents = [
    { type: '🏠', name: 'Invoice #12345', val: '$150k', risk: 25 },
    { type: '📄', name: 'Property Deed - Main St', val: '$500k', risk: 15 },
    { type: '💼', name: 'Bond Certificate', val: '$100k', risk: 5 },
    { type: '📋', name: 'Commercial Contract', val: '$200k', risk: 30 },
    { type: '🏢', name: 'Real Estate - Downtown', val: '$1M', risk: 20 }
  ];
  
  for (const event of testEvents) {
    try {
      await db.collection('ticker_events').add({
        ...event,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added: ${event.name} - ${event.val}`);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
  
  // Count events
  const snapshot = await db.collection('ticker_events').get();
  console.log(`\n📊 Total events in Firebase: ${snapshot.size}`);
  
  process.exit(0);
}

addTestEvents().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
EOF

echo ""
echo "✅ Test events added! Check the frontend ticker now."

