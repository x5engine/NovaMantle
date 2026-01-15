#!/usr/bin/env node
/**
 * Test script to add ticker events to Firebase
 * This helps debug why the ticker isn't showing assets
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load service account
const serviceAccountPath = path.resolve(__dirname, '../backend/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestTickerEvents() {
  console.log('🧪 Adding test ticker events...\n');
  
  const testEvents = [
    {
      type: '🏠',
      name: 'Invoice #12345',
      val: '$150k',
      risk: 25,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      type: '📄',
      name: 'Property Deed - Main St',
      val: '$500k',
      risk: 15,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      type: '💼',
      name: 'Bond Certificate',
      val: '$100k',
      risk: 5,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  for (const event of testEvents) {
    try {
      await db.collection('ticker_events').add(event);
      console.log(`✅ Added: ${event.name} - ${event.val}`);
    } catch (error) {
      console.error(`❌ Failed to add ${event.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Test events added! Check the frontend ticker now.');
  
  // List all events
  const snapshot = await db.collection('ticker_events')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  
  console.log(`\n📊 Total events in Firebase: ${snapshot.size}`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.name} (${data.val}) - Risk: ${data.risk}%`);
  });
  
  process.exit(0);
}

addTestTickerEvents().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

